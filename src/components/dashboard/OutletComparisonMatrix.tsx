import React, { useState, useEffect } from 'react';
import { OutletBenchmarking } from '../../types';
import { formatCurrency, formatNumber, cn } from '../../lib/utils';
import { getHealthCategoryBadgeClass } from '../../services/healthScoreEngine';
import { getBenchmarkingData } from '../../services/outletPerformanceService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Check, ArrowUpRight, ArrowDownRight, Layers, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface OutletComparisonMatrixProps {
  outlets?: OutletBenchmarking[];
}

export function OutletComparisonMatrix({ outlets: propOutlets }: OutletComparisonMatrixProps) {
  const [outlets, setOutlets] = useState<OutletBenchmarking[]>(propOutlets || []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (propOutlets && propOutlets.length > 0) {
      setOutlets(propOutlets);
      setSelectedIds(propOutlets.slice(0, 3).map((o) => o.outletId));
    } else {
      const load = async () => {
        const data = await getBenchmarkingData();
        setOutlets(data);
        setSelectedIds(data.slice(0, 3).map((o) => o.outletId));
      };
      load();
    }
  }, [propOutlets]);

  const toggleOutlet = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedOutlets = outlets.filter((o) => selectedIds.includes(o.outletId));

  const chartData = selectedOutlets.map((o) => ({
    name: o.name.split(' - ')[1] || o.name,
    Actual: Math.round(o.revenue / 100000),
    Target: Math.round((o.revenue / (o.targetAchievement / 100)) / 100000),
    HealthScore: o.healthScore,
  }));

  if (outlets.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading outlet comparison matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector Pill Row */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Outlets to Compare (Select 2 to 4 locations)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {selectedIds.length} of 4 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {outlets.map((outlet) => {
            const isSelected = selectedIds.includes(outlet.outletId);
            return (
              <button
                key={outlet.outletId}
                onClick={() => toggleOutlet(outlet.outletId)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{outlet.name}</span>
                <span className={cn("px-1.5 py-0.2 rounded-md text-[10px]", isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                  {outlet.healthScore}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side by Side Comparative Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700 w-48">Metric / KPI</th>
              {selectedOutlets.map((outlet) => (
                <th key={outlet.outletId} className="px-6 py-4 font-bold text-slate-900 min-w-44">
                  <div>{outlet.name}</div>
                  <span className="text-[11px] text-slate-500 font-normal">{outlet.city}, {outlet.state}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Rank */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Network Rank</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-bold text-slate-900">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                    #{o.rank}
                  </span>
                </td>
              ))}
            </tr>

            {/* Health Score */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Health Score</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold">{o.healthScore}/100</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ring-inset", getHealthCategoryBadgeClass(o.category))}>
                      {o.category}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Revenue */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Monthly Revenue</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-mono font-bold text-slate-900 text-base">
                  {formatCurrency(o.revenue)}
                </td>
              ))}
            </tr>

            {/* MoM Growth */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">MoM Growth</td>
              {selectedOutlets.map((o) => {
                const isPos = o.revenueGrowth > 0;
                return (
                  <td key={o.outletId} className="px-6 py-3.5 font-bold">
                    <span className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold", isPos ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isPos ? '+' : ''}{o.revenueGrowth}%
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Target Achievement */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Target Achievement</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                      <div 
                        className={cn("h-full rounded-full", o.targetAchievement >= 100 ? "bg-emerald-500" : o.targetAchievement >= 85 ? "bg-indigo-500" : "bg-amber-500")}
                        style={{ width: `${Math.min(o.targetAchievement, 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{o.targetAchievement.toFixed(1)}%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Customers */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Customers Served</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-mono text-slate-800">
                  {formatNumber(o.customers)}
                </td>
              ))}
            </tr>

            {/* Orders */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Orders Processed</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-mono text-slate-800">
                  {formatNumber(o.orders)}
                </td>
              ))}
            </tr>

            {/* AOV */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Average Order Value (AOV)</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                  ₹{Math.round(o.aov)}
                </td>
              ))}
            </tr>

            {/* Risk Status */}
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-3.5 font-semibold text-slate-600">Operational Risk Status</td>
              {selectedOutlets.map((o) => (
                <td key={o.outletId} className="px-6 py-3.5">
                  {o.isUnderperforming ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Flagged Underperforming
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optimal Operations
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Visual Target vs Actual Bar Chart for Selected Outlets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Revenue vs Target Comparison (in ₹ Lakhs)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₹${v}L`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                formatter={(val: number) => [`₹${val} Lakhs`, undefined]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="Actual" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Actual Revenue (₹L)" />
              <Bar dataKey="Target" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Monthly Target (₹L)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
