import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Truck, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantInventory, saveTenantInventory, addTenantInventory, getTenantOutlets } from '../services/tenantService';
import { InventoryRecord, Outlet, BusinessProfile } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stock';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New stock form
  const [newProductName, setNewProductName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Grains & Staples');
  const [newCurrentStock, setNewCurrentStock] = useState(500);
  const [newMinStock, setNewMinStock] = useState(150);
  const [newMaxStock, setNewMaxStock] = useState(1000);
  const [newDailyConsumption, setNewDailyConsumption] = useState(40);
  const [newUnit, setNewUnit] = useState('kg');
  const [newSupplier, setNewSupplier] = useState('Metro Wholesale Agro');
  const [targetOutletId, setTargetOutletId] = useState('');

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !targetOutletId) {
      setTargetOutletId(outs[0].id);
    }
    const inv = getTenantInventory(biz.id);
    setInventory(inv);
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

  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !targetOutletId) return;

    const outName = outlets.find(o => o.id === targetOutletId)?.name || 'Franchise Unit';
    const status = newCurrentStock <= newMinStock * 0.5 
      ? 'Stockout Risk' 
      : newCurrentStock <= newMinStock 
      ? 'Low Stock' 
      : 'In Stock';

    const newRecord: InventoryRecord = {
      id: 'inv_' + Date.now(),
      business_id: business.id,
      outlet_id: targetOutletId,
      outlet_name: outName,
      product_name: newProductName,
      sku: newSku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      category: newCategory,
      current_stock: Number(newCurrentStock),
      min_stock: Number(newMinStock),
      max_stock: Number(newMaxStock),
      daily_consumption: Number(newDailyConsumption),
      waste_qty: 0,
      unit: newUnit,
      supplier: newSupplier,
      last_restocked: new Date().toISOString().split('T')[0],
      status: status
    };

    addTenantInventory(newRecord);
    loadData();
    setIsAddModalOpen(false);
    showNotice(`Created stock entry for ${newProductName}`);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleQuickReorder = (item: InventoryRecord) => {
    const reorderQty = Math.max(item.max_stock - item.current_stock, 100);
    const updated = inventory.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          current_stock: i.current_stock + reorderQty,
          status: 'In Stock' as const,
          last_restocked: new Date().toISOString().split('T')[0]
        };
      }
      return i;
    });
    saveTenantInventory(business.id, updated);
    setInventory(updated);
    showNotice(`Dispatched automated PO to ${item.supplier} for ${reorderQty} ${item.unit} of ${item.product_name}!`);
  };

  // Filtered dataset
  const filteredInventory = inventory.filter(i => {
    const matchesOutlet = selectedOutlet === 'all' || i.outlet_id === selectedOutlet;
    const matchesCategory = selectedCategory === 'all' || i.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = i.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOutlet && matchesCategory && matchesSearch;
  });

  const lowStockItems = filteredInventory.filter(i => i.status === 'Low Stock' || i.status === 'Stockout Risk');
  const categories = Array.from(new Set(inventory.map(i => i.category)));

  // Forecast time data
  const forecastChartData = [
    { day: 'Mon', actual: 420, forecasted: 410, buffer: 500 },
    { day: 'Tue', actual: 380, forecasted: 390, buffer: 500 },
    { day: 'Wed', actual: 450, forecasted: 440, buffer: 500 },
    { day: 'Thu', actual: 490, forecasted: 480, buffer: 500 },
    { day: 'Fri', actual: null, forecasted: 680, buffer: 500 },
    { day: 'Sat (Surge)', actual: null, forecasted: 920, buffer: 500 },
    { day: 'Sun (Peak)', actual: null, forecasted: 950, buffer: 500 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-7 h-7 text-indigo-600" />
              Franchise Inventory OS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              Agentic Supply Chain
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time multi-outlet stock monitoring, predictive depletion forecasting, and automated vendor reordering.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add SKU Item
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredInventory, null, 2));
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Inventory
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
          <span className="text-[10px] text-emerald-600">Saved to Cloud</span>
        </div>
      )}

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'stock', name: 'Stock Overview', icon: Package, count: filteredInventory.length },
          { id: 'forecast', name: 'Demand Forecast', icon: TrendingUp, badge: 'AI Predictive' },
          { id: 'low-stock', name: 'Low Stock Alerts', icon: AlertTriangle, count: lowStockItems.length, alert: lowStockItems.length > 0 },
          { id: 'reorder', name: 'Reorder Recommendations', icon: ShoppingCart, badge: '1-Click PO' },
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
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  tab.alert ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                )}>
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
              placeholder="Search SKU, ingredient, supplier..."
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

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          Showing <span className="text-slate-900 font-extrabold">{filteredInventory.length}</span> items
        </div>
      </div>

      {/* TAB 1: STOCK OVERVIEW */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total SKUs Monitored</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{inventory.length} SKUs</div>
              <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">Across {outlets.length} Outlets</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Healthy Stocked</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {inventory.filter(i => i.status === 'In Stock').length}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Optimal Buffer Cover</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Low Stock Warning</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {inventory.filter(i => i.status === 'Low Stock').length}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">Nearing Threshold</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Stockout Risks</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {inventory.filter(i => i.status === 'Stockout Risk').length}
              </div>
              <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">Action Required Immediately</span>
            </div>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="px-4 py-3.5">Product & SKU</th>
                    <th className="px-4 py-3.5">Outlet Location</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Current Stock</th>
                    <th className="px-4 py-3.5 text-right">Min Buffer</th>
                    <th className="px-4 py-3.5 text-right">Daily Velocity</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Supplier</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInventory.map((item) => {
                    const isLow = item.status === 'Low Stock' || item.status === 'Stockout Risk';
                    const runoutDays = item.daily_consumption > 0 ? (item.current_stock / item.daily_consumption).toFixed(1) : '∞';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{item.product_name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-medium">
                          {item.outlet_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {item.current_stock} <span className="text-slate-400 font-normal">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                          {item.min_stock} {item.unit}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {item.daily_consumption} {item.unit}/day
                          <span className="block text-[10px] text-slate-400">~{runoutDays}d left</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset",
                            item.status === 'In Stock' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                            item.status === 'Low Stock' ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                            "bg-rose-50 text-rose-700 ring-rose-600/20"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-xs">
                          {item.supplier}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant={isLow ? "primary" : "outline"}
                            onClick={() => handleQuickReorder(item)}
                            className="text-xs font-bold py-1 h-7"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {isLow ? "Reorder" : "Restock"}
                          </Button>
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

      {/* TAB 2: DEMAND FORECAST */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Projected Weekly Demand vs Buffer Curve (Basmati & Key Proteins)
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Calculated from historical POS orders, seasonal weekend footfall uplift, and weather forecasts.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="forecasted" stroke="#4f46e5" strokeWidth={3} fill="url(#colorForecast)" name="AI Demand (kg)" />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fill="none" name="Actual Consumption" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Depletion Horizon Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700">
                  <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Weekend Surge Alert:
                  </div>
                  Friday-Sunday sales volume is projected to spike by <strong>+42%</strong>. Indiranagar and Koregaon Park outlets require +180kg buffer replenishment by Thursday EOD.
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">High Velocity Run-Outs</div>
                  {filteredInventory.slice(0, 3).map(item => (
                    <div key={item.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.product_name}</span>
                        <span className="text-[10px] text-slate-500">{item.outlet_name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
                        {(item.current_stock / item.daily_consumption).toFixed(1)} Days Left
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: LOW STOCK */}
      {activeTab === 'low-stock' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block text-sm">Critical Threshold Breaches Detected</strong>
                <span>{lowStockItems.length} items have breached safety buffers and risk operational disruption.</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                lowStockItems.forEach(i => handleQuickReorder(i));
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
            >
              Dispatch All POs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <Card key={item.id} className="border-amber-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{item.category}</span>
                      <h4 className="font-black text-slate-900 text-sm">{item.product_name}</h4>
                      <p className="text-xs text-slate-500">{item.outlet_name}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <span className="font-bold font-mono text-rose-600">{item.current_stock} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Min Threshold</span>
                      <span className="font-bold font-mono text-slate-700">{item.min_stock} {item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Supplier: <strong className="text-slate-700">{item.supplier}</strong></span>
                    <Button
                      size="sm"
                      onClick={() => handleQuickReorder(item)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                      1-Click PO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REORDER RECOMMENDATIONS */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                AI-Generated Automated Purchase Order Requisitions
              </CardTitle>
              <p className="text-xs text-slate-500">
                Calculated to replenish inventory to optimal max buffer with minimum lead-time cost.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                      <th className="px-4 py-3.5">Requisition SKU</th>
                      <th className="px-4 py-3.5">Destination Outlet</th>
                      <th className="px-4 py-3.5">Recommended Qty</th>
                      <th className="px-4 py-3.5">Est. Restock Cost</th>
                      <th className="px-4 py-3.5">Preferred Vendor</th>
                      <th className="px-4 py-3.5 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {lowStockItems.map((item) => {
                      const reqQty = item.max_stock - item.current_stock;
                      const estCost = reqQty * 120; // unit price mock
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 block">{item.product_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">
                            {item.outlet_name}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                            +{reqQty} {item.unit}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                            {formatCurrency(estCost)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {item.supplier}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleQuickReorder(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Approve & Dispatch PO
                            </Button>
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

      {/* Add SKU Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Inventory SKU</h3>
            <p className="text-xs text-slate-500 mb-4">Register an inventory commodity or ingredient for your franchise outlets.</p>

            <form onSubmit={handleCreateStock} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Royal Basmati Rice"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. SKU-BAS-01"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Assign to Outlet</label>
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
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Spices & Seasonings">Spices & Seasonings</option>
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Dairy & Produce">Dairy & Produce</option>
                    <option value="Packaging & Disposables">Packaging & Disposables</option>
                    <option value="Beverages & Syrups">Beverages & Syrups</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={newCurrentStock}
                    onChange={(e) => setNewCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Min Buffer</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Daily Velocity</label>
                  <input
                    type="number"
                    value={newDailyConsumption}
                    onChange={(e) => setNewDailyConsumption(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
