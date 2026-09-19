import React, { useState, useEffect } from 'react';
import { 
  Database, 
  TrendingUp, 
  Package, 
  Users, 
  Megaphone, 
  ClipboardCheck, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantSales, 
  saveTenantSales, 
  addTenantSales, 
  importSalesBatch,
  getTenantInventory, 
  saveTenantInventory, 
  addTenantInventory,
  getTenantStaff, 
  saveTenantStaff, 
  addTenantStaff,
  getTenantMarketing, 
  saveTenantMarketing, 
  addTenantMarketing,
  getTenantAudits, 
  saveTenantAudits, 
  addTenantAudit,
  getTenantDataQualityReport,
  calculateBusinessSetupProgress
} from '../services/tenantService';
import { 
  SalesRecord, 
  InventoryRecord, 
  StaffRecord, 
  MarketingRecord, 
  AuditRecord, 
  Outlet, 
  BusinessProfile 
} from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { CSVImporterModal } from '../components/dashboard/CSVImporterModal';

type DataTab = 'sales' | 'inventory' | 'staff' | 'marketing' | 'audits' | 'quality';

export function BusinessDataHub() {
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [currentTab, setCurrentTab] = useState<DataTab>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datasets
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [marketing, setMarketing] = useState<MarketingRecord[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  
  // Modals
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Form States
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [manualSalesDate, setManualSalesDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualRevenue, setManualRevenue] = useState(2400000);
  const [manualOrders, setManualOrders] = useState(4500);
  const [manualCustomers, setManualCustomers] = useState(3900);
  const [manualTarget, setManualTarget] = useState(2300000);

  const loadAllData = () => {
    const biz = getActiveBusiness();
    setActiveBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !selectedOutletId) {
      setSelectedOutletId(outs[0].id);
    }
    setSales(getTenantSales(biz.id));
    setInventory(getTenantInventory(biz.id));
    setStaff(getTenantStaff(biz.id));
    setMarketing(getTenantMarketing(biz.id));
    setAudits(getTenantAudits(biz.id));
  };

  useEffect(() => {
    loadAllData();
    const handleDataUpdate = () => loadAllData();
    window.addEventListener('franchiseops_data_updated', handleDataUpdate);
    window.addEventListener('franchiseops_tenant_changed', handleDataUpdate);
    return () => {
      window.removeEventListener('franchiseops_data_updated', handleDataUpdate);
      window.removeEventListener('franchiseops_tenant_changed', handleDataUpdate);
    };
  }, []);

  const dataQuality = getTenantDataQualityReport(activeBusiness.id);
  const setupProgress = calculateBusinessSetupProgress(activeBusiness.id);

  // Handle Manual Sales Submission
  const handleAddManualSales = (e: React.FormEvent) => {
    e.preventDefault();
    const out = outlets.find(o => o.id === selectedOutletId) || outlets[0];
    const aov = manualOrders > 0 ? manualRevenue / manualOrders : 500;
    addTenantSales(activeBusiness.id, {
      outlet_id: out?.id || 'out_1',
      outlet_name: out?.name || 'Main Outlet',
      date: manualSalesDate,
      revenue: Number(manualRevenue),
      orders: Number(manualOrders),
      customers: Number(manualCustomers),
      aov: Math.round(aov),
      target_revenue: Number(manualTarget),
      product_category: 'Core Category',
    });
    setIsManualModalOpen(false);
    loadAllData();
  };

  // CSV Expected Columns Config
  const getExpectedColumns = () => {
    switch (currentTab) {
      case 'sales':
        return [
          { key: 'outlet_name', label: 'Outlet Name', required: true },
          { key: 'date', label: 'Date (YYYY-MM-DD)', required: true },
          { key: 'revenue', label: 'Revenue (₹)', required: true },
          { key: 'orders', label: 'Orders Processed', required: true },
          { key: 'customers', label: 'Customer Footfall', required: true },
          { key: 'target_revenue', label: 'Target Revenue (₹)', required: false },
        ];
      case 'inventory':
        return [
          { key: 'outlet_name', label: 'Outlet Name', required: true },
          { key: 'product_name', label: 'Product Name', required: true },
          { key: 'sku', label: 'SKU Code', required: true },
          { key: 'category', label: 'Category', required: true },
          { key: 'current_stock', label: 'Current Stock', required: true },
          { key: 'min_stock', label: 'Min Safety Buffer', required: true },
          { key: 'daily_consumption', label: 'Daily Burn Rate', required: false },
          { key: 'unit', label: 'Unit (kg/litres/units)', required: false },
          { key: 'supplier', label: 'Supplier Name', required: true },
          { key: 'lead_time_days', label: 'Supplier Lead Time (Days)', required: false },
          { key: 'unit_cost', label: 'Unit Cost (₹)', required: false },
        ];
      case 'staff':
        return [
          { key: 'outlet_name', label: 'Outlet Name', required: true },
          { key: 'employee_name', label: 'Employee Name', required: true },
          { key: 'role', label: 'Role / Designation', required: true },
          { key: 'attendance_pct', label: 'Attendance %', required: true },
          { key: 'hours_worked', label: 'Hours Worked', required: true },
        ];
      default:
        return [
          { key: 'outlet_name', label: 'Outlet Name', required: true },
          { key: 'date', label: 'Date', required: true },
          { key: 'metric', label: 'Metric Value', required: true },
        ];
    }
  };

  const handleCsvImported = (rows: Record<string, any>[]): number => {
    if (currentTab === 'sales') {
      const records = rows.map((r, i) => ({
        outlet_id: outlets.find(o => o.name.toLowerCase().includes(r.outlet_name?.toLowerCase()))?.id || outlets[0]?.id || `out_gen_${i}`,
        outlet_name: r.outlet_name || outlets[0]?.name || 'Outlet',
        date: r.date || new Date().toISOString().split('T')[0],
        revenue: Number(r.revenue) || 100000,
        orders: Number(r.orders) || 200,
        customers: Number(r.customers) || 180,
        aov: Number(r.orders) > 0 ? Number(r.revenue) / Number(r.orders) : 500,
        target_revenue: Number(r.target_revenue) || Number(r.revenue) * 1.1,
        product_category: 'Imported Sales',
      }));
      importSalesBatch(activeBusiness.id, records);
      loadAllData();
      return records.length;
    } else if (currentTab === 'inventory') {
      rows.forEach((r, i) => {
        const out = outlets.find(o => o.name.toLowerCase().includes(r.outlet_name?.toLowerCase())) || outlets[0];
        const currentStock = Number(r.current_stock) || 100;
        const minStock = Number(r.min_stock) || 50;
        const status = currentStock === 0 ? 'Stockout Risk' : currentStock <= minStock ? 'Low Stock' : 'In Stock';
        addTenantInventory(activeBusiness.id, {
          outlet_id: out?.id || `out_${i}`,
          outlet_name: out?.name || r.outlet_name || 'Outlet',
          product_name: r.product_name || 'Inventory Item',
          sku: r.sku || `SKU-IMP-${i + 100}`,
          category: r.category || 'Grains & Staples',
          current_stock: currentStock,
          min_stock: minStock,
          max_stock: Number(r.max_stock) || minStock * 3,
          daily_consumption: Number(r.daily_consumption) || 10,
          waste_qty: 0,
          unit: r.unit || 'kg',
          supplier: r.supplier || 'Primary Supplier',
          last_restocked: new Date().toISOString().split('T')[0],
          status: status,
        });
      });
      loadAllData();
      return rows.length;
    }
    return rows.length;
  };


  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Data Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              {activeBusiness.name}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Central operational registry for sales, inventory, staff rosters, marketing campaigns, and compliance audits.
          </p>
        </div>

        {/* Global Hub Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => setIsManualModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Record
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsCsvModalOpen(true)}
            className="bg-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              const exportData = currentTab === 'sales' ? sales : currentTab === 'inventory' ? inventory : currentTab === 'staff' ? staff : currentTab === 'marketing' ? marketing : audits;
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `${activeBusiness.name.toLowerCase().replace(/\s+/g, '_')}_${currentTab}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="bg-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* READINESS & DATA QUALITY SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">AI Setup Readiness</span>
            <div className="text-2xl font-extrabold text-slate-900">{setupProgress.overallPercentage}% Ready</div>
            <span className="text-xs text-indigo-600 font-semibold mt-0.5 block">{setupProgress.readinessMessage}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
            {setupProgress.overallPercentage}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Data Quality Score</span>
            <div className="text-2xl font-extrabold text-slate-900">{dataQuality.overallQualityScore}/100</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Schema Validated
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Active Records</span>
            <div className="text-2xl font-extrabold text-slate-900">{formatNumber(dataQuality.totalRecordsCount)}</div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">Across {outlets.length} Registered Outlets</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DOMAIN TABS NAVIGATION */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'sales', label: `Sales Streams (${sales.length})`, icon: TrendingUp },
            { id: 'inventory', label: `Inventory & Stock (${inventory.length})`, icon: Package },
            { id: 'staff', label: `Staff & Workforce (${staff.length})`, icon: Users },
            { id: 'marketing', label: `Marketing Campaigns (${marketing.length})`, icon: Megaphone },
            { id: 'audits', label: `Audits & Compliance (${audits.length})`, icon: ClipboardCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as DataTab)}
                className={cn(
                  "py-3.5 px-1 inline-flex items-center gap-2 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT: SALES STREAM */}
      {currentTab === 'sales' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Franchise Sales Stream Registry</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Ingested daily and monthly sales records directly powering the Outlet Performance Agent.</p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sales records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Outlet</th>
                  <th className="px-6 py-3.5 font-bold">Date</th>
                  <th className="px-6 py-3.5 font-bold text-right">Revenue</th>
                  <th className="px-6 py-3.5 font-bold text-right">Target</th>
                  <th className="px-6 py-3.5 font-bold text-center">Target Achieved</th>
                  <th className="px-6 py-3.5 font-bold text-right">Orders</th>
                  <th className="px-6 py-3.5 font-bold text-right">Customers</th>
                  <th className="px-6 py-3.5 font-bold text-right">AOV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {sales
                  .filter(s => s.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((record) => {
                    const ach = record.target_revenue > 0 ? (record.revenue / record.target_revenue) * 100 : 100;
                    return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-bold text-slate-900">{record.outlet_name}</td>
                        <td className="px-6 py-3.5 text-slate-500 font-mono">{record.date}</td>
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900 text-right">{formatCurrency(record.revenue)}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-600 text-right">{formatCurrency(record.target_revenue)}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold", ach >= 100 ? "bg-emerald-50 text-emerald-700" : ach >= 85 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700")}>
                            {ach.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-right">{formatNumber(record.orders)}</td>
                        <td className="px-6 py-3.5 font-mono text-right">{formatNumber(record.customers)}</td>
                        <td className="px-6 py-3.5 font-mono font-semibold text-right">₹{Math.round(record.aov)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: INVENTORY & STOCK */}
      {currentTab === 'inventory' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Inventory & Stock Health Registry</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Track ingredient stock levels, consumption velocity, and predict stockout risks.</p>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Product / Ingredient</th>
                  <th className="px-6 py-3.5 font-bold">Outlet</th>
                  <th className="px-6 py-3.5 font-bold">SKU & Category</th>
                  <th className="px-6 py-3.5 font-bold text-right">Current Stock</th>
                  <th className="px-6 py-3.5 font-bold text-right">Min Safety Buffer</th>
                  <th className="px-6 py-3.5 font-bold">Supplier</th>
                  <th className="px-6 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{inv.product_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{inv.outlet_name}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{inv.sku} • {inv.category}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 text-right">{inv.current_stock} {inv.unit}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 text-right">{inv.min_stock} {inv.unit}</td>
                    <td className="px-6 py-3.5 text-slate-600">{inv.supplier}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                        inv.status === 'In Stock' ? "bg-emerald-50 text-emerald-700" :
                        inv.status === 'Low Stock' ? "bg-amber-50 text-amber-700" :
                        "bg-rose-50 text-rose-700"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: STAFF & WORKFORCE */}
      {currentTab === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Workforce & Staff Performance</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Monitor attendance, shift fulfillment, and kitchen productivity metrics.</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Employee Name</th>
                  <th className="px-6 py-3.5 font-bold">Outlet</th>
                  <th className="px-6 py-3.5 font-bold">Role</th>
                  <th className="px-6 py-3.5 font-bold text-center">Attendance %</th>
                  <th className="px-6 py-3.5 font-bold text-right">Hours Worked</th>
                  <th className="px-6 py-3.5 font-bold text-right">Sales Contribution</th>
                  <th className="px-6 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {staff.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{st.employee_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{st.outlet_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{st.role}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={cn("px-2 py-0.5 rounded-md font-bold font-mono text-[11px]", st.attendance_pct >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                        {st.attendance_pct}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-right">{st.hours_worked} hrs</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-right">{formatCurrency(st.sales_contribution)}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: MARKETING CAMPAIGNS */}
      {currentTab === 'marketing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Marketing Campaigns & ROI Intelligence</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Analyze campaign spend, customer acquisition efficiency, and revenue multipliers.</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Campaign Name</th>
                  <th className="px-6 py-3.5 font-bold">Outlet</th>
                  <th className="px-6 py-3.5 font-bold">Channel</th>
                  <th className="px-6 py-3.5 font-bold text-right">Spend</th>
                  <th className="px-6 py-3.5 font-bold text-right">Acquired</th>
                  <th className="px-6 py-3.5 font-bold text-right">Revenue Generated</th>
                  <th className="px-6 py-3.5 font-bold text-center">ROI %</th>
                  <th className="px-6 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {marketing.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{m.campaign_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{m.outlet_name}</td>
                    <td className="px-6 py-3.5 text-slate-500">{m.campaign_type}</td>
                    <td className="px-6 py-3.5 font-mono text-right">{formatCurrency(m.spend)}</td>
                    <td className="px-6 py-3.5 font-mono text-right">{formatNumber(m.customers_acquired)}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-emerald-700 text-right">{formatCurrency(m.revenue_generated)}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700">
                        +{m.roi}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: AUDITS & COMPLIANCE */}
      {currentTab === 'audits' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Operational Audits & SOP Compliance</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Food safety, cleanliness, service speed, and standard compliance ratings.</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Audit Date</th>
                  <th className="px-6 py-3.5 font-bold">Outlet</th>
                  <th className="px-6 py-3.5 font-bold">Category</th>
                  <th className="px-6 py-3.5 font-bold text-center">Score</th>
                  <th className="px-6 py-3.5 font-bold">Observed Issue</th>
                  <th className="px-6 py-3.5 font-bold">Remediation</th>
                  <th className="px-6 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono text-slate-500">{a.audit_date}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{a.outlet_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{a.category}</td>
                    <td className="px-6 py-3.5 text-center font-bold">
                      <span className={cn("px-2 py-0.5 rounded-md", a.compliance_score >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                        {a.compliance_score}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 max-w-xs">{a.issue}</td>
                    <td className="px-6 py-3.5 text-emerald-800 max-w-xs">{a.corrective_action}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", a.resolution_status === 'Resolved' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                        {a.resolution_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CSV IMPORTER MODAL */}
      <CSVImporterModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        entityName={currentTab.toUpperCase()}
        expectedColumns={getExpectedColumns()}
        onImport={handleCsvImported}
      />

      {/* MANUAL ENTRY MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Operational Sales Entry</h3>
            <form onSubmit={handleAddManualSales} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Outlet *</label>
                <select
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={manualSalesDate}
                    onChange={(e) => setManualSalesDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Revenue (₹)</label>
                  <input
                    type="number"
                    value={manualRevenue}
                    onChange={(e) => setManualRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Orders Count</label>
                  <input
                    type="number"
                    value={manualOrders}
                    onChange={(e) => setManualOrders(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Revenue (₹)</label>
                  <input
                    type="number"
                    value={manualTarget}
                    onChange={(e) => setManualTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsManualModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  Save Sales Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
