import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  Download, 
  Printer, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Table, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantOutlets, getTenantSales, getTenantInventory } from '../services/tenantService';
import { getBenchmarkingData } from '../services/outletPerformanceService';
import { BusinessProfile, OutletBenchmarking } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';

export function ReportsPage() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [benchmarks, setBenchmarks] = useState<OutletBenchmarking[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('executive');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('October 2023 (Trailing 30D)');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getBenchmarkingData();
      setBenchmarks(data);
    };
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExport = (format: 'csv' | 'json' | 'print') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (format === 'print') {
        window.print();
        return;
      }

      const reportData = {
        title: `FranchiseOps AI - ${selectedReport.toUpperCase()} REPORT`,
        business: business.name,
        timeframe: selectedTimeframe,
        generatedAt: new Date().toISOString(),
        networkData: benchmarks,
      };

      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `franchiseops-${selectedReport}-report.json`;
        a.click();
      } else if (format === 'csv') {
        const headers = "Outlet ID,Outlet Name,City,State,Revenue,Growth %,Target Achievement %,Customers,AOV,Health Score,Category\n";
        const rows = benchmarks.map(b => 
          `"${b.outletId}","${b.name}","${b.city}","${b.state}",${b.revenue},${b.revenueGrowth},${b.targetAchievement},${b.customers},${b.aov},${b.healthScore},"${b.category}"`
        ).join("\n");
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `franchiseops-${selectedReport}-report.csv`;
        a.click();
      }

      showToast(`Exported ${selectedReport.toUpperCase()} report successfully.`);
    }, 600);
  };

  const reportTemplates = [
    {
      id: 'executive',
      title: 'Executive Network Performance Dossier',
      icon: TrendingUp,
      desc: 'Complete overview of monthly revenue, targets, growth trajectories, and network health.'
    },
    {
      id: 'outlets',
      title: 'Outlet Benchmarking & Health Score Matrix',
      icon: Layers,
      desc: 'Deterministic 4-factor scoring breakdown, quartile rankings, and underperformance flags.'
    },
    {
      id: 'finance',
      title: 'Financial P&L and Unit Economics Audit',
      icon: DollarSign,
      desc: 'Store-level gross revenue, COGS food costs, labor percentages, and store EBITDA margins.'
    },
    {
      id: 'inventory',
      title: 'Inventory Consumption & Restock Schedule',
      icon: Package,
      desc: 'Safety stock buffer status, daily velocity, runout horizons, and active purchase orders.'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileBarChart className="w-7 h-7 text-indigo-600" />
              Operational Reports & Auditing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              Audit Ready
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Generate and schedule standardized executive, financial, and supply-chain dossiers for stakeholders.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="bg-white text-xs font-bold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            CSV Export
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="bg-white text-xs font-bold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            JSON Export
          </Button>
          <Button
            onClick={() => handleExport('print')}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / PDF Report
          </Button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-600">Saved</span>
        </div>
      )}

      {/* Report Template Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((t) => {
          const isSelected = selectedReport === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setSelectedReport(t.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer",
                isSelected 
                  ? "bg-indigo-50/70 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20" 
                  : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                )}>
                  <t.icon className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">{t.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{t.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Preview Container */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Report Preview: {reportTemplates.find(r => r.id === selectedReport)?.title}
            </CardTitle>
            <span className="text-xs text-slate-500">Period: {selectedTimeframe} • Franchise: {business.name}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            Validated by AI
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Outlet Location</th>
                  <th className="px-4 py-3.5 text-right">Revenue</th>
                  <th className="px-4 py-3.5 text-right">Target Achieved</th>
                  <th className="px-4 py-3.5 text-right">Orders</th>
                  <th className="px-4 py-3.5 text-right">Customers</th>
                  <th className="px-4 py-3.5 text-right">AOV</th>
                  <th className="px-4 py-3.5 text-center">Health Score</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {benchmarks.map((b) => (
                  <tr key={b.outletId} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3.5 font-bold text-slate-900">#{b.rank}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-500">{b.city}, {b.state}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(b.revenue)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700">
                      {b.targetAchievement.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">{formatNumber(b.orders)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">{formatNumber(b.customers)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">₹{Math.round(b.aov)}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-indigo-600">
                      {b.healthScore}/100
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {b.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
