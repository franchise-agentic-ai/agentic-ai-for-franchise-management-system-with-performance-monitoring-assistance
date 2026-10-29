import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Package, 
  Users, 
  Megaphone, 
  ClipboardCheck,
  Layers
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantSales 
} from '../services/tenantService';
import { 
  getTenantInsights, 
  getTenantRecommendations, 
  runFullBusinessAnalysis, 
  updateRecommendationStatus, 
  askBusinessAssistant 
} from '../services/franchiseIntelligenceEngine';
import { CrossDomainInsight, Recommendation, BusinessProfile } from '../types';
import { cn } from '../lib/utils';

export function IntelligenceWorkspace() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [insights, setInsights] = useState<CrossDomainInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanAgent, setActiveScanAgent] = useState('');

  // AI Assistant Chat State
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [assistantReply, setAssistantReply] = useState<{
    answer: string;
    keyMetrics: string[];
    relatedOutlets: string[];
    isAiGenerated: boolean;
  } | null>(null);

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    setInsights(getTenantInsights(biz.id));
    setRecommendations(getTenantRecommendations(biz.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    window.addEventListener('franchiseops_insights_updated', loadData);
    window.addEventListener('franchiseops_recs_updated', loadData);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', loadData);
      window.removeEventListener('franchiseops_insights_updated', loadData);
      window.removeEventListener('franchiseops_recs_updated', loadData);
    };
  }, []);

  const handleRunAnalysis = async () => {
    setIsScanning(true);
    const agentSteps = [
      'Outlet Performance Agent (Evaluating sales velocities & health scores)',
      'Inventory Agent (Scanning stockout risks & supply buffers)',
      'Staff Agent (Checking workforce attendance & kitchen fulfillment)',
      'Marketing Agent (Evaluating campaign ROI & conversion rates)',
      'Audit Agent (Auditing SOP compliance & ticket latency)',
      'Franchise Intelligence Synthesis (Cross-correlating multi-agent signals)...'
    ];

    for (const step of agentSteps) {
      setActiveScanAgent(step);
      await new Promise(r => setTimeout(r, 450));
    }

    const res = await runFullBusinessAnalysis(business.id);
    setInsights(res.insights);
    setRecommendations(res.recommendations);
    setIsScanning(false);
    setActiveScanAgent('');
  };

  const [assistantStepIndex, setAssistantStepIndex] = useState(0);
  const assistantSteps = [
    "Understanding your question...",
    "Checking business data...",
    "Analyzing relevant metrics...",
    "Generating insights..."
  ];

  const handleAskAssistant = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsAsking(true);
    setAssistantStepIndex(0);
    setQuery(questionText);

    // Rotate through status messages every 650ms during the ~2 second processing period
    const intervalId = setInterval(() => {
      setAssistantStepIndex(prev => (prev < assistantSteps.length - 1 ? prev + 1 : prev));
    }, 650);

    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    const queryPromise = askBusinessAssistant(questionText, business.id);

    try {
      const [res] = await Promise.all([queryPromise, minDelayPromise]);
      setAssistantReply(res);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(intervalId);
      setIsAsking(false);
      setAssistantStepIndex(0);
    }
  };

  const sampleQueries = [
    'Which outlet has the worst staff attendance?',
    'Which campaign has the highest ROI?',
    'Where do we have staff shortages?',
    'Which marketing campaign is wasting money?',
    'Is our current workforce sufficient for the campaign?',
    'Which employees have the highest productivity?'
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Franchise Intelligence & Multi-Agent Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              {business.name}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Autonomous multi-agent orchestration cross-correlating signals across sales, supply chain, workforce, marketing, and SOP compliance.
          </p>
        </div>

        <Button
          onClick={handleRunAnalysis}
          disabled={isScanning}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs px-5 py-2.5 h-auto flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer self-start lg:self-auto"
        >
          {isScanning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-amber-300" />
          )}
          {isScanning ? 'Running Agent Scan...' : 'Analyze My Business'}
        </Button>
      </div>

      {/* SCANNING PROGRESS OVERLAY / BANNER */}
      {isScanning && (
        <div className="p-4 rounded-2xl bg-indigo-900 text-white border border-indigo-700 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <FranchiseOpsLogo className="w-8 h-8 animate-pulse shrink-0 drop-shadow-md" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Agent Orchestrator Running</div>
              <div className="text-sm font-semibold text-white">{activeScanAgent}</div>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-200">Processing signals...</span>
        </div>
      )}

      {/* 5 SPECIALIZED AGENTS STATUS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { name: 'Outlet Performance', icon: TrendingUp, status: 'Active', desc: 'Health & sales pacing' },
          { name: 'Inventory Agent', icon: Package, status: 'Active', desc: 'Predictive stockouts' },
          { name: 'Staff Agent', icon: Users, status: 'Active', desc: 'Workforce attendance' },
          { name: 'Marketing Agent', icon: Megaphone, status: 'Active', desc: 'ROAS & conversion' },
          { name: 'Audit Agent', icon: ClipboardCheck, status: 'Active', desc: 'SOP compliance' },
        ].map((ag, idx) => {
          const Icon = ag.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{ag.name}</h4>
                <p className="text-[10px] text-slate-500">{ag.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI BUSINESS ASSISTANT INTERACTIVE CONVERSATION PANEL */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FranchiseOpsLogo className="w-9 h-9 drop-shadow-md shrink-0" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900">AI Business Assistant</CardTitle>
                <p className="text-xs text-slate-500">Instant answers grounded strictly in {business.name}'s live operational data.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Tenant Context
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              'Which outlet has the highest churn or sales drop?',
              'Show me stockout risks across all locations for this week.',
              'Analyze staff attendance and float reallocation opportunities.',
              'What are our top 3 campaign ROIs by outlet?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAssistant(q)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAssistant(query);
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder={`Ask the Franchise AI Assistant anything regarding ${business.name}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-4 pr-24 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white shadow-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isAsking || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              {isAsking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>Ask <Send className="w-3 h-3 ml-1" /></>}
            </Button>
          </form>

          {isAsking && (
            <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-2.5 animate-in fade-in duration-300 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                  </div>
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <FranchiseOpsLogo className="w-3.5 h-3.5 animate-pulse" /> AI Agent Processing
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  UNDERSTAND → ANALYZE → RESPOND
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                <span className="text-xs text-slate-800 font-medium transition-all duration-300">
                  {assistantSteps[assistantStepIndex]}
                </span>
              </div>
            </div>
          )}

          {!isAsking && assistantReply && (
            <div className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <FranchiseOpsLogo className="w-3.5 h-3.5" /> Assistant Operational Diagnostic
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {assistantReply.isAiGenerated ? 'Gemini 2.0 Flash' : 'Deterministic Engine'}
                </span>
              </div>
              <div 
                className="text-xs text-slate-800 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: assistantReply.answer.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                }}
              />
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {assistantReply.keyMetrics.map((km, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                    {km}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CROSS-DOMAIN INSIGHTS & RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Insights Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FranchiseOpsLogo className="w-5 h-5" />
              Proactive AI Insights ({insights.length})
            </h3>
            <span className="text-xs text-slate-500">Cross-Agent Findings</span>
          </div>

          {insights.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
              No active findings yet. Click <strong>"Analyze My Business"</strong> above to trigger multi-agent evaluation.
            </div>
          ) : (
            insights.map((ins) => (
              <div key={ins.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-1">
                      {ins.primary_agent} • {ins.correlated_agents.join(' + ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{ins.title}</h4>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    ins.priority === 'Critical' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    ins.priority === 'High' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  )}>
                    {ins.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">{ins.finding}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-700 text-[11px] block">Correlated Evidence:</span>
                  {ins.evidence.map((ev, i) => (
                    <div key={i} className="text-slate-600 text-[11px] flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-950 block mb-0.5">Recommended Remediation:</span>
                  <p className="text-indigo-900">{ins.recommendation}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Human-in-the-Loop Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Actionable Recommendations ({recommendations.length})
            </h3>
            <span className="text-xs text-slate-500">Human-In-The-Loop Approval</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
              No pending actions. Agent scans will generate actionable operational directives automatically.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    rec.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    rec.status === 'Rejected' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {rec.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Operational Rationale:</span>
                  <p className="text-slate-600">{rec.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Source: {rec.related_agent}</span>
                  {rec.status === 'Approved' ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Action Dispatched to Regional Ops
                    </span>
                  ) : rec.status === 'Rejected' ? (
                    <span className="text-slate-400 font-medium">Dismissed by Manager</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateRecommendationStatus(business.id, rec.id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Approve Action
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateRecommendationStatus(business.id, rec.id, 'Rejected')}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
