import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { 
  TrendingUp, 
  Store, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Layers,
  Users,
  Package,
  Activity,
  DollarSign,
  AlertOctagon,
  Flame,
  FileBarChart,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  CalendarCheck,
  Megaphone,
  Coins,
  ShieldAlert,
  Award,
  Clock,
  Eye,
  Check,
  Plus,
  Inbox,
  Sparkles
} from 'lucide-react';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantSales, 
  getTenantInventory,
  getTenantStaff,
  getTenantMarketing,
  calculateOverallBusinessHealthScore,
  getCurrentUser,
  DEFAULT_BUSINESS
} from '../services/tenantService';
import { getBenchmarkingData } from '../services/outletPerformanceService';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { BusinessProfile, Outlet, OutletBenchmarking, SalesRecord, InventoryRecord, StaffRecord } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [benchmarks, setBenchmarks] = useState<OutletBenchmarking[]>([]);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '3M'>('30D');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const currentUser = getCurrentUser();

  const loadData = async () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    const sls = getTenantSales(biz.id);
    const inv = getTenantInventory(biz.id);
    const stf = getTenantStaff(biz.id);
    setOutlets(outs);
    setSales(sls);
    setInventory(inv);
    setStaff(stf);

    const bench = await getBenchmarkingData();
    setBenchmarks(bench);
  };

  useEffect(() => {
    loadData();
    const handleTenantChange = () => loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('franchiseops_tenant_changed', handleTenantChange);
    window.addEventListener('franchiseops_data_updated', handleDataChange);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', handleTenantChange);
      window.removeEventListener('franchiseops_data_updated', handleDataChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTakeAction = (actionId: string, actionName: string) => {
    setExecutedActions(prev => ({ ...prev, [actionId]: true }));
    showToast(`Executed: ${actionName}`);
  };

  // Compute live metrics
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
  const totalProfit = Math.round(totalRevenue * 0.25);
  const healthScoreResult = outlets.length > 0 ? calculateOverallBusinessHealthScore(business.id) : null;
  const healthScore = healthScoreResult ? healthScoreResult.score : 0;

  // Chart data calculation
  let salesChartData: Array<{ day: string; revenue: number; target: number }> = [];
  if (sales.length > 0) {
    if (business.id === DEFAULT_BUSINESS.id) {
      salesChartData = [
        { day: 'Mon', revenue: 320000, target: 300000 },
        { day: 'Tue', revenue: 345000, target: 310000 },
        { day: 'Wed', revenue: 390000, target: 330000 },
        { day: 'Thu', revenue: 410000, target: 350000 },
        { day: 'Fri', revenue: 580000, target: 450000 },
        { day: 'Sat', revenue: 720000, target: 600000 },
        { day: 'Sun', revenue: 690000, target: 580000 },
      ];
    } else {
      // Map sales records into daily chart points
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const aggregated: Record<string, number> = {};
      sales.forEach((s, idx) => {
        const d = days[idx % 7];
        aggregated[d] = (aggregated[d] || 0) + s.revenue;
      });
      salesChartData = days.map(d => ({
        day: d,
        revenue: aggregated[d] || 0,
        target: Math.round((aggregated[d] || 10000) * 0.9)
      }));
    }
  }

  // Health classifications
  const healthyOutlets = benchmarks.filter(b => b.healthScore >= 75);
  const attentionOutlets = benchmarks.filter(b => b.healthScore >= 60 && b.healthScore < 75);
  const atRiskOutlets = benchmarks.filter(b => b.healthScore < 60);

  // Top and worst
  const sortedOutlets = [...benchmarks].sort((a, b) => b.healthScore - a.healthScore);
  const topOutlets = sortedOutlets.slice(0, 3);
  const worstOutlets = [...benchmarks].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);

  // Low inventory count
  const lowStockItems = inventory.filter(i => i.current_stock <= i.min_stock);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome, {currentUser ? currentUser.name : 'Business Owner'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              {business.industry || 'Franchise'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Active Workspace: <strong className="text-slate-800">{business.name}</strong> ({business.city || 'Central'}, {business.state || 'India'})
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/dashboard/data-hub">
            <Button variant="outline" className="text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 shadow-2xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Data Hub</span>
            </Button>
          </Link>

          <Link to="/dashboard/copilot">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5">
              <FranchiseOpsLogo className="w-4 h-4" />
              <span>AI Copilot</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono">Action Applied</span>
        </div>
      )}

      {/* 2. TOP 4 KEY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Outlets */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL OUTLETS</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight mt-1 font-mono">
            {outlets.length} <span className="text-xs text-slate-400 font-normal">Units</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-2">
            <Store className="w-3.5 h-3.5" />
            <span>{outlets.filter(o => o.status === 'Active').length} Active</span>
            <span className="text-slate-400 font-normal ml-1">• {business.city || 'India'}</span>
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">REVENUE</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight mt-1 font-mono">
            {totalRevenue > 0 ? (
              totalRevenue >= 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : formatCurrency(totalRevenue)
            ) : (
              <span className="text-xl text-slate-400 font-normal">₹0</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-2">
            {totalRevenue > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">{sales.length} Sales Logs</span>
              </>
            ) : (
              <span className="text-slate-400">No sales recorded yet</span>
            )}
          </div>
        </div>

        {/* Metric 3: Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">EST. PROFIT (EBITDA)</span>
          <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1 font-mono">
            {totalProfit > 0 ? (
              totalProfit >= 100000 ? `₹${(totalProfit / 100000).toFixed(1)}L` : formatCurrency(totalProfit)
            ) : (
              <span className="text-xl text-slate-400 font-normal">₹0</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-2">
            {totalProfit > 0 ? (
              <span className="text-emerald-600">~25% margin estimate</span>
            ) : (
              <span className="text-slate-400">Awaiting sales records</span>
            )}
          </div>
        </div>

        {/* Metric 4: Health Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">HEALTH SCORE</span>
          <div className="text-3xl font-black text-indigo-600 tracking-tight mt-1 font-mono">
            {healthScore > 0 ? (
              <>{healthScore}<span className="text-base text-slate-400 font-normal">/100</span></>
            ) : (
              <span className="text-lg text-slate-400 font-normal">Pending Data</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-2">
            {healthScore >= 75 ? (
              <span className="text-emerald-600 font-bold">🟢 Healthy Tier</span>
            ) : healthScore >= 60 ? (
              <span className="text-amber-600 font-bold">🟡 Attention Tier</span>
            ) : healthScore > 0 ? (
              <span className="text-rose-600 font-bold">🔴 At Risk Tier</span>
            ) : (
              <span className="text-slate-400">Add data to calculate</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ROW 1: SALES TREND & OUTLET HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue & Sales Trend */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                📈 Revenue & Sales Trend
              </CardTitle>
              <p className="text-xs text-slate-500">Aggregate trajectory vs weekly target pace</p>
            </div>

            {sales.length > 0 && (
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                {(['7D', '30D', '3M'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      chartTimeframe === tf ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center">
            {sales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#salesGrad)" name="Actual Revenue" />
                  <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Target Pace" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No sales data available yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                  Record daily outlet sales or upload POS batches in the Business Data Hub to unlock revenue trajectories & anomaly forecasting.
                </p>
                <Link to="/dashboard/data-hub?tab=sales">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Sales Record
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Outlet Health */}
        <Card className="shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              🏪 Outlet Health
            </CardTitle>
            <p className="text-xs text-slate-500">Classification across {outlets.length} network units</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {outlets.length > 0 ? (
              <>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                    <span className="text-xs font-bold text-emerald-950">🟢 Healthy</span>
                  </div>
                  <span className="text-base font-mono font-black text-emerald-700">{healthyOutlets.length}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                    <span className="text-xs font-bold text-amber-950">🟡 Attention</span>
                  </div>
                  <span className="text-base font-mono font-black text-amber-700">{attentionOutlets.length}</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                    <span className="text-xs font-bold text-rose-950">🔴 At Risk</span>
                  </div>
                  <span className="text-base font-mono font-black text-rose-700">{atRiskOutlets.length}</span>
                </div>

                <Link to="/dashboard/outlets" className="block pt-1">
                  <Button variant="ghost" size="sm" className="w-full text-indigo-600 hover:text-indigo-700 text-xs font-bold py-1.5 h-auto">
                    Manage Outlets Matrix →
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Store className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No outlets added yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">Add your first branch to track health scores</p>
                <Link to="/dashboard/outlets">
                  <Button size="sm" variant="outline" className="text-xs font-bold text-indigo-600 border-indigo-200">
                    <Plus className="w-3 h-3 mr-1" /> Add Outlet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. ROW 2: CRITICAL ALERTS & AI INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Critical Alerts */}
        <Card className="border-rose-100/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              🚨 Risk Alerts & Monitoring
            </CardTitle>
            <Link to="/dashboard/risk-center" className="text-xs font-bold text-indigo-600 hover:underline">
              Risk Center →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.id === DEFAULT_BUSINESS.id ? (
              <>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      🔴 Outlet #24 (Koregaon Park)
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-md">Critical</span>
                  </div>
                  <p className="text-xs text-rose-800/90 pl-3.5">
                    Revenue dropped <strong>22%</strong> below target threshold due to spice stockouts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      🟠 Outlet #12 (Indiranagar)
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">Warning</span>
                  </div>
                  <p className="text-xs text-amber-800/90 pl-3.5">
                    Basmati Rice inventory below minimum safety limit (2 days cover).
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">All Systems Operational</p>
                <p className="text-[11px] text-slate-500">
                  No risk anomalies or stockout alerts detected for {business.name}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: AI Insights */}
        <Card className="border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/20 to-white shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FranchiseOpsLogo className="w-4 h-4" />
              AI Agentic Insights
            </CardTitle>
            <Link to="/dashboard/copilot" className="text-xs font-bold text-indigo-600 hover:underline">
              Ask Copilot →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.id === DEFAULT_BUSINESS.id ? (
              <>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed font-medium">
                    Sales declined across 2 locations because of stock shortage in Basmati Rice & peak weekend shift absenteeism.
                  </p>
                  <div className="pt-2 border-t border-indigo-200/60 flex items-start gap-2 text-indigo-950 font-bold">
                    <span className="text-base">💡</span>
                    <span>Recommended: Restock Product X (Royal Basmati 400kg) & deploy float staff.</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link to="/dashboard/action-center">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      View Action Plan
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Personalized AI Assistant Ready for {business.name}</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  FranchiseOps AI is configured for {business.name}. Ingest daily sales logs, inventory sheets, and staff rosters to trigger automatic multi-agent recommendations.
                </p>
                <div className="pt-2">
                  <Link to="/dashboard/copilot">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8">
                      <FranchiseOpsLogo className="w-3.5 h-3.5 mr-1" />
                      Chat with Business AI
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. ROW 3: TOP OUTLETS VS UNDERPERFORMING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Top Outlets */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              🏆 Top Performing Outlets
            </CardTitle>
            <Link to="/dashboard/outlets" className="text-xs font-bold text-indigo-600 hover:underline">
              All Outlets →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topOutlets.length > 0 ? (
              topOutlets.map((b, idx) => (
                <div key={b.outletId} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-400">#{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">{b.name}</span>
                      <span className="text-[10px] text-slate-500">{formatCurrency(b.revenue)} • {b.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900">{b.healthScore}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No performance data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-2">Record sales to generate outlet rankings</p>
                <Link to="/dashboard/data-hub?tab=sales">
                  <Button size="sm" variant="outline" className="text-xs font-bold text-indigo-600 border-indigo-200">
                    <Plus className="w-3 h-3 mr-1" /> Add Sales
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Underperforming Outlets */}
        <Card className="shadow-xs border-rose-100/70">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              ⚠️ Outlets Needing Attention
            </CardTitle>
            <Link to="/dashboard/risk-center" className="text-xs font-bold text-rose-600 hover:underline">
              Turnaround Plans →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {worstOutlets.length > 0 && atRiskOutlets.length > 0 ? (
              worstOutlets.map((b, idx) => (
                <div key={b.outletId} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-rose-400">#{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">{b.name}</span>
                      <span className="text-[10px] text-rose-600 font-semibold">{b.healthScore < 60 ? 'At Risk' : 'Attention'} • {b.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-rose-700">{b.healthScore}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No underperforming branches</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All monitored units meet baseline operational standards.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. ROW 4: INVENTORY, STAFF, MARKETING, FINANCE SUMMARY PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Inventory */}
        <Link to="/dashboard/inventory" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:border-indigo-400 group-hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                📦 Inventory
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                inventory.length > 0 ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100"
              )}>
                {inventory.length} SKUs
              </span>
            </div>
            <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>Low Stock Alerts:</span>
              <strong className={cn("font-mono", lowStockItems.length > 0 ? "text-rose-600" : "text-slate-700")}>
                {lowStockItems.length} Items
              </strong>
            </div>
          </div>
        </Link>

        {/* Pillar 2: Staff */}
        <Link to="/dashboard/staff" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:border-indigo-400 group-hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                👥 Staff
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                staff.length > 0 ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100"
              )}>
                {staff.length} Active
              </span>
            </div>
            <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>Shift Shortages:</span>
              <strong className="text-slate-700 font-mono">
                {business.id === DEFAULT_BUSINESS.id ? '3 Risks' : '0 Risks'}
              </strong>
            </div>
          </div>
        </Link>

        {/* Pillar 3: Marketing */}
        <Link to="/dashboard/marketing" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:border-indigo-400 group-hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-purple-600" />
                📢 Marketing
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {business.id === DEFAULT_BUSINESS.id ? 'ROI: 3.4x' : 'Ready'}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>Active Campaigns:</span>
              <strong className="text-slate-800 font-mono">
                {business.id === DEFAULT_BUSINESS.id ? '8 Live' : '0 Active'}
              </strong>
            </div>
          </div>
        </Link>

        {/* Pillar 4: Finance */}
        <Link to="/dashboard/finance" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:border-indigo-400 group-hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                💰 Finance
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Margin 25%
              </span>
            </div>
            <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>EBITDA Estimation:</span>
              <strong className="text-emerald-600 font-mono">
                {totalProfit > 0 ? formatCurrency(totalProfit) : '₹0'}
              </strong>
            </div>
          </div>
        </Link>
      </div>

      {/* 7. ROW 5: AI PRIORITY ACTIONS */}
      <Card className="shadow-xs border-indigo-100">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              <Flame className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight">
              🎯 AI PRIORITY ACTIONS
            </CardTitle>
          </div>
          <Link to="/dashboard/action-center">
            <Button variant="ghost" size="sm" className="text-indigo-600 text-xs font-bold">
              Action Center Hub →
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {business.id === DEFAULT_BUSINESS.id ? (
            <>
              {/* Action 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-slate-400 text-xs">1.</span>
                  <span className="text-xs font-bold text-slate-900">
                    🔴 Restock Outlet #24 (KP) – Basmati Rice below 2 days buffer
                  </span>
                </div>
                {executedActions['act_1'] ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Dispatched PO
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTakeAction('act_1', 'Automated PO Dispatched to Supplier for Outlet #24')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Take Action
                  </Button>
                )}
              </div>

              {/* Action 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-slate-400 text-xs">2.</span>
                  <span className="text-xs font-bold text-slate-900">
                    🟠 Review staff allocation – Outlet #12 (Indiranagar 22% shift shortage)
                  </span>
                </div>
                {executedActions['act_2'] ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Float Staff Dispatched
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTakeAction('act_2', 'Dispatched 2 Float Kitchen Staff to Indiranagar')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Take Action
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">✨ Ingest Daily Operational Data for {business.name}</span>
                <span className="text-slate-500 text-[11px]">Add sales records, inventory stock, or audits to enable AI action generator.</span>
              </div>
              <Link to="/dashboard/data-hub">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Open Data Hub
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
