import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { fetchOutlets, fetchOutletPerformances, getOutletHealthBreakdown, getOutletTimeSeries } from '../services/outletPerformanceService';
import { getInsights } from '../services/dataService';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { Outlet, OutletPerformance, AIInsight, HealthScoreBreakdown, TimeSeriesPoint } from '../types';
import { getHealthCategoryBadgeClass } from '../services/healthScoreEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OutletDetail() {
  const { id } = useParams<{ id: string }>();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [performance, setPerformance] = useState<OutletPerformance | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [healthBreakdown, setHealthBreakdown] = useState<HealthScoreBreakdown | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [actionApproved, setActionApproved] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchOutlets(),
      fetchOutletPerformances(),
      getInsights(),
      getOutletHealthBreakdown(id),
    ]).then(([outs, perfs, insights, breakdown]) => {
      const foundOutlet = outs.find((o) => o.id === id) || null;
      const foundPerf = perfs.find((p) => p.outlet_id === id) || null;
      const foundInsight = insights.find((i) => i.related_outlet_id === id) || null;

      setOutlet(foundOutlet);
      setPerformance(foundPerf);
      setInsight(foundInsight);
      setHealthBreakdown(breakdown);
      setTimeSeries(getOutletTimeSeries(id, '30D'));
    });
  }, [id]);

  if (!outlet || !performance) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-sm">Loading outlet intelligence stream...</p>
      </div>
    );
  }

  const isGrowthPositive = performance.revenue_growth > 0;
  const targetPct = (performance.revenue / performance.target_revenue) * 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard/outlets" 
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
          title="Return to Outlets Performance Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{outlet.name}</h1>
            <Badge variant={outlet.status === 'Active' ? 'success' : 'warning'}>
              {outlet.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-500">
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {outlet.location}, {outlet.city}, {outlet.state}</span>
            <span>•</span>
            <span>Store Manager: <strong className="text-slate-700 font-semibold">{outlet.manager_name}</strong></span>
            <span>•</span>
            <span>Period: <strong className="text-slate-700 font-semibold">{performance.period}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Health Score Gauge */}
        <Card className="flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deterministic Health Score</span>
            <div className={cn(
              "text-4xl font-black rounded-3xl w-24 h-24 flex flex-col items-center justify-center shadow-inner border-2",
              (healthBreakdown?.totalScore || 80) >= 90 ? "bg-emerald-50 text-emerald-600 border-emerald-300" :
              (healthBreakdown?.totalScore || 80) >= 75 ? "bg-blue-50 text-blue-600 border-blue-300" :
              (healthBreakdown?.totalScore || 80) >= 60 ? "bg-amber-50 text-amber-600 border-amber-300" :
              "bg-rose-50 text-rose-600 border-rose-300"
            )}>
              <span>{healthBreakdown ? healthBreakdown.totalScore : performance.health_score}</span>
              <span className="text-[10px] uppercase font-bold opacity-60">/ 100</span>
            </div>
            <span className={cn("mt-3 px-3 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset", healthBreakdown ? getHealthCategoryBadgeClass(healthBreakdown.category) : 'bg-slate-100')}>
              {healthBreakdown ? healthBreakdown.category : performance.performance_status}
            </span>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Revenue</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(performance.revenue)}
              </div>
              <div className="mt-2 flex items-center text-xs font-bold">
                <span className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md", isGrowthPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                  {isGrowthPositive ? '+' : ''}{performance.revenue_growth}% MoM
                </span>
                <span className="text-slate-400 font-normal ml-2">vs prev cycle</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Achievement */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Achievement</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Target className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {targetPct.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Target: <strong className="font-mono text-slate-700">{formatCurrency(performance.target_revenue)}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Volume & AOV */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customers & AOV</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {formatNumber(performance.customers)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Average Order Value: <strong className="font-mono text-slate-800">₹{Math.round(performance.aov)}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HEALTH SCORE 4-FACTOR DETAILED BREAKDOWN (REQUIREMENT 4) */}
      {healthBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Health Score Deterministic Breakdown ({healthBreakdown.totalScore}/100)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Explainable weighting of target achievement (40%), revenue growth (30%), customer volume (15%), and ticket size (15%).
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Target Component */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Target Achievement</span>
                  <span className="font-mono text-indigo-600">{healthBreakdown.components.targetAchievement.score} / 40</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">Pace: {healthBreakdown.components.targetAchievement.valueFormatted}</div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(healthBreakdown.components.targetAchievement.score / 40) * 100}%` }} />
                </div>
              </div>

              {/* Growth Component */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Revenue Growth</span>
                  <span className="font-mono text-emerald-600">{healthBreakdown.components.revenueGrowth.score} / 30</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">MoM: {healthBreakdown.components.revenueGrowth.valueFormatted}</div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(healthBreakdown.components.revenueGrowth.score / 30) * 100}%` }} />
                </div>
              </div>

              {/* Customer Component */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Customer Traffic</span>
                  <span className="font-mono text-blue-600">{healthBreakdown.components.customerTraffic.score} / 15</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">Traffic Pace: {healthBreakdown.components.customerTraffic.valueFormatted}</div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(healthBreakdown.components.customerTraffic.score / 15) * 100}%` }} />
                </div>
              </div>

              {/* AOV Component */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>AOV Benchmark</span>
                  <span className="font-mono text-amber-600">{healthBreakdown.components.aovPerformance.score} / 15</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">{healthBreakdown.components.aovPerformance.valueFormatted}</div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(healthBreakdown.components.aovPerformance.score / 15) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Operational Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {healthBreakdown.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Friction & Drag Factors
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {healthBreakdown.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI PERFORMANCE AGENT INSIGHT CARD */}
      {insight && (
        <Card className="border-indigo-200 shadow-md shadow-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <FranchiseOpsLogo className="w-5 h-5 drop-shadow-sm" />
              <h3 className="font-bold text-sm">Agent Root Cause Diagnostic</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
              Confidence: {Math.round(insight.confidence * 100)}%
            </span>
          </div>
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-2">{insight.title}</h4>
            <p className="text-sm text-slate-700 mb-6 leading-relaxed">{insight.finding}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Detected Root Causes & Evidence
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {insight.possible_causes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                  {insight.evidence.map((ev, i) => (
                    <li key={`ev-${i}`} className="flex items-start gap-2 text-slate-500 italic">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span>Evidence: {ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Autonomous Remediation Plan
                  </h5>
                  <p className="text-emerald-800 leading-relaxed mb-4">{insight.recommendation}</p>
                </div>
                <div>
                  {actionApproved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                      <Check className="w-3.5 h-3.5" /> Action Approved & Dispatched to Regional Ops
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => setActionApproved(true)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Approve Action Plan
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OUTLET HISTORICAL REVENUE TRAJECTORY (REQUIREMENT 1 & 2) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">
            Historical Revenue Trajectory (30-Day Snapshot)
          </CardTitle>
          <p className="text-xs text-slate-500">
            Actual daily store sales vs scheduled pacing targets.
          </p>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOutletRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#colorOutletRev)" name="Actual Revenue" />
              <Area type="step" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" fill="none" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
