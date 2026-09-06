import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Cpu,
  Database,
  BarChart3,
  Megaphone,
  ClipboardCheck,
  Flame,
  Activity,
  History
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, logTenantActivity } from '../services/tenantService';
import { runBusinessAgentOrchestrator, clearConversationHistory, AgentStructuredOutput } from '../services/businessAgentOrchestrator';
import { BusinessProfile } from '../types';
import { cn } from '../lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  keyMetrics?: string[];
  relatedOutlets?: string[];
  toolsCalled?: string[];
  dataSources?: string[];
  isAiGenerated?: boolean;
  intent?: string;
  suggestedAction?: {
    label: string;
    actionType: string;
    payload?: any;
  };
}

export function AICopilotPage() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello! I am your FranchiseOps AI Copilot — a real-time Business-Aware Agent connected directly to your ${business.name} telemetry.\n\nI have full observability across Sales, Inventory, Staff Rosters, Marketing ROAS, and SOP Compliance. Ask me anything to investigate performance, diagnose root causes, or trigger operational automations.`,
      timestamp: 'Just now',
      keyMetrics: ['Active Telemetry Connected', 'Cross-Domain Correlation Active', 'Conversational Memory Ready'],
      relatedOutlets: ['Gachibowli', 'Indiranagar', 'T Nagar', 'Bandra', 'KP', 'Benz Circle', 'MVP Colony'],
      toolsCalled: ['get_franchise_summary', 'get_health_scores'],
      dataSources: ['Sales', 'Inventory', 'Staff', 'Audits', 'Marketing']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStep, setAgentStep] = useState<string>('Ready');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Performance' | 'Inventory' | 'Staff' | 'Marketing' | 'Risk'>('All');
  const [actionDone, setActionDone] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTenantChange = () => {
    const current = getActiveBusiness();
    setBusiness(current);
  };

  useEffect(() => {
    window.addEventListener('franchiseops_tenant_changed', handleTenantChange);
    return () => window.removeEventListener('franchiseops_tenant_changed', handleTenantChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, agentStep]);

  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const processingSteps = [
    "Understanding your question...",
    "Checking business data...",
    "Analyzing relevant metrics...",
    "Generating insights..."
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);
    setProcessingStepIndex(0);

    // Natural message rotation every 650ms during the ~2 second processing window
    const intervalId = setInterval(() => {
      setProcessingStepIndex(prev => (prev < processingSteps.length - 1 ? prev + 1 : prev));
    }, 650);

    // Minimum 2 second presentation duration
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    const queryPromise = runBusinessAgentOrchestrator(textToSend, business.id, {
      currentPage: 'copilot'
    });

    try {
      const [result] = await Promise.all([queryPromise, minDelayPromise]);

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyMetrics: result.key_metrics,
        relatedOutlets: result.related_outlets,
        toolsCalled: result.tools_called,
        dataSources: result.data_sources,
        isAiGenerated: result.isAiGenerated,
        intent: result.intent,
        suggestedAction: result.suggested_action
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error('Copilot processing error:', e);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'assistant',
          text: `I encountered an operational error retrieving data for your query. Please ensure data streams are active for ${business.name}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      clearInterval(intervalId);
      setIsProcessing(false);
      setProcessingStepIndex(0);
    }
  };

  const handleExecuteAction = (actionLabel: string, actionType: string) => {
    setActionDone(actionLabel);
    logTenantActivity(business.id, 'Franchise Intelligence Engine', `Executed agent action: '${actionLabel}' (${actionType})`);
    setTimeout(() => setActionDone(null), 5000);
  };

  const handleResetContext = () => {
    clearConversationHistory(business.id);
    setMessages([
      {
        id: 'msg_reset',
        sender: 'assistant',
        text: `Conversational context has been reset for **${business.name}**. What operational question or diagnostic would you like to explore next?`,
        timestamp: 'Just now',
        keyMetrics: ['Context Cleaned', 'Ready for new query'],
        toolsCalled: ['clear_conversation_history']
      }
    ]);
  };

  const categorizedPrompts: Record<string, string[]> = {
    All: [
      "Which outlet is performing best?",
      "Which outlet has the highest inventory risk?",
      "Why is Biryani Hub - KP underperforming?",
      "Which marketing campaign has the best ROI?",
      "Where do we have staffing shortages?",
      "Give me an executive summary of my business",
      "Compare Biryani Hub - Bandra and Biryani Hub - KP",
      "What actions should management take today?"
    ],
    Performance: [
      "Which outlet is performing best?",
      "Which outlet has the highest revenue growth?",
      "Which outlets are below their targets?",
      "Why did revenue decrease this month?",
      "Compare the top performing and worst performing outlets",
      "Why is Biryani Hub - Indiranagar trailing?"
    ],
    Inventory: [
      "Which outlet has the highest inventory risk?",
      "Show me stockout risks and safety buffers across all locations",
      "Which SKUs are below minimum safety stock?",
      "What is our supply chain risk in Pune?"
    ],
    Staff: [
      "Where do we have staffing shortages?",
      "Show me shift attendance rates by outlet",
      "Which outlet has kitchen chef absenteeism?",
      "How do staff shortages impact order preparation latency?"
    ],
    Marketing: [
      "Which marketing campaign has the best ROI?",
      "How is our marketing performing across regions?",
      "Recommend a marketing promotion to lift dine-in footfall in Pune",
      "What is our customer acquisition conversion rate?"
    ],
    Risk: [
      "What are the top three operational risks across the business?",
      "Show me all open audit compliance issues",
      "Which outlets need immediate management attention?",
      "What actions should management take today?"
    ]
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FranchiseOpsLogo className="w-7 h-7 drop-shadow-sm" />
              FranchiseOps AI Copilot
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Business-Aware Agent Active
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Observability over <strong>{business.name}</strong></span>
            <span>•</span>
            <span>Live Data Retrieval</span>
            <span>•</span>
            <span>Cross-Domain Reasoning</span>
          </p>
        </div>

        {/* Action / Context Reset Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetContext}
            className="text-xs text-slate-600 hover:text-slate-900 border-slate-200 flex items-center gap-1.5 bg-white shadow-2xs"
            title="Reset conversational memory"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Context
          </Button>

          {/* Category Tabs */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {(['All', 'Performance', 'Inventory', 'Staff', 'Marketing', 'Risk'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeCategory === cat 
                    ? "bg-white text-indigo-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Done Banner */}
      {actionDone && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Action Executed & Dispatched: <strong>{actionDone}</strong></span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono uppercase tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded-md">
            Logged in Activity Registry
          </span>
        </div>
      )}

      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white">
        {/* Messages Scroll View */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 max-w-3xl",
                msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {msg.sender === 'assistant' ? (
                <FranchiseOpsLogo className="w-8 h-8 shrink-0 drop-shadow-sm mt-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs">
                  HQ
                </div>
              )}

              <div className="space-y-2 flex-1 min-w-0">
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs leading-relaxed",
                    msg.sender === 'user'
                      ? "bg-indigo-600 text-white font-medium rounded-tr-xs shadow-xs"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs"
                  )}
                >
                  {/* Message Body with Markdown styling */}
                  <div className="whitespace-pre-line prose prose-xs max-w-none prose-table:my-2 prose-th:p-2 prose-td:p-2">
                    {msg.text}
                  </div>

                  {/* Key Metrics Chips */}
                  {msg.keyMetrics && msg.keyMetrics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {msg.keyMetrics.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-indigo-700 border border-indigo-100 shadow-2xs">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tools Executed & Data Sources Badge Footer */}
                  {msg.sender === 'assistant' && (msg.toolsCalled || msg.dataSources) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                      {msg.toolsCalled && msg.toolsCalled.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-indigo-500" />
                          <span className="font-semibold text-slate-600">Tools:</span>
                          <span className="font-mono text-[9px] text-indigo-600">{msg.toolsCalled.join(', ')}</span>
                        </div>
                      )}
                      {msg.dataSources && msg.dataSources.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-500" />
                          <span className="font-semibold text-slate-600">Sources:</span>
                          <span className="text-[9px] text-slate-600">{msg.dataSources.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested 1-Click Action Button */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 bg-indigo-50/50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-950">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Recommended AI Action</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleExecuteAction(msg.suggestedAction!.label, msg.suggestedAction!.actionType)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        {msg.suggestedAction.label}
                      </Button>
                    </div>
                  )}
                </div>

                <span className={cn(
                  "text-[10px] text-slate-400 block px-1",
                  msg.sender === 'user' ? "text-right" : "text-left"
                )}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Dynamic Real-time Agent Progress State (2s Professional Processing) */}
          {isProcessing && (
            <div className="flex items-start gap-3 mr-auto max-w-xl animate-in fade-in duration-300">
              <div className="relative shrink-0 mt-0.5">
                <FranchiseOpsLogo className="w-8 h-8 drop-shadow-md animate-pulse" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white animate-ping" />
              </div>

              <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm space-y-2.5 text-xs w-full">
                {/* Header & Flow pill */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {/* Three pulsing / bouncing dots */}
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                    </div>
                    <span className="font-bold text-indigo-950 text-xs">
                      AI Agent Processing
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    UNDERSTAND → ANALYZE → RESPOND
                  </span>
                </div>

                {/* Rotating status message */}
                <div className="flex items-center gap-2 text-slate-700 font-medium py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                  <span className="transition-all duration-300 text-xs text-slate-800 font-medium">
                    {processingSteps[processingStepIndex]}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Categorized Prompts Carousel */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" /> Suggested:
          </span>
          {(categorizedPrompts[activeCategory] || categorizedPrompts.All).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs hover:border-indigo-200 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder={`Ask AI Copilot about any outlet, supply buffer, revenue variance, or request actions for ${business.name}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />

          <Button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
