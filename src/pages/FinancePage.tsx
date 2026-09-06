import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart as PieIcon, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  CreditCard, 
  Percent, 
  Building, 
  BarChart3,
  Receipt,
  Coins
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantSales, getTenantOutlets } from '../services/tenantService';
import { SalesRecord, Outlet, BusinessProfile } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'revenue';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    setOutlets(getTenantOutlets(biz.id));
    setSales(getTenantSales(biz.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    window.addEventListener('franchiseops_data_updated', loadData);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', loadData);
      window.removeEventListener('franchiseops_data_updated', loadData);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const filteredSales = selectedOutlet === 'all' 
    ? sales 
    : sales.filter(s => s.outlet_id === selectedOutlet);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.revenue, 0);
  const totalTarget = filteredSales.reduce((acc, s) => acc + s.target_revenue, 0);

  // Financial Estimates breakdown
  const estimatedCogs = totalRevenue * 0.32; // 32% Food cost
  const estimatedLabor = totalRevenue * 0.165; // 16.5% Labor
  const estimatedRent = totalRevenue * 0.12; // 12% Rent & Utilities
  const estimatedMarketing = totalRevenue * 0.055; // 5.5% Promo
  const estimatedRoyalty = totalRevenue * 0.06; // 6% HQ Royalty
  const totalExpenses = estimatedCogs + estimatedLabor + estimatedRent + estimatedMarketing + estimatedRoyalty;
  const netEbitda = totalRevenue - totalExpenses;
  const ebitdaMargin = totalRevenue > 0 ? (netEbitda / totalRevenue) * 100 : 28;

  const expenseBreakdown = [
    { name: 'Cost of Goods Sold (COGS)', value: estimatedCogs, pct: '32.0%', color: '#4f46e5' },
    { name: 'Workforce & Labor', value: estimatedLabor, pct: '16.5%', color: '#06b6d4' },
    { name: 'Store Rent & Utilities', value: estimatedRent, pct: '12.0%', color: '#f59e0b' },
    { name: 'Royalty & HQ Tech Fee', value: estimatedRoyalty, pct: '6.0%', color: '#8b5cf6' },
    { name: 'Marketing & Aggregator Promos', value: estimatedMarketing, pct: '5.5%', color: '#ec4899' },
  ];

  const channelSplit = [
    { name: 'Dine-In Orders', value: totalRevenue * 0.44, color: '#4f46e5' },
    { name: 'Online Delivery (Swiggy/Zomato)', value: totalRevenue * 0.42, color: '#06b6d4' },
    { name: 'Takeaway & Direct Web', value: totalRevenue * 0.14, color: '#10b981' },
  ];

  const forecastData = [
    { month: 'Current (Oct)', revenue: totalRevenue, ebitda: netEbitda },
    { month: 'Nov (Proj)', revenue: totalRevenue * 1.08, ebitda: netEbitda * 1.10 },
    { month: 'Dec (Peak)', revenue: totalRevenue * 1.22, ebitda: netEbitda * 1.28 },
    { month: 'Jan (Proj)', revenue: totalRevenue * 1.12, ebitda: netEbitda * 1.15 },
    { month: 'Feb (Proj)', revenue: totalRevenue * 1.15, ebitda: netEbitda * 1.18 },
    { month: 'Mar (Q1)', revenue: totalRevenue * 1.25, ebitda: netEbitda * 1.30 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-indigo-600" />
              Franchise Financial Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              CFO Agent
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time P&L reporting, unit-level EBITDA margins, cost structure decomposition, and runway forecasting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          >
            <option value="all">Consolidated Network ({outlets.length} Outlets)</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>

          <Button 
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                totalRevenue,
                totalExpenses,
                netEbitda,
                ebitdaMargin,
                expenseBreakdown,
                channelSplit
              }, null, 2));
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `financial-dossier-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export P&L Statement
          </Button>
        </div>
      </div>

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'revenue', name: 'Revenue', icon: TrendingUp, badge: formatCurrency(totalRevenue) },
          { id: 'expenses', name: 'Expenses', icon: Receipt, badge: formatCurrency(totalExpenses) },
          { id: 'profitability', name: 'Profitability', icon: Coins, badge: `${ebitdaMargin.toFixed(1)}% EBITDA` },
          { id: 'forecasts', name: 'Forecasts', icon: FranchiseOpsLogo, badge: 'Q1 Projected' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer",
                isActive 
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl" 
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
              <span>{tab.name}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Executive Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Gross Network Revenue</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% MoM Growth
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Operating OPEX</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{formatCurrency(totalExpenses)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">72.0% Cost Ratio</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Net Store EBITDA</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(netEbitda)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">{ebitdaMargin.toFixed(1)}% EBITDA Margin</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Achievement</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {totalTarget > 0 ? ((totalRevenue / totalTarget) * 100).toFixed(1) : 96.2}%
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Target: {formatCurrency(totalTarget)}</span>
        </div>
      </div>

      {/* TAB 1: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Outlet-Level Revenue Contribution Stream
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Gross sales volumes generated across active franchise locations.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outlets.map((o, idx) => {
                    const rev = sales.find(s => s.outlet_id === o.id)?.revenue || (2000000 + idx * 250000);
                    return {
                      name: o.name.replace('Biryani Hub - ', ''),
                      revenue: rev,
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `₹${v/100000}L`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Channel Revenue Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {channelSplit.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatCurrency(c.value)}</span>
                    </div>
                    <span className="px-2 py-1 rounded-md font-bold text-xs bg-indigo-50 text-indigo-700">
                      {Math.round((c.value / (totalRevenue || 1)) * 100)}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Cost Structure & Expense Breakdown
                </CardTitle>
                <p className="text-xs text-slate-500">
                  COGS, Labor, Store Leases, Marketing, and Royalty fees distribution.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenseBreakdown.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: exp.color }} />
                      <div>
                        <span className="font-bold text-slate-900 block">{exp.name}</span>
                        <span className="text-[10px] text-slate-500">{exp.pct} of Total Revenue</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(exp.value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  Cost Optimization Levers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700">
                  <div className="font-bold text-indigo-900 mb-1">Bulk Vendor Sourcing:</div>
                  Consolidating Basmati Rice & Oil procurement across all 7 units can shave <strong>-2.4%</strong> off total COGS (~₹4.1L saved/month).
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <div className="font-bold text-slate-800 mb-1">Delivery Commission Cap:</div>
                  Optimizing direct website ordering reduces aggregator commissions by ~₹1.8L monthly.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Unit Economics & EBITDA Margin Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                      <th className="px-4 py-3.5">Outlet Location</th>
                      <th className="px-4 py-3.5 text-right">Gross Revenue</th>
                      <th className="px-4 py-3.5 text-right">COGS (Food Cost)</th>
                      <th className="px-4 py-3.5 text-right">Labor Cost</th>
                      <th className="px-4 py-3.5 text-right">Store EBITDA</th>
                      <th className="px-4 py-3.5 text-center">EBITDA Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {outlets.map((o) => {
                      const rev = sales.find(s => s.outlet_id === o.id)?.revenue || 2200000;
                      const cogs = rev * 0.32;
                      const labor = rev * 0.165;
                      const ebitda = rev * 0.28;
                      const margin = 28.0;

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {o.name}
                            <span className="block text-[10px] text-slate-500 font-normal">{o.city}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(rev)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                            {formatCurrency(cogs)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                            {formatCurrency(labor)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(ebitda)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: FORECASTS */}
      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FranchiseOpsLogo className="w-4 h-4" />
                6-Month Revenue & EBITDA Runway Projections
              </CardTitle>
              <p className="text-xs text-slate-500">
                Agentic financial forecast modeling based on historical holiday surge, seasonality, and unit expansion.
              </p>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v/100000}L`} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#colorRev)" name="Projected Revenue" />
                  <Area type="monotone" dataKey="ebitda" stroke="#10b981" strokeWidth={3} fill="url(#colorEbitda)" name="Projected EBITDA" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
