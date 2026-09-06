import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Target, 
  PieChart as PieIcon, 
  BarChart3, 
  ArrowUpRight, 
  Zap,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantMarketing, saveTenantMarketing, addTenantMarketing, getTenantOutlets } from '../services/tenantService';
import { MarketingRecord, Outlet, BusinessProfile } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export function MarketingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'campaigns';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingRecord[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form states
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignType, setNewCampaignType] = useState<MarketingRecord['campaign_type']>('Social');
  const [targetOutletId, setTargetOutletId] = useState('');
  const [newBudget, setNewBudget] = useState(50000);
  const [newSpend, setNewSpend] = useState(25000);

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !targetOutletId) {
      setTargetOutletId(outs[0].id);
    }
    const marks = getTenantMarketing(biz.id);
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

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName || !targetOutletId) return;

    const outName = outlets.find(o => o.id === targetOutletId)?.name || 'Franchise Unit';
    const estRev = newSpend * 3.8;
    const estRoi = Math.round(((estRev - newSpend) / newSpend) * 100);

    const newRecord: MarketingRecord = {
      id: 'mkt_' + Date.now(),
      business_id: business.id,
      outlet_id: targetOutletId,
      outlet_name: outName,
      campaign_name: newCampaignName,
      campaign_type: newCampaignType,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      budget: Number(newBudget),
      spend: Number(newSpend),
      customers_acquired: Math.round(newSpend / 45),
      revenue_generated: estRev,
      roi: estRoi,
      conversion_rate: 4.8,
      status: 'Active'
    };

    addTenantMarketing(business.id, newRecord);
    loadData();
    setIsAddModalOpen(false);
    showNotice(`Launched marketing campaign: ${newCampaignName}`);
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesOutlet = selectedOutlet === 'all' || c.outlet_id === selectedOutlet;
    const matchesSearch = c.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.campaign_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.outlet_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOutlet && matchesSearch;
  });

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenueGen = campaigns.reduce((acc, c) => acc + c.revenue_generated, 0);
  const avgRoi = totalSpend > 0 ? ((totalRevenueGen - totalSpend) / totalSpend) * 100 : 0;
  const totalAcquired = campaigns.reduce((acc, c) => acc + c.customers_acquired, 0);

  const channelPerformanceData = [
    { channel: 'Local Delivery', spend: 85000, revenue: 380000, roi: '347%' },
    { channel: 'Social Ads', spend: 65000, revenue: 245000, roi: '276%' },
    { channel: 'Influencer', spend: 40000, revenue: 140000, roi: '250%' },
    { channel: 'SMS / Email', spend: 15000, revenue: 78000, roi: '420%' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-indigo-600" />
              Marketing & Growth Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              Growth Engine
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Multi-channel campaign orchestration, localized aggregator promotions, and ROAS attribution across all outlets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Launch Campaign
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredCampaigns, null, 2));
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `marketing-roi-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Marketing ROI
          </Button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-600">Active</span>
        </div>
      )}

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'campaigns', name: 'Campaigns', icon: Megaphone, count: campaigns.length },
          { id: 'performance', name: 'Campaign Performance', icon: TrendingUp, badge: `${formatNumber(totalAcquired)} Acquired` },
          { id: 'roi', name: 'Marketing ROI', icon: DollarSign, badge: `${Math.round(avgRoi)}% ROAS` },
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, platforms, outlets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Outlets ({outlets.length})</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          Showing <span className="text-slate-900 font-extrabold">{filteredCampaigns.length}</span> campaigns
        </div>
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Marketing Spend</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalSpend)}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Budget Allocated: {formatCurrency(totalSpend * 1.3)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Attributed Revenue</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalRevenueGen)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Direct Sales Uplift</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Blended ROI</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{Math.round(avgRoi)}%</div>
              <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">{(totalRevenueGen / (totalSpend || 1)).toFixed(1)}x ROAS Multiplier</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Customers Acquired</span>
              <div className="text-2xl font-black text-purple-600 mt-1">{formatNumber(totalAcquired)}</div>
              <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">Avg CAC: ₹{totalAcquired > 0 ? Math.round(totalSpend / totalAcquired) : 45}</span>
            </div>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="px-4 py-3.5">Campaign Name</th>
                    <th className="px-4 py-3.5">Channel / Type</th>
                    <th className="px-4 py-3.5">Target Outlet</th>
                    <th className="px-4 py-3.5 text-right">Spend / Budget</th>
                    <th className="px-4 py-3.5 text-right">Acquired Customers</th>
                    <th className="px-4 py-3.5 text-right">Revenue Generated</th>
                    <th className="px-4 py-3.5 text-center">ROAS / ROI</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCampaigns.map((camp) => {
                    const isHighRoi = camp.roi >= 250;
                    return (
                      <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{camp.campaign_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{camp.start_date} to {camp.end_date}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {camp.campaign_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          {camp.outlet_name}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono">
                          <span className="font-bold text-slate-900">{formatCurrency(camp.spend)}</span>
                          <span className="block text-[10px] text-slate-400">/ {formatCurrency(camp.budget)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {formatNumber(camp.customers_acquired)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                          {formatCurrency(camp.revenue_generated)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full font-black text-xs ring-1 ring-inset",
                            isHighRoi ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                          )}>
                            +{camp.roi}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                            {camp.status}
                          </span>
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

      {/* TAB 2: CAMPAIGN PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Channel Spend vs Revenue Multiplier Breakdown
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Performance across Local Aggregators, Social Media, Influencers, and Retention SMS.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="channel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="spend" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Spend (₹)" />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Revenue Generated (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  CAC & Acquisition Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-indigo-900">Delivery Promo Efficiency:</div>
                  Swiggy/Zomato localized 20% discount coupon in Koregaon Park produced a <strong>3.8x ROAS</strong>, acquiring 840 new customers at ₹42 CAC.
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Top Performing Channels</div>
                  {channelPerformanceData.map((c, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{c.channel}</span>
                      <span className="font-bold text-emerald-600">{c.roi} ROI</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: MARKETING ROI */}
      {activeTab === 'roi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
              <CardContent className="p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Highest ROI Channel</span>
                <h4 className="text-xl font-black text-slate-900">SMS & Retention Blast</h4>
                <div className="text-3xl font-black text-emerald-600 mt-1">4.2x</div>
                <p className="text-xs text-slate-600">Reactivating dormant guests from loyalty database delivers highest margin return.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest Volume Driver</span>
                <h4 className="text-xl font-black text-slate-900">Swiggy & Zomato Promos</h4>
                <div className="text-3xl font-black text-indigo-600 mt-1">₹3.8L</div>
                <p className="text-xs text-slate-600">Drives 58% of total network delivery volume in metro clusters.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Awareness Lift</span>
                <h4 className="text-xl font-black text-slate-900">Food Influencer Collabs</h4>
                <div className="text-3xl font-black text-purple-600 mt-1">+34%</div>
                <p className="text-xs text-slate-600">Instagram Reels campaign in Hyderabad Gachibowli generated 140k impressions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Launch Marketing Campaign</h3>
            <p className="text-xs text-slate-500 mb-4">Set up a marketing promotion for a specific outlet or network.</p>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g. Biryani Weekend Feast 20% Off"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Channel Type</label>
                  <select
                    value={newCampaignType}
                    onChange={(e) => setNewCampaignType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Social">Social Media Ads</option>
                    <option value="Local Delivery">Local Delivery Aggregator</option>
                    <option value="Influencer">Influencer Marketing</option>
                    <option value="Print & Billboard">Print & Billboard</option>
                    <option value="Email & SMS">Email & SMS Loyalty</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Outlet</label>
                  <select
                    value={targetOutletId}
                    onChange={(e) => setTargetOutletId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Campaign Budget (₹)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Initial Spend (₹)</label>
                  <input
                    type="number"
                    value={newSpend}
                    onChange={(e) => setNewSpend(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
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
