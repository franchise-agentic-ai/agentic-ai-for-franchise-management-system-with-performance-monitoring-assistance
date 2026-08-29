import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Store, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  BrainCircuit, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Sparkles, 
  ChevronDown, 
  Info,
  Scale,
  HeartPulse
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { OutletBenchmarking, TimeSeriesPoint, RevenueTrendAnalysis, UnderperformanceDetection, HealthScoreBreakdown, UnderperformanceAlertItem } from '../types';
import { 
  getBenchmarkingData, 
  getOutletTimeSeries, 
  analyzeRevenueTrends, 
  getUnderperformingDetections, 
  getUnderperformanceAlerts, 
  getOutletHealthBreakdown, 
  TimeFrame, 
  MetricType 
} from '../services/outletPerformanceService';
import { getHealthCategoryBadgeClass } from '../services/healthScoreEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICardPro } from '../components/dashboard/KPICardPro';
import { HealthScoreModal } from '../components/dashboard/HealthScoreModal';
import { OutletComparisonMatrix } from '../components/dashboard/OutletComparisonMatrix';
import { PerformanceAgentAssistant } from '../components/dashboard/PerformanceAgentAssistant';

export function Outlets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Core datasets
  const [benchmarkingData, setBenchmarkingData] = useState<OutletBenchmarking[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrendAnalysis | null>(null);
  const [underperformingList, setUnderperformingList] = useState<UnderperformanceDetection[]>([]);
  const [alerts, setAlerts] = useState<UnderperformanceAlertItem[]>([]);
  
  // Filter states
  const [timeframe, setTimeframe] = useState<TimeFrame>('30D');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table sorting
  const [sortColumn, setSortColumn] = useState<keyof OutletBenchmarking>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Chart time-series
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);

  // Health score modal
  const [modalOutlet, setModalOutlet] = useState<{ name: string; breakdown: HealthScoreBreakdown | null }>({
    name: '',
    breakdown: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [bench, trends, underperforming, dynAlerts] = await Promise.all([
        getBenchmarkingData(),
        analyzeRevenueTrends(timeframe),
        getUnderperformingDetections(),
        getUnderperformanceAlerts(),
      ]);

      setBenchmarkingData(bench);
      setRevenueTrends(trends);
      setUnderperformingList(underperforming);
      setAlerts(dynAlerts);

      // Generate time-series for current selection
      const series = getOutletTimeSeries(
        selectedOutletFilter === 'all' ? undefined : selectedOutletFilter, 
        timeframe
      );
      setTimeSeries(series);
    } catch (e) {
      console.error('Failed to load outlet performance intelligence:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe, selectedOutletFilter]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
    }, 600);
  };

  const handleOpenHealthModal = async (outletId: string, outletName: string) => {
    const breakdown = await getOutletHealthBreakdown(outletId);
    setModalOutlet({ name: outletName, breakdown });
    setIsModalOpen(true);
  };

  // Sorting logic
  const handleSort = (column: keyof OutletBenchmarking) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted Table data
  const filteredData = benchmarkingData
    .filter((o) => {
      const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.category.toLowerCase() === statusFilter.toLowerCase();
      const matchesCity = cityFilter === 'all' || o.city.toLowerCase() === cityFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesCity;
    })
    .sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });

  // Calculate top-level KPIs
  const totalRevenue = benchmarkingData.reduce((acc, p) => acc + p.revenue, 0);
  const totalPrevRevenue = benchmarkingData.reduce((acc, p) => acc + (p.revenue / (1 + (p.revenueGrowth / 100))), 0);
  const overallGrowth = totalPrevRevenue > 0 ? ((totalRevenue - totalPrevRevenue) / totalPrevRevenue) * 100 : 0;
  
  const avgHealthScore = benchmarkingData.length > 0 
    ? benchmarkingData.reduce((acc, p) => acc + p.healthScore, 0) / benchmarkingData.length 
    : 0;
  const healthyCount = benchmarkingData.filter((p) => p.healthScore >= 75).length;
  const atRiskCount = benchmarkingData.filter((p) => p.healthScore < 75).length;

  const totalCustomers = benchmarkingData.reduce((acc, p) => acc + p.customers, 0);
  const underperformingCount = underperformingList.length;

  // Sparkline arrays
  const revSparkline = timeSeries.map((t) => ({ value: t.revenue }));
  const healthSparkline = [{ value: 76 }, { value: 78 }, { value: 77 }, { value: 79 }, { value: 80 }, { value: 79 }];
  const custSparkline = timeSeries.map((t) => ({ value: t.customers }));

  const cities = Array.from(new Set(benchmarkingData.map((o) => o.city)));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Store className="w-7 h-7 text-indigo-600" />
              Franchise Outlets & Performance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              {benchmarkingData.length} Active Units
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Multi-unit observability, growth trendlines, cross-outlet benchmarking, and deterministic health scoring.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white shadow-2xs text-xs font-bold"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", refreshing && "animate-spin text-indigo-600")} />
            {refreshing ? "Recalculating..." : "Refresh Signals"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(benchmarkingData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `franchise-performance-${timeframe}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="bg-white shadow-2xs text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Units Data
          </Button>
        </div>
      </div>

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'all', name: 'All Outlets', icon: Store, count: benchmarkingData.length },
          { id: 'performance', name: 'Outlet Performance', icon: TrendingUp, badge: `${Math.round(overallGrowth)}% Growth` },
          { id: 'comparison', name: 'Outlet Comparison', icon: Scale, badge: 'Cross-Matrix' },
          { id: 'health-scores', name: 'Health Scores', icon: HeartPulse, badge: `${Math.round(avgHealthScore)}/100 Avg` },
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
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TOP 5 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICardPro 
          title="Total Revenue (Oct)"
          value={totalRevenue}
          isCurrency={true}
          deltaPercent={Math.round(overallGrowth * 10) / 10}
          sparklineData={revSparkline}
          targetValue={18200000}
          tooltipText="Combined sales volume across all franchise units"
        />
        <KPICardPro 
          title="Avg Health Score"
          value={Math.round(avgHealthScore)}
          isCurrency={false}
          deltaPercent={2.4}
          sparklineData={healthSparkline}
          targetValue={100}
          periodLabel={`${healthyCount} Healthy • ${atRiskCount} At Risk`}
          tooltipText="Deterministic 4-factor scoring average"
        />
        <KPICardPro 
          title="Total Customers"
          value={totalCustomers}
          isCurrency={false}
          deltaPercent={5.2}
          sparklineData={custSparkline}
          periodLabel="Footfall across network"
        />
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Underperforming</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-600/20">
              {Math.round((underperformingCount / (benchmarkingData.length || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {underperformingCount} <span className="text-xs font-normal text-slate-500">of {benchmarkingData.length} Outlets</span>
            </div>
            <span className="text-xs text-rose-600 font-semibold mt-1 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Requires attention
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Network Reach</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
              100% Active
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {benchmarkingData.length} <span className="text-xs font-normal text-slate-500">Locations</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              Across 5 States
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: ALL OUTLETS */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search outlets by name, city, state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Health Statuses</option>
                <option value="Excellent">Excellent (&gt;85)</option>
                <option value="Healthy">Healthy (75-85)</option>
                <option value="At Risk">At Risk (60-74)</option>
                <option value="Critical">Critical (&lt;60)</option>
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500 shrink-0">
              Showing <span className="text-slate-900 font-extrabold">{filteredData.length}</span> of {benchmarkingData.length} Outlets
            </div>
          </div>

          {/* Master Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th onClick={() => handleSort('rank')} className="px-5 py-4 cursor-pointer hover:text-slate-900">Rank</th>
                    <th onClick={() => handleSort('name')} className="px-5 py-4 cursor-pointer hover:text-slate-900">Outlet Name</th>
                    <th onClick={() => handleSort('revenue')} className="px-5 py-4 font-bold text-right cursor-pointer hover:text-slate-900">Revenue (Oct)</th>
                    <th onClick={() => handleSort('revenueGrowth')} className="px-5 py-4 font-bold text-right cursor-pointer hover:text-slate-900">MoM Growth</th>
                    <th onClick={() => handleSort('orders')} className="px-5 py-4 font-bold text-right cursor-pointer hover:text-slate-900">Orders</th>
                    <th onClick={() => handleSort('customers')} className="px-5 py-4 font-bold text-right cursor-pointer hover:text-slate-900">Customers</th>
                    <th onClick={() => handleSort('aov')} className="px-5 py-4 font-bold text-right cursor-pointer hover:text-slate-900">AOV</th>
                    <th onClick={() => handleSort('targetAchievement')} className="px-5 py-4 font-bold text-center cursor-pointer hover:text-slate-900">Target Achieved</th>
                    <th onClick={() => handleSort('healthScore')} className="px-5 py-4 font-bold text-center cursor-pointer hover:text-slate-900">Health Score</th>
                    <th className="px-5 py-4 font-bold text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredData.map((outlet) => {
                    const isPosGrowth = outlet.revenueGrowth > 0;
                    return (
                      <tr key={outlet.outletId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                            #{outlet.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 text-sm">{outlet.name}</div>
                          <div className="text-xs text-slate-500">{outlet.city}, {outlet.state}</div>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 text-right">
                          {formatCurrency(outlet.revenue)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-0.5 font-bold text-xs px-2 py-0.5 rounded-md",
                            isPosGrowth ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          )}>
                            {isPosGrowth ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {isPosGrowth ? '+' : ''}{outlet.revenueGrowth}%
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-700 text-right">{formatNumber(outlet.orders)}</td>
                        <td className="px-5 py-4 font-mono text-slate-700 text-right">{formatNumber(outlet.customers)}</td>
                        <td className="px-5 py-4 font-mono font-semibold text-slate-800 text-right">₹{Math.round(outlet.aov)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full", outlet.targetAchievement >= 100 ? "bg-emerald-500" : outlet.targetAchievement >= 85 ? "bg-indigo-500" : "bg-amber-500")}
                                style={{ width: `${Math.min(outlet.targetAchievement, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-800">{outlet.targetAchievement.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleOpenHealthModal(outlet.outletId, outlet.name)}
                            className={cn(
                              "px-3 py-1 rounded-xl font-black text-xs ring-1 ring-inset cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-1 shadow-2xs",
                              getHealthCategoryBadgeClass(outlet.category)
                            )}
                            title="Click to view 4-factor health score breakdown"
                          >
                            <span>{outlet.healthScore}</span>
                            <span className="text-[9px] opacity-70">/100</span>
                            <Info className="w-3 h-3 ml-0.5 opacity-60" />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset", getHealthCategoryBadgeClass(outlet.category))}>
                            {outlet.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/dashboard/outlets/${outlet.outletId}`}>
                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs">
                              Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: OUTLET PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {(['7D', '30D', '3M', '6M', '12M'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    timeframe === tf ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {(['revenue', 'orders', 'customers', 'aov'] as MetricType[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    selectedMetric === m ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Sales Performance Trajectory ({timeframe})
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis 
                      tickFormatter={(val) => selectedMetric === 'revenue' ? `₹${val/1000}k` : selectedMetric === 'aov' ? `₹${val}` : `${val}`}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        selectedMetric === 'revenue' ? formatCurrency(value) : selectedMetric === 'aov' ? `₹${value}` : formatNumber(value),
                        selectedMetric.toUpperCase()
                      ]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Area type="monotone" dataKey={selectedMetric} stroke="#4f46e5" strokeWidth={3} fill="url(#colorMetric)" name="Actual" />
                    {selectedMetric === 'revenue' && (
                      <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    Revenue Intelligence
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueTrends && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-slate-700 space-y-1.5">
                      {revenueTrends.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                          <p>{insight}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Growth Drivers:</span>
                      {revenueTrends.topContributors.map((c, i) => (
                        <div key={i} className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-1">
                          <span className="font-semibold text-slate-800">{c.outletName}</span>
                          <span className="font-bold text-emerald-600">+{c.revenueGrowth}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <PerformanceAgentAssistant 
            benchmarking={benchmarkingData}
            revenueTrends={revenueTrends}
            underperforming={underperformingList}
          />
        </div>
      )}

      {/* TAB 3: OUTLET COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <OutletComparisonMatrix outlets={benchmarkingData} />
        </div>
      )}

      {/* TAB 4: HEALTH SCORES */}
      {activeTab === 'health-scores' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-indigo-600" />
                  Deterministic 4-Factor Scoring Methodology
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Total score out of 100 computed mathematically with zero subjective bias:
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block">Weight: 40%</span>
                    <strong className="block text-slate-900 mt-0.5">Target Achievement</strong>
                    <span className="text-[10px] text-slate-500">Revenue vs monthly quota</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block">Weight: 30%</span>
                    <strong className="block text-slate-900 mt-0.5">Revenue Growth</strong>
                    <span className="text-[10px] text-slate-500">MoM % velocity</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block">Weight: 15%</span>
                    <strong className="block text-slate-900 mt-0.5">Customer Traffic</strong>
                    <span className="text-[10px] text-slate-500">Footfall consistency</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block">Weight: 15%</span>
                    <strong className="block text-slate-900 mt-0.5">AOV Performance</strong>
                    <span className="text-[10px] text-slate-500">Ticket size health</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">
                  Network Health Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 text-xs">
                  <span className="font-bold text-emerald-900">Excellent (&gt;85)</span>
                  <span className="font-mono font-bold text-emerald-700">{benchmarkingData.filter(b => b.healthScore >= 85).length} Outlets</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-indigo-50 text-xs">
                  <span className="font-bold text-indigo-900">Healthy (75-84)</span>
                  <span className="font-mono font-bold text-indigo-700">{benchmarkingData.filter(b => b.healthScore >= 75 && b.healthScore < 85).length} Outlets</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50 text-xs">
                  <span className="font-bold text-amber-900">At Risk (60-74)</span>
                  <span className="font-mono font-bold text-amber-700">{benchmarkingData.filter(b => b.healthScore >= 60 && b.healthScore < 75).length} Outlets</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-rose-50 text-xs">
                  <span className="font-bold text-rose-900">Critical (&lt;60)</span>
                  <span className="font-mono font-bold text-rose-700">{benchmarkingData.filter(b => b.healthScore < 60).length} Outlets</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health list */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="px-5 py-3.5">Outlet Location</th>
                    <th className="px-5 py-3.5 text-center">Calculated Health Score</th>
                    <th className="px-5 py-3.5 text-center">Category Tier</th>
                    <th className="px-5 py-3.5 text-right">Target Quota Achieved</th>
                    <th className="px-5 py-3.5 text-right">MoM Growth</th>
                    <th className="px-5 py-3.5 text-right">Scoring Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {benchmarkingData.map((b) => (
                    <tr key={b.outletId} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {b.name}
                        <span className="block text-[10px] text-slate-500 font-normal">{b.city}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-sm text-indigo-600">
                        {b.healthScore}/100
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset", getHealthCategoryBadgeClass(b.category))}>
                          {b.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-800">
                        {b.targetAchievement.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold">
                        <span className={b.revenueGrowth > 0 ? "text-emerald-600" : "text-rose-600"}>
                          {b.revenueGrowth > 0 ? '+' : ''}{b.revenueGrowth}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenHealthModal(b.outletId, b.name)}
                          className="text-xs font-bold"
                        >
                          <Info className="w-3.5 h-3.5 mr-1" />
                          View Factors
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* HEALTH SCORE EXPLANATION MODAL */}
      <HealthScoreModal
        outletName={modalOutlet.name}
        breakdown={modalOutlet.breakdown}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
