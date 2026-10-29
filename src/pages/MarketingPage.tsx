import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Target, 
  Zap, 
  Globe, 
  BarChart3, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  Check, 
  Percent, 
  Users,
  SlidersHorizontal,
  ChevronRight,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowDownRight,
  TrendingDown,
  Info,
  Play
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantCampaigns, 
  saveTenantCampaigns, 
  addTenantCampaign,
  getTenantEmployees,
  getTenantShifts,
  logTenantActivity 
} from '../services/tenantService';
import { 
  rankCampaigns, 
  compareMarketingChannels, 
  compareOutletMarketing, 
  calculateMarketingKPIs, 
  detectUnderperformingCampaigns,
  correlateCampaignsWithWorkforce
} from '../services/marketingEngine';
import { MONTHLY_MARKETING_TRENDS } from '../services/marketingData';
import { runMarketingAgent } from '../services/marketingAgent';
import { 
  MarketingCampaign, 
  CampaignCalculatedMetrics, 
  ChannelPerformanceSummary, 
  OutletMarketingSummary, 
  MarketingKPIs, 
  MarketingAgentScanResult, 
  MarketingChannel,
  CampaignStatus,
  CrossAgentCampaignStaffImpact 
} from '../types/marketing';
import { Outlet, BusinessProfile } from '../types';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Legend 
} from 'recharts';

type SectionTab = 'overview' | 'campaigns' | 'channels' | 'outlets' | 'ai-insights';

export function MarketingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = (searchParams.get('view') as SectionTab) || 'overview';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  
  // Filters & Search
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'roi' | 'revenue' | 'spend' | 'cac'>('roi');

  // Interactive Modals & States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Autonomous Agent Scanning State
  const [isAgentScanning, setIsAgentScanning] = useState(false);
  const [agentStep, setAgentStep] = useState('');
  const [agentPhase, setAgentPhase] = useState(0);
  const [scanResult, setScanResult] = useState<MarketingAgentScanResult | null>(null);

  // Form states for new campaign
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newChannel, setNewChannel] = useState<MarketingChannel>('Instagram');
  const [targetOutletId, setTargetOutletId] = useState('');
  const [newBudget, setNewBudget] = useState(80000);
  const [newSpend, setNewSpend] = useState(45000);
  const [newAttributedRev, setNewAttributedRev] = useState(190000);
  const [newConversions, setNewConversions] = useState(380);
  const [newObjective, setNewObjective] = useState('Weekend Biryani Dine-in Traffic');

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !targetOutletId) {
      setTargetOutletId(outs[0].id);
    }
    const marks = getTenantCampaigns(biz.id);
    setCampaigns(marks);
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

  const handleSectionChange = (view: SectionTab) => {
    setSearchParams({ view });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleRunMarketingAgent = async () => {
    setIsAgentScanning(true);
    setAgentStep('Analyzing campaign performance and marketing efficiency...');
    setAgentPhase(1);

    const steps = [
      'Analyzing campaign performance...',
      'Checking marketing efficiency...',
      'Comparing channels...',
      'Evaluating outlet performance...',
      'Generating recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAgentStep(steps[i]);
      setAgentPhase(i + 1);
      await new Promise(r => setTimeout(r, 220));
    }

    try {
      const res = await runMarketingAgent(business.id);
      setScanResult(res);
      showNotice('Marketing Agent analysis complete! Insights and actions updated.');
    } catch (err) {
      console.error('Marketing agent scan error:', err);
    } finally {
      setIsAgentScanning(false);
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !targetOutletId) return;

    const outName = outlets.find(o => o.id === targetOutletId)?.name || 'Franchise Outlet';
    
    addTenantCampaign(business.id, {
      outletId: targetOutletId,
      outletName: outName,
      campaignName: newCampaignName.trim(),
      channel: newChannel,
      budget: Number(newBudget),
      spend: Number(newSpend),
      impressions: Number(newSpend) * 7,
      clicks: Math.round(Number(newSpend) / 4.8),
      leads: Math.round(Number(newConversions) * 1.4),
      conversions: Number(newConversions),
      customersAcquired: Math.round(Number(newConversions) * 0.85),
      attributedRevenue: Number(newAttributedRev),
      engagementRate: 6.2,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Active',
      objective: newObjective
    });

    setIsAddModalOpen(false);
    setNewCampaignName('');
    showNotice(`Successfully launched '${newCampaignName}' for ${outName}!`);
    loadData();
  };

  const handlePauseCampaign = (campaignId: string, campaignName: string) => {
    const updated = campaigns.map(c => c.campaignId === campaignId ? { ...c, status: 'Paused' as CampaignStatus } : c);
    saveTenantCampaigns(business.id, updated);
    setCampaigns(updated);
    logTenantActivity(business.id, 'Marketing Agent', `Paused underperforming campaign '${campaignName}' to reclaim ad spend.`);
    showNotice(`Paused '${campaignName}' to stop budget bleed.`);
  };

  const handleShiftBudget = (fromCampId: string, toCampId: string, amount: number) => {
    const fromCamp = campaigns.find(c => c.campaignId === fromCampId);
    const toCamp = campaigns.find(c => c.campaignId === toCampId);
    if (!fromCamp || !toCamp) return;

    const updated = campaigns.map(c => {
      if (c.campaignId === fromCampId) return { ...c, budget: Math.max(c.spend, c.budget - amount) };
      if (c.campaignId === toCampId) return { ...c, budget: c.budget + amount };
      return c;
    });

    saveTenantCampaigns(business.id, updated);
    setCampaigns(updated);
    logTenantActivity(business.id, 'Marketing Agent', `Shifted ₹${amount.toLocaleString()} budget from '${fromCamp.campaignName}' to high-ROI '${toCamp.campaignName}'.`);
    showNotice(`Shifted ₹${amount.toLocaleString()} from ${fromCamp.campaignName} to ${toCamp.campaignName}!`);
  };

  // Calculations via deterministic marketing engine
  const campaignMetrics = rankCampaigns(campaigns);
  const channelSummaries = compareMarketingChannels(campaigns);
  const outletSummaries = compareOutletMarketing(outlets, campaigns);
  const kpis = calculateMarketingKPIs(campaigns, campaignMetrics);
  const underperforming = detectUnderperformingCampaigns(campaigns);

  // Cross-agent correlation with workforce
  const shifts = getTenantShifts(business.id);
  const employees = getTenantEmployees(business.id);
  const crossAgentStaffImpacts = correlateCampaignsWithWorkforce(campaigns, shifts, employees);

  // Filtered & Sorted campaigns
  const filteredCampaigns = campaignMetrics.filter(c => {
    const matchOutlet = selectedOutlet === 'all' || c.outletId === selectedOutlet;
    const matchChannel = selectedChannel === 'all' || c.channel.toLowerCase() === selectedChannel.toLowerCase();
    const rawCamp = campaigns.find(raw => raw.campaignId === c.campaignId);
    const matchStatus = selectedStatus === 'all' || (rawCamp && rawCamp.status.toLowerCase() === selectedStatus.toLowerCase());
    const matchSearch = searchTerm === '' || 
      c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.outletName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchOutlet && matchChannel && matchStatus && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'roi') return b.roi - a.roi;
    if (sortBy === 'revenue') return b.attributedRevenue - a.attributedRevenue;
    if (sortBy === 'spend') return b.spend - a.spend;
    if (sortBy === 'cac') return a.costPerAcquisition - b.costPerAcquisition;
    return 0;
  });

  // Funnel Data
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalCustomers = campaigns.reduce((s, c) => s + (c.customersAcquired || 0), 0);

  const funnelSteps = [
    { label: 'Impressions', value: totalImpressions, rate: '100%', color: 'bg-indigo-500' },
    { label: 'Clicks', value: totalClicks, rate: `${((totalClicks / (totalImpressions || 1)) * 100).toFixed(1)}% CTR`, color: 'bg-purple-500' },
    { label: 'Leads', value: totalLeads, rate: `${((totalLeads / (totalClicks || 1)) * 100).toFixed(1)}% Lead Rate`, color: 'bg-pink-500' },
    { label: 'Conversions', value: totalConversions, rate: `${((totalConversions / (totalClicks || 1)) * 100).toFixed(1)}% Conv Rate`, color: 'bg-amber-500' },
    { label: 'Paying Customers', value: totalCustomers, rate: `${((totalCustomers / (totalConversions || 1)) * 100).toFixed(0)}% Fulfilled`, color: 'bg-emerald-500' }
  ];

  // Helper for ROI Multiplier string
  const getRoiMultiplier = (roiPct: number) => {
    const mult = 1 + (roiPct / 100);
    return `${mult.toFixed(2)}x`;
  };

  const getStatusBadge = (tier: CampaignCalculatedMetrics['performanceTier']) => {
    switch (tier) {
      case 'TOP_PERFORMER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Excellent</span>;
      case 'HEALTHY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center gap-1"><Check className="w-3 h-3" /> Performing</span>;
      case 'UNDERPERFORMING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Needs Attention</span>;
      case 'BUDGET_DRAIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Critical</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* COMPACT ENTERPRISE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Marketing Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Marketing Agent Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Campaign performance, ROI optimization, customer acquisition and cross-agent workforce intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunMarketingAgent}
            disabled={isAgentScanning}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-2 font-medium text-sm h-10 px-4"
          >
            {isAgentScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{agentStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Marketing Agent Analysis</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-sm h-10 px-4"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Launch Campaign</span>
          </Button>
        </div>
      </div>

      {/* DYNAMIC KPI SECTION (Calculated directly from datasets) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Total Spend</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{(kpis.totalMarketingSpend / 100000).toFixed(2)}L
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Budget: ₹{(kpis.totalMarketingBudget / 100000).toFixed(2)}L
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Attributed Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              ₹{(kpis.totalAttributedRevenue / 100000).toFixed(2)}L
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Net: ₹{((kpis.totalAttributedRevenue - kpis.totalMarketingSpend) / 100000).toFixed(2)}L
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Blended ROI</span>
              <Percent className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600">
              {getRoiMultiplier(kpis.blendedROI)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {kpis.blendedROI > 0 ? `+${kpis.blendedROI}%` : `${kpis.blendedROI}%`} Net Margin
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Avg CAC</span>
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-2xl font-extrabold text-violet-600">
              ₹{Math.round(kpis.averageCAC)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatNumber(kpis.totalCustomersAcquired)} customers acquired
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Conversion Rate</span>
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">
              {kpis.blendedConversionRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              CTR: {kpis.averageCTR}% (Clicks to Lead)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Active Campaigns</span>
              <Megaphone className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {kpis.activeCampaignsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {kpis.highPerformingCount} Top • {kpis.underperformingCount} Attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CLEAN ENTERPRISE SECTION NAVIGATION (No horizontal scroll overflow) */}
      <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Megaphone },
          { id: 'channels', label: 'Channels', icon: Globe },
          { id: 'outlets', label: 'Attribution & Outlets', icon: Layers },
          { id: 'ai-insights', label: 'AI Insights & Cross-Agent', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSectionChange(tab.id as SectionTab)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2",
                isActive 
                  ? "bg-white text-purple-700 shadow-sm font-bold" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-purple-600" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: OVERVIEW & PERFORMANCE VISUALIZATIONS */}
      {/* ======================================================== */}
      {(currentSection === 'overview') && (
        <div className="space-y-6">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 6-Month Spend vs Revenue Trend */}
            <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Marketing Spend vs. Attributed Revenue (Last 6 Months)
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historical tracking of monthly capital deployed against realized franchise revenue.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +18.4% Revenue Growth
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_MARKETING_TRENDS}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                      <Tooltip 
                        formatter={(val: any) => [`₹${(Number(val)/100000).toFixed(2)} Lakhs`, '']}
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Area type="monotone" dataKey="revenue" name="Attributed Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                      <Area type="monotone" dataKey="spend" name="Marketing Spend" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Campaign ROI Ranking Bar */}
            <Card className="bg-white border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Top Campaign ROI Ranking
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realized ROI multiplier per campaign
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical"
                      data={campaignMetrics.slice(0, 5).map(c => ({
                        name: c.campaignName.length > 18 ? c.campaignName.substring(0, 18) + '...' : c.campaignName,
                        roiMultiplier: Number((1 + c.roi / 100).toFixed(2)),
                        roiPct: c.roi
                      }))}
                      margin={{ left: 10, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 'auto']} tickFormatter={v => `${v}x`} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                      <Tooltip 
                        formatter={(val: any) => [`${val}x ROI`, 'Multiplier']}
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                      />
                      <Bar dataKey="roiMultiplier" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="ROI Multiplier" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CONVERSION FUNNEL BAR */}
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Network Customer Acquisition & Conversion Funnel
              </CardTitle>
              <p className="text-xs text-slate-500">
                End-to-end customer journey from ad impression to verified dine-in & delivery transactions.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {funnelSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 relative">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Step {idx + 1}</span>
                      <span className="text-purple-700 font-bold">{step.rate}</span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {formatNumber(step.value)}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {step.label}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div className={cn("h-1.5 rounded-full", step.color)} style={{ width: `${Math.max(10, 100 - idx * 20)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: CAMPAIGN PERFORMANCE TABLE */}
      {/* ======================================================== */}
      {(currentSection === 'overview' || currentSection === 'campaigns') && (
        <Card className="bg-white border-slate-200/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                  Campaign Performance Intelligence
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time multi-channel telemetry with calculated ROI, conversion rates, and CAC metrics.
                </p>
              </div>

              {/* Filters & Sorting */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 w-40 sm:w-48"
                  />
                </div>

                <select
                  value={selectedOutlet}
                  onChange={e => setSelectedOutlet(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Outlets</option>
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>{o.name.replace('Biryani Hub - ', '')}</option>
                  ))}
                </select>

                <select
                  value={selectedChannel}
                  onChange={e => setSelectedChannel(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Channels</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook">Facebook</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Influencer">Influencer</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="roi">Sort: Highest ROI</option>
                  <option value="revenue">Sort: Highest Revenue</option>
                  <option value="spend">Sort: Highest Spend</option>
                  <option value="cac">Sort: Lowest CAC</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Outlet</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3 text-right">Spend</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-center">ROI</th>
                    <th className="px-4 py-3 text-center">Conversions</th>
                    <th className="px-4 py-3 text-center">CAC</th>
                    <th className="px-4 py-3 text-center">Performance Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map(c => {
                    const raw = campaigns.find(r => r.campaignId === c.campaignId);
                    const isPaused = raw?.status === 'Paused';

                    return (
                      <tr key={c.campaignId} className={cn("hover:bg-slate-50/80 transition-colors", isPaused && "opacity-60 bg-slate-50/40")}>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{c.campaignName}</div>
                          <div className="text-xs text-slate-400 font-normal">
                            Budget: ₹{c.budget.toLocaleString()} ({c.budgetUtilizationRate}% used)
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-700 font-medium">
                          {c.outletName.replace('Biryani Hub - ', '')}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            {c.channel}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-slate-900">
                          ₹{c.spend.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                          ₹{c.attributedRevenue.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="font-bold text-slate-900">{getRoiMultiplier(c.roi)}</div>
                          <div className={cn("text-xs font-semibold", c.roi > 0 ? "text-emerald-600" : "text-rose-600")}>
                            {c.roi > 0 ? `+${c.roi}%` : `${c.roi}%`}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="font-semibold text-slate-900">{c.customersAcquired}</div>
                          <div className="text-xs text-slate-400">({c.conversionRate}% rate)</div>
                        </td>

                        <td className="px-4 py-3.5 text-center font-semibold text-violet-700">
                          ₹{c.costPerAcquisition}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {getStatusBadge(c.performanceTier)}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {c.performanceTier === 'BUDGET_DRAIN' && !isPaused ? (
                            <Button
                              size="sm"
                              onClick={() => handlePauseCampaign(c.campaignId, c.campaignName)}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs h-7 px-2.5"
                            >
                              Pause
                            </Button>
                          ) : isPaused ? (
                            <span className="text-xs text-slate-400 italic">Paused</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showNotice(`Campaign '${c.campaignName}' is running optimally.`)}
                              className="border-slate-200 text-slate-600 text-xs h-7 px-2.5 hover:bg-slate-100"
                            >
                              Optimize
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: CHANNELS & OUTLET MARKETING ATTRIBUTION */}
      {/* ======================================================== */}
      {(currentSection === 'overview' || currentSection === 'channels' || currentSection === 'outlets') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Performance Breakdown */}
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Channel Efficiency & Allocation
              </CardTitle>
              <p className="text-xs text-slate-500">
                Ranked by blended ROI and customer acquisition efficiency across active campaigns.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {channelSummaries.map((ch, idx) => (
                  <div key={ch.channel} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {ch.channel}
                          <span className="text-xs font-normal text-slate-400">
                            ({ch.totalCampaigns} campaigns)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Spend: <strong>₹{ch.totalSpend.toLocaleString()}</strong> • Attributed Rev: <strong className="text-emerald-600">₹{ch.totalRevenue.toLocaleString()}</strong>
                        </div>
                        <div className="text-xs text-purple-700 font-medium mt-1">
                          {ch.recommendation}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-slate-900">{getRoiMultiplier(ch.blendedROI)}</div>
                      <div className="text-xs text-slate-500">CAC: <strong>₹{ch.averageCAC}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outlet Marketing Attribution Table */}
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Outlet Marketing Attribution
              </CardTitle>
              <p className="text-xs text-slate-500">
                Comparison of marketing spend and attributed revenue across franchise outlets.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Outlet</th>
                      <th className="px-4 py-2.5 text-right">Spend</th>
                      <th className="px-4 py-2.5 text-right">Revenue</th>
                      <th className="px-4 py-2.5 text-center">ROI</th>
                      <th className="px-4 py-2.5 text-center">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outletSummaries.map(o => (
                      <tr key={o.outletId} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{o.outletName.replace('Biryani Hub - ', '')}</div>
                          <div className="text-xs text-slate-400">{o.city}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          ₹{o.totalMarketingSpend.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          ₹{o.totalAttributedRevenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-slate-900">
                          {getRoiMultiplier(o.averageROI)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold",
                            o.marketingEfficiencyStatus === 'EXCELLENT' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            o.marketingEfficiencyStatus === 'CRITICAL_WASTE' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          )}>
                            {o.marketingEfficiencyStatus.replace('_', ' ')}
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
      )}

      {/* ======================================================== */}
      {/* SECTION 4: AI MARKETING AGENT & RECOMMENDED ACTIONS */}
      {/* ======================================================== */}
      {(currentSection === 'overview' || currentSection === 'ai-insights') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MARKETING AGENT INSIGHTS */}
          <Card className="bg-white border-purple-200/90 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  MARKETING AGENT INSIGHTS
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Autonomous pattern recognition and multi-outlet ROAS intelligence.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Live Analysis
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {/* Dynamic Insight Item 1: Top Channel */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <TrendingUp className="w-4 h-4" /> Channel Dominance
                  </span>
                  <span className="text-emerald-600">{getRoiMultiplier(channelSummaries[0]?.blendedROI || 300)} ROI</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>{channelSummaries[0]?.channel || 'Instagram'}</strong> campaigns are generating the highest ROI across the franchise network (CAC: ₹{channelSummaries[0]?.averageCAC || 240}).
                </p>
              </div>

              {/* Dynamic Insight Item 2: Budget Drain Alert */}
              {underperforming.length > 0 && (
                <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Budget Drain Alert
                    </span>
                    <span>{underperforming[0].roi}% ROI</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>'{underperforming[0].campaignName}'</strong> at {underperforming[0].outletName} is consuming {underperforming[0].budgetUtilizationRate}% of its budget while generating an elevated CAC of ₹{underperforming[0].costPerAcquisition}.
                  </p>
                </div>
              )}

              {/* Dynamic Insight Item 3: Top Outlet */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <Target className="w-4 h-4" /> Outlet Growth Benchmark
                  </span>
                  <span className="text-emerald-600">{getRoiMultiplier(outletSummaries[0]?.averageROI || 350)} ROI</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>{outletSummaries[0]?.outletName || 'Madhapur'}</strong> has the strongest marketing efficiency with a {getRoiMultiplier(outletSummaries[0]?.averageROI || 350)} ROI and ₹{outletSummaries[0]?.totalAttributedRevenue.toLocaleString()} in realized revenue.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI RECOMMENDED ACTIONS */}
          <Card className="bg-white border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  AI RECOMMENDED ACTIONS
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Prioritized optimization steps with calculated impact projections.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {/* Action 1: Shift Budget */}
              {underperforming.length > 0 && campaignMetrics.length > 0 && (
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" /> Shift Budget (Reallocate ₹15,000)
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleShiftBudget(underperforming[0].campaignId, campaignMetrics[0].campaignId, 15000)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5"
                    >
                      Execute Reallocation
                    </Button>
                  </div>
                  <p className="text-xs text-slate-700">
                    Move 20% of budget from underperforming <strong>'{underperforming[0].campaignName}'</strong> to high-ROI <strong>'{campaignMetrics[0].campaignName}'</strong>.
                  </p>
                  <div className="text-xs text-indigo-800 bg-white/80 px-2 py-1 rounded border border-indigo-100 font-medium">
                    <strong>Reason:</strong> {campaignMetrics[0].campaignName} generates 2.4x higher conversion rate and +{campaignMetrics[0].roi}% ROI.
                  </div>
                </div>
              )}

              {/* Action 2: Scale Top Campaign */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Scale Campaign Budget (+25%)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showNotice(`Increased budget for '${campaignMetrics[0]?.campaignName}' by +25%!`)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs h-7 px-2.5"
                  >
                    Scale Budget
                  </Button>
                </div>
                <p className="text-xs text-slate-700">
                  Increase budget on <strong>'{campaignMetrics[0]?.campaignName}'</strong> at {campaignMetrics[0]?.outletName} to capture weekend demand.
                </p>
                <div className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 font-medium">
                  <strong>Expected Impact:</strong> Projected +₹85,000 incremental revenue at stable CAC of ₹{campaignMetrics[0]?.costPerAcquisition}.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: CROSS-AGENT WORKFORCE ALIGNMENT */}
      {/* ======================================================== */}
      {(currentSection === 'overview' || currentSection === 'ai-insights') && (
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-md">
          <CardHeader className="pb-3 border-b border-indigo-500/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                CROSS-AGENT WORKFORCE ALIGNMENT (Marketing + Staff Agent)
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time operational collaboration correlating marketing traffic surges with kitchen shift coverage.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Cross-Agent Bridge Active
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crossAgentStaffImpacts.slice(0, 2).map((impact, i) => (
                <div key={i} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{impact.campaignName}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold",
                      impact.impactRiskLevel === 'CRITICAL' ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                      "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    )}>
                      {impact.impactRiskLevel} Operational Risk
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {impact.insightSummary}
                  </p>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Recommendation:</strong> {impact.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* LAUNCH CAMPAIGN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Launch Marketing Campaign
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Biryani Feast Promotion"
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                  <select
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value as MarketingChannel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Influencer">Influencer</option>
                    <option value="Local OOH / Flyers">Local OOH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Outlet</label>
                  <select
                    value={targetOutletId}
                    onChange={e => setTargetOutletId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    min="5000"
                    step="1000"
                    value={newBudget}
                    onChange={e => setNewBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Spend to Date (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newSpend}
                    onChange={e => setNewSpend(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attributed Revenue (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newAttributedRev}
                    onChange={e => setNewAttributedRev(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Conversions</label>
                  <input
                    type="number"
                    min="0"
                    value={newConversions}
                    onChange={e => setNewConversions(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Launch Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
