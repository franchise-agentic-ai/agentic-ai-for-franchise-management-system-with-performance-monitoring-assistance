import React from 'react';
import { X, CheckCircle2, AlertTriangle, Target, TrendingUp, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { HealthScoreBreakdown } from '../../types';
import { getHealthCategoryBadgeClass } from '../../services/healthScoreEngine';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface HealthScoreModalProps {
  outletName: string;
  breakdown: HealthScoreBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HealthScoreModal({
  outletName,
  breakdown,
  isOpen,
  onClose,
}: HealthScoreModalProps) {
  if (!isOpen || !breakdown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close health score details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6 pr-8">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-extrabold shadow-sm border",
            breakdown.totalScore >= 90 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
            breakdown.totalScore >= 75 ? "bg-blue-50 text-blue-600 border-blue-200" :
            breakdown.totalScore >= 60 ? "bg-amber-50 text-amber-600 border-amber-200" :
            "bg-rose-50 text-rose-600 border-rose-200"
          )}>
            <span className="text-2xl leading-none">{breakdown.totalScore}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{outletName}</h2>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset", getHealthCategoryBadgeClass(breakdown.category))}>
                {breakdown.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic 4-factor health score calculated from live POS & operational streams.
            </p>
          </div>
        </div>

        {/* 4 Factor Component Breakdown */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Score Methodology Breakdown</h3>
          
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {/* 1. Target Achievement */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  Target Achievement ({breakdown.components.targetAchievement.valueFormatted})
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {breakdown.components.targetAchievement.score} / {breakdown.components.targetAchievement.max} pts
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.components.targetAchievement.score / breakdown.components.targetAchievement.max) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Revenue Growth */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  MoM Revenue Growth ({breakdown.components.revenueGrowth.valueFormatted})
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {breakdown.components.revenueGrowth.score} / {breakdown.components.revenueGrowth.max} pts
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.components.revenueGrowth.score / breakdown.components.revenueGrowth.max) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Customer Traffic */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Customer Footfall Pace ({breakdown.components.customerTraffic.valueFormatted})
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {breakdown.components.customerTraffic.score} / {breakdown.components.customerTraffic.max} pts
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.components.customerTraffic.score / breakdown.components.customerTraffic.max) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. AOV Performance */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  AOV vs Network Benchmark ({breakdown.components.aovPerformance.valueFormatted})
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {breakdown.components.aovPerformance.score} / {breakdown.components.aovPerformance.max} pts
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.components.aovPerformance.score / breakdown.components.aovPerformance.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Operational Strengths
            </h4>
            <ul className="space-y-2">
              {breakdown.strengths.map((st, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Operational Drag Factors
            </h4>
            <ul className="space-y-2">
              {breakdown.weaknesses.map((wk, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Focus Action */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            AI Recommended Focus
          </span>
          <p className="text-xs text-indigo-950 font-medium leading-relaxed">
            {breakdown.recommendedFocus}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
