import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BrainCircuit, 
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
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness } from '../services/tenantService';
import { askBusinessAssistant } from '../services/franchiseIntelligenceEngine';
import { BusinessProfile } from '../types';
import { cn } from '../lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  keyMetrics?: string[];
  relatedOutlets?: string[];
  isAiGenerated?: boolean;
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
      text: `Hello! I am your FranchiseOps AI Copilot. I have real-time observability over your ${business.name} operations, including sales streams, inventory buffers, shift attendances, marketing ROI, and unit EBITDA margins.\n\nHow can I assist you with your franchise network today?`,
      timestamp: 'Just now',
      keyMetrics: ['7 Active Outlets', '₹1.72 Cr Monthly Run-rate', '91.8% Target Achievement'],
      relatedOutlets: ['Gachibowli', 'Indiranagar', 'T Nagar', 'Bandra', 'KP', 'Benz Circle', 'MVP Colony']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'All' | 'Performance' | 'Inventory' | 'Staff' | 'Finance'>('All');
  const [actionDone, setActionDone] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

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

    try {
      const reply = await askBusinessAssistant(textToSend, business.id);

      let action = undefined;
      if (textToSend.toLowerCase().includes('staff') || textToSend.toLowerCase().includes('indiranagar')) {
        action = { label: 'Dispatch Float Staff to Indiranagar', actionType: 'dispatch_staff' };
      } else if (textToSend.toLowerCase().includes('inventory') || textToSend.toLowerCase().includes('stock') || textToSend.toLowerCase().includes('reorder')) {
        action = { label: 'Approve & Dispatch Emergency PO', actionType: 'dispatch_po' };
      } else if (textToSend.toLowerCase().includes('pune') || textToSend.toLowerCase().includes('promo')) {
        action = { label: 'Launch 20% Zomato Promo Booster', actionType: 'launch_promo' };
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: reply.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyMetrics: reply.keyMetrics,
        relatedOutlets: reply.relatedOutlets,
        isAiGenerated: reply.isAiGenerated,
        suggestedAction: action
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAction = (actionLabel: string) => {
    setActionDone(actionLabel);
    setTimeout(() => setActionDone(null), 4000);
  };

  const samplePrompts = [
    "Which outlets have the highest risk of missing monthly revenue targets?",
    "Show me stockout risks and reorder quantities across all locations.",
    "Why is Indiranagar underperforming and how do we resolve it?",
    "What is our consolidated EBITDA margin and top cost driver?",
    "Recommend a marketing campaign to lift dine-in footfall in Pune."
  ];

  return (
    <div className="space-y-6 pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-7 h-7 text-indigo-600" />
              FranchiseOps AI Copilot
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Multi-Agent Orchestrator
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ask complex natural-language questions, trigger multi-outlet automations, and diagnose unit economics.
          </p>
        </div>

        {/* Agent Filter pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {(['All', 'Performance', 'Inventory', 'Staff', 'Finance'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveAgent(mode)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeAgent === mode 
                  ? "bg-white text-indigo-600 shadow-xs" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toast */}
      {actionDone && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully Executed: {actionDone}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono">Agent Action Completed</span>
        </div>
      )}

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
        {/* Messages scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 max-w-3xl",
                msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {msg.sender === 'assistant' ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BrainCircuit className="w-4.5 h-4.5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  HQ
                </div>
              )}

              <div className="space-y-2">
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs leading-relaxed",
                    msg.sender === 'user'
                      ? "bg-indigo-600 text-white font-medium rounded-tr-xs"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Key Metrics Chips */}
                  {msg.keyMetrics && msg.keyMetrics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {msg.keyMetrics.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-indigo-700 border border-indigo-100 shadow-2xs">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Related Outlets */}
                  {msg.relatedOutlets && msg.relatedOutlets.length > 0 && (
                    <div className="mt-2 text-[10px] text-slate-500">
                      <strong>Referenced Units:</strong> {msg.relatedOutlets.join(', ')}
                    </div>
                  )}

                  {/* Suggested 1-click action */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900">Recommended Agent Action</span>
                      <Button
                        size="sm"
                        onClick={() => handleExecuteAction(msg.suggestedAction!.label)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" />
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

          {isProcessing && (
            <div className="flex items-start gap-3 mr-auto max-w-xl animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="font-bold text-indigo-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Querying Multi-Agent Intelligence Engine...
                </div>
                <span>Correlating cross-domain signals across sales, stock, staff, and marketing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Suggested:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
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
            placeholder="Ask AI Copilot about any outlet, supply buffer, revenue variance, or request actions..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <Button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
