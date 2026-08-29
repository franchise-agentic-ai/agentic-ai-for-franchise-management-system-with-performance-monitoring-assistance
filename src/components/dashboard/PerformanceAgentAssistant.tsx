import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Send, CheckCircle2, ChevronRight, CornerDownLeft, RefreshCw, Zap } from 'lucide-react';
import { queryOutletPerformanceAgent } from '../../services/geminiAgent';
import { OutletBenchmarking, RevenueTrendAnalysis, UnderperformanceDetection } from '../../types';
import { Button } from '../ui/Button';

interface PerformanceAgentAssistantProps {
  benchmarking?: OutletBenchmarking[];
  revenueTrends?: RevenueTrendAnalysis | null;
  underperforming?: UnderperformanceDetection[];
}

export function PerformanceAgentAssistant({
  benchmarking = [],
  revenueTrends = null,
  underperforming = [],
}: PerformanceAgentAssistantProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    answer: string;
    relatedOutlets: string[];
    keyMetrics: string[];
    isAiGenerated: boolean;
  } | null>({
    answer: `Currently, **2 outlets** are flagged as underperforming: **Biryani Hub - Indiranagar (Health: 64/100)** and **Biryani Hub - KP (Health: 58/100)**.\n\n` +
      `• **Pune (KP):** Facing -17.14% revenue contraction and 72.5% target achievement due to localized roadworks reducing walk-in footfall and spice stockouts.\n` +
      `• **Indiranagar:** Kitchen chef absenteeism causing +8m service delays and 13.95% MoM sales slump.\n\n` +
      `**Recommended Action:** Deploy delivery promos in Pune and transfer float kitchen staff to Indiranagar for the weekend rush.`,
    relatedOutlets: ['Biryani Hub - Indiranagar', 'Biryani Hub - KP'],
    keyMetrics: ['Network Avg Health: 79/100', '2 Outlets Requiring Action', 'Franchise Growth: +2.4% MoM'],
    isAiGenerated: false,
  });

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    setLoading(true);
    setQuery(questionText);
    try {
      const result = await queryOutletPerformanceAgent(questionText, {
        benchmarking,
        revenueTrends,
        underperforming,
      });
      setResponse(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Which outlets are underperforming?',
    'Why is Pune revenue declining?',
    'Which outlet has the highest growth?',
    'What should management prioritize today?',
  ];

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Outlet Performance Agent</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                Autonomous Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synthesizing real-time franchise signals, anomaly diagnostics, and operational priorities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Agent Active & Ingesting Signals
          </span>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
        className="relative mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the Performance Agent anything regarding store growth, anomalies, or sales..."
          className="w-full pl-4 pr-28 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-3 py-1.5 h-auto flex items-center gap-1 cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Ask Agent <Send className="w-3 h-3" />
            </>
          )}
        </Button>
      </form>

      {/* Response Box */}
      {response && (
        <div className="rounded-2xl bg-white p-5 border border-indigo-100/80 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Agent Diagnostic Synthesis
              </span>
            </div>
            {response.isAiGenerated ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-600" /> Gemini Live Analysis
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Deterministic Agent Engine
              </span>
            )}
          </div>

          <div 
            className="text-sm text-slate-800 leading-relaxed font-normal mb-4 whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: response.answer
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
            }}
          />

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold">Key Signals:</span>
              {response.keyMetrics.map((km, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                  {km}
                </span>
              ))}
            </div>

            {response.relatedOutlets.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Related: {response.relatedOutlets.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
