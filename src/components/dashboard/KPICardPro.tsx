import React, { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

export interface SparklinePoint {
  value: number;
}

export interface KPICardProProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  deltaPercent: number;
  sparklineData: SparklinePoint[];
  targetValue?: number;
  periodLabel?: string;
  tooltipText?: string;
}

export function KPICardPro({
  title,
  value,
  isCurrency = false,
  deltaPercent,
  sparklineData,
  targetValue,
  periodLabel,
  tooltipText,
}: KPICardProProps) {
  const gradientId = useId().replace(/:/g, '');
  const isPositive = deltaPercent > 0;
  const isNeutral = deltaPercent === 0;

  const targetPct = targetValue 
    ? Math.min(Math.round((value / targetValue) * 100), 100) 
    : null;

  const strokeColor = isPositive ? '#10b981' : isNeutral ? '#6366f1' : '#f43f5e';
  const defaultPeriodLabel = isPositive || !isNeutral ? 'vs last month' : '';
  const displayPeriodLabel = periodLabel ?? defaultPeriodLabel;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
      {/* Top Bar: Title & Delta Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              {title}
            </span>
            {tooltipText && (
              <div 
                className="cursor-help text-slate-400 hover:text-slate-600 shrink-0 transition-colors" 
                title={tooltipText}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Delta Pill */}
          <div
            className={cn(
              "inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0",
              isPositive
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                : isNeutral
                ? "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : isNeutral ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{isPositive ? `+${deltaPercent}%` : `${deltaPercent}%`}</span>
          </div>
        </div>

        {/* Metric Value & Sparkline */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {isCurrency ? formatCurrency(value) : formatNumber(value)}
            </div>
            {displayPeriodLabel && (
              <span className="text-xs text-slate-400 mt-1 block">
                {displayPeriodLabel}
              </span>
            )}
          </div>

          {/* Micro Sparkline Chart */}
          <div className="h-12 w-24 sm:w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id={`sparkline-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill={`url(#sparkline-${gradientId})`}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Target Progress Bar (Optional) */}
      {targetValue !== undefined && targetPct !== null && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex-1 mr-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  targetPct >= 90
                    ? "bg-emerald-500"
                    : targetPct >= 75
                    ? "bg-indigo-500"
                    : "bg-amber-500"
                )}
                style={{ width: `${targetPct}%` }}
              />
            </div>
          </div>
          <span className="text-slate-500 font-medium whitespace-nowrap">
            {targetPct}% of target
          </span>
        </div>
      )}
    </div>
  );
}
