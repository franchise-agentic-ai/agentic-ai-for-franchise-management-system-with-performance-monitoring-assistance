import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Send,
  Zap,
  Sparkles,
  ArrowDownRight,
  ShieldAlert,
  Boxes,
  HelpCircle,
  Eye,
  XCircle,
  BarChart3,
  Bot,
  ExternalLink,
  ArrowLeftRight,
  RotateCcw,
  Trash2,
  Check,
  X,
  History,
  ClipboardCheck,
  Building2,
  DollarSign,
  AlertOctagon,
  TrendingDown
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  DEFAULT_BUSINESS,
  getActiveBusiness, 
  getTenantInventoryEnhanced, 
  saveTenantInventoryEnhanced, 
  addTenantInventoryEnhanced, 
  getTenantOutlets,
  saveTenantOutlets,
  getTenantSales,
  getTenantMovements,
  getTenantRecommendationsEnhanced,
  getTenantPurchaseOrders,
  saveTenantPurchaseOrders,
  createPurchaseOrder,
  approvePurchaseOrder,
  receiveGoods,
  getTenantTransfers,
  saveTenantTransfers,
  requestStockTransfer,
  approveStockTransfer,
  dispatchStockTransfer,
  receiveStockTransfer,
  getTenantStockCounts,
  saveTenantStockCounts,
  createStockCountSession,
  submitStockCountSession,
  approveStockCountAdjustment,
  getTenantWastage,
  saveTenantWastage,
  recordWastageEvent,
  getTenantInventoryAuditLogs,
  approveReplenishmentRecommendation,
  dismissReplenishmentRecommendation,
  getTenantSuppliers,
  getTenantProducts
} from '../services/tenantService';
import { 
  forecastProductDemand, 
  detectStockoutRisks, 
  generateSmartReplenishmentDecisions, 
  identifyFastAndSlowMovers, 
  calculateInventoryKPIs, 
  compareOutletsInventory,
  calculateControlTowerSummary,
  calculateWastageSummary,
  calculateProductStockLedger
} from '../services/inventoryEngine';
import { runInventoryAgent, InventoryAgentScanResult } from '../services/inventoryAgent';
import { 
  InventoryItemEnhanced, 
  Outlet, 
  BusinessProfile, 
  DemandForecastResult, 
  StockoutRiskAssessment, 
  ReplenishmentRecommendation, 
  FastSlowMovingProduct, 
  OutletInventoryComparison, 
  InventoryKPIs, 
  InventoryAgentInsight,
  PurchaseOrder,
  StockTransfer,
  StockCountSession,
  WastageRecord,
  ControlTowerSummary,
  WastageSummary,
  ProductStockLedger,
  VarianceReason,
  WastageReason,
  SmartReplenishmentAction
} from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'control_tower';
  const validTabs = ['control_tower', 'stock', 'decisions', 'orders', 'transfers', 'reconciliation', 'wastage', 'forecast', 'insights'];
  const tabAliasMap: Record<string, string> = {
    risks: 'control_tower',
    'low-stock': 'control_tower',
    'low_stock': 'control_tower',
    reorder: 'decisions',
    overstock: 'stock',
    comparison: 'control_tower',
  };
  const activeTab = validTabs.includes(rawTab) ? rawTab : (tabAliasMap[rawTab] || 'control_tower');

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [inventory, setInventory] = useState<InventoryItemEnhanced[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [stockCounts, setStockCounts] = useState<StockCountSession[]>([]);
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>([]);
  const [recommendations, setRecommendations] = useState<ReplenishmentRecommendation[]>([]);
  
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [ledgerItem, setLedgerItem] = useState<InventoryItemEnhanced | null>(null);
  const [activeStockCountSession, setActiveStockCountSession] = useState<StockCountSession | null>(null);

  // Agent Thinking State
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentThinkingStep, setAgentThinkingStep] = useState<string>('');
  const [agentPhase, setAgentPhase] = useState<number>(0);
  const [agentScanResult, setAgentScanResult] = useState<InventoryAgentScanResult | null>(null);

  // PO Form State
  const [poSupplier, setPoSupplier] = useState('Telangana Agri Supply Hub');
  const [poOutlet, setPoOutlet] = useState('');
  const [poProduct, setPoProduct] = useState('prod_rice_01');
  const [poQuantity, setPoQuantity] = useState(100);
  const [poUnitCost, setPoUnitCost] = useState(140);
  const [poExpectedDays, setPoExpectedDays] = useState(3);

  // Transfer Form State
  const [trSourceOutlet, setTrSourceOutlet] = useState('');
  const [trDestOutlet, setTrDestOutlet] = useState('');
  const [trProduct, setTrProduct] = useState('');
  const [trQuantity, setTrQuantity] = useState(25);
  const [trReason, setTrReason] = useState('Shortage balance reorder avoidance');

  // Wastage Form State
  const [wstOutlet, setWstOutlet] = useState('');
  const [wstProduct, setWstProduct] = useState('');
  const [wstQuantity, setWstQuantity] = useState(5);
  const [wstReason, setWstReason] = useState<WastageReason>('Kitchen Spoilage');
  const [wstNotes, setWstNotes] = useState('');

  // Goods Receipt Form State
  const [receiptDamagedQty, setReceiptDamagedQty] = useState<Record<string, number>>({});
  const [receiptReceivedQty, setReceiptReceivedQty] = useState<Record<string, number>>({});

  // Add SKU Form State
  const [newProductName, setNewProductName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Grains & Staples');
  const [newCurrentStock, setNewCurrentStock] = useState(300);
  const [newMinStock, setNewMinStock] = useState(100);
  const [newMaxStock, setNewMaxStock] = useState(800);
  const [newDailyConsumption, setNewDailyConsumption] = useState(25);
  const [newUnitCost, setNewUnitCost] = useState(150);
  const [newLeadTime, setNewLeadTime] = useState(3);
  const [newUnit, setNewUnit] = useState('kg');
  const [newSupplier, setNewSupplier] = useState('Agro Logistics Hub');
  const [targetOutletId, setTargetOutletId] = useState('');

  const loadAllData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    let outs = getTenantOutlets(biz.id);
    if (!outs || outs.length === 0) {
      outs = getTenantOutlets(DEFAULT_BUSINESS.id);
      saveTenantOutlets(biz.id, outs);
    }
    setOutlets(outs);

    if (outs.length > 0) {
      if (!targetOutletId) setTargetOutletId(outs[0].id);
      if (!poOutlet) setPoOutlet(outs[0].id);
      if (!trSourceOutlet && outs.length > 1) {
        setTrSourceOutlet(outs[0].id);
        setTrDestOutlet(outs[1].id);
      }
      if (!wstOutlet) setWstOutlet(outs[0].id);
    }

    let inv = getTenantInventoryEnhanced(biz.id);
    if (!inv || inv.length === 0) {
      inv = getTenantInventoryEnhanced(DEFAULT_BUSINESS.id);
      saveTenantInventoryEnhanced(biz.id, inv);
    }
    setInventory(inv);

    if (inv.length > 0) {
      if (!trProduct) setTrProduct(inv[0].product_id);
      if (!wstProduct) setWstProduct(inv[0].product_id);
    }

    let pos = getTenantPurchaseOrders(biz.id);
    if (!pos || pos.length === 0) {
      pos = getTenantPurchaseOrders(DEFAULT_BUSINESS.id);
      saveTenantPurchaseOrders(biz.id, pos);
    }
    setPurchaseOrders(pos);

    let trs = getTenantTransfers(biz.id);
    if (!trs || trs.length === 0) {
      trs = getTenantTransfers(DEFAULT_BUSINESS.id);
      saveTenantTransfers(biz.id, trs);
    }
    setTransfers(trs);

    let scs = getTenantStockCounts(biz.id);
    if (!scs || scs.length === 0) {
      scs = getTenantStockCounts(DEFAULT_BUSINESS.id);
      saveTenantStockCounts(biz.id, scs);
    }
    setStockCounts(scs);

    let wst = getTenantWastage(biz.id);
    if (!wst || wst.length === 0) {
      wst = getTenantWastage(DEFAULT_BUSINESS.id);
      saveTenantWastage(biz.id, wst);
    }
    setWastageRecords(wst);

    const recs = getTenantRecommendationsEnhanced(biz.id);
    setRecommendations(recs);
  };

  useEffect(() => {
    loadAllData();
    const handleUpdate = () => loadAllData();
    window.addEventListener('franchiseops_tenant_changed', handleUpdate);
    window.addEventListener('franchiseops_data_updated', handleUpdate);
    window.addEventListener('franchiseops_recs_updated', handleUpdate);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', handleUpdate);
      window.removeEventListener('franchiseops_data_updated', handleUpdate);
      window.removeEventListener('franchiseops_recs_updated', handleUpdate);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Run autonomous inventory agent
  const handleRunInventoryAgent = async () => {
    setIsAgentRunning(true);
    setAgentPhase(1);
    try {
      const result = await runInventoryAgent(business.id, (step, phase) => {
        setAgentThinkingStep(step);
        setAgentPhase(phase);
      });
      setAgentScanResult(result);
      loadAllData();
      showNotice('Autonomous Inventory Agent completed diagnostic scan & synchronized recommendations!');
    } catch (err) {
      console.error(err);
      showNotice('Error running Inventory Agent.');
    } finally {
      setIsAgentRunning(false);
    }
  };

  // KPI & Control Tower calculations
  const sales = getTenantSales(business.id);
  const movements = getTenantMovements(business.id);
  const smartRecs = generateSmartReplenishmentDecisions(inventory, purchaseOrders, outlets, sales);
  const stockoutRisks = detectStockoutRisks(inventory, sales, purchaseOrders);
  const kpis = calculateInventoryKPIs(inventory, smartRecs, purchaseOrders, transfers, wastageRecords);
  const controlTower = calculateControlTowerSummary(inventory, smartRecs, purchaseOrders, transfers, wastageRecords);
  const wastageSummary = calculateWastageSummary(wastageRecords, inventory);
  const outletComps = compareOutletsInventory(inventory, outlets);
  const fastSlowMovers = identifyFastAndSlowMovers(inventory, sales);
  const forecasts = inventory.map(item => forecastProductDemand(item, sales, movements, 7));

  // Filtered inventory
  const filteredInventory = inventory.filter(item => {
    if (selectedOutlet !== 'all' && item.outlet_id !== selectedOutlet) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm) {
      const matchName = item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSku = item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSupplier = item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchOutlet = item.outlet_name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName && !matchSku && !matchSupplier && !matchOutlet) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(inventory.map(i => i.category)));

  // Actions
  const handleApproveRec = (recId: string) => {
    const res = approveReplenishmentRecommendation(business.id, recId);
    showNotice(res.message);
    loadAllData();
  };

  const handleDismissRec = (recId: string) => {
    const res = dismissReplenishmentRecommendation(business.id, recId);
    showNotice(res.message);
    loadAllData();
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const destOutlet = outlets.find(o => o.id === poOutlet);
    const prod = inventory.find(i => i.product_id === poProduct || i.id === poProduct);
    if (!destOutlet || !prod) return;

    createPurchaseOrder(business.id, {
      supplier_name: poSupplier,
      outlet_id: destOutlet.id,
      outlet_name: destOutlet.name,
      items: [
        {
          id: `poi_${Date.now()}`,
          product_id: prod.product_id,
          product_name: prod.product_name,
          sku: prod.sku,
          unit: prod.unit,
          quantity_ordered: poQuantity,
          quantity_received: 0,
          quantity_damaged: 0,
          unit_cost: poUnitCost,
          total_cost: poQuantity * poUnitCost,
        }
      ],
      total_amount: poQuantity * poUnitCost,
      status: 'ORDERED',
      expected_delivery: new Date(Date.now() + poExpectedDays * 86400000).toISOString().split('T')[0],
      created_by: 'Vijay Kumar (Manager)',
      approved_by: 'Vijay Kumar',
      notes: 'Manually placed procurement order.',
    });

    setIsCreatePOModalOpen(false);
    showNotice(`Purchase Order dispatched to ${poSupplier} for ${destOutlet.name}!`);
    loadAllData();
  };

  const handleApprovePO = (poId: string) => {
    approvePurchaseOrder(business.id, poId, 'Vijay Kumar');
    showNotice(`Purchase order approved and transmitted to supplier!`);
    loadAllData();
  };

  const handleOpenReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const recQty: Record<string, number> = {};
    const dmgQty: Record<string, number> = {};
    po.items.forEach(it => {
      recQty[it.product_id] = it.quantity_ordered - (it.quantity_received || 0);
      dmgQty[it.product_id] = 0;
    });
    setReceiptReceivedQty(recQty);
    setReceiptDamagedQty(dmgQty);
  };

  const handleSubmitGoodsReceipt = () => {
    if (!receivingPO) return;
    const items = receivingPO.items.map(it => ({
      product_id: it.product_id,
      quantity_received: receiptReceivedQty[it.product_id] || 0,
      quantity_damaged: receiptDamagedQty[it.product_id] || 0,
    }));

    receiveGoods(business.id, {
      po_id: receivingPO.id,
      received_by: 'Dock Supervisor',
      notes: 'Verified against supplier delivery invoice.',
      items,
    });

    setReceivingPO(null);
    showNotice(`Goods Receipt recorded! Inventory balances & stock ledger updated.`);
    loadAllData();
  };

  const handleRequestTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const srcOut = outlets.find(o => o.id === trSourceOutlet);
    const dstOut = outlets.find(o => o.id === trDestOutlet);
    const prod = inventory.find(i => i.product_id === trProduct || i.id === trProduct);
    if (!srcOut || !dstOut || !prod) return;

    requestStockTransfer(business.id, {
      source_outlet_id: srcOut.id,
      source_outlet_name: srcOut.name,
      destination_outlet_id: dstOut.id,
      destination_outlet_name: dstOut.name,
      product_id: prod.product_id,
      product_name: prod.product_name,
      sku: prod.sku,
      unit: prod.unit,
      quantity: trQuantity,
      unit_cost: prod.unit_cost,
      status: 'TRANSFER_APPROVAL',
      requested_by: 'Vijay Kumar (Manager)',
      approved_by: 'Vijay Kumar',
      reason: trReason,
    });

    setIsTransferModalOpen(false);
    showNotice(`Stock transfer requested: ${trQuantity} ${prod.unit} from ${srcOut.name} ➔ ${dstOut.name}!`);
    loadAllData();
  };

  const handleDispatchTransfer = (transferId: string) => {
    dispatchStockTransfer(business.id, transferId);
    showNotice(`Stock transfer marked as Dispatched! Outflow recorded in source ledger.`);
    loadAllData();
  };

  const handleReceiveTransfer = (transferId: string) => {
    receiveStockTransfer(business.id, transferId, 'Destination Receiving Staff');
    showNotice(`Stock transfer marked as Received! Inflow recorded in destination ledger.`);
    loadAllData();
  };

  const handleStartStockCount = (outletId: string) => {
    const session = createStockCountSession(business.id, outletId, `Physical Count Audit - ${new Date().toLocaleDateString()}`, 'Vijay Kumar');
    setActiveStockCountSession(session);
    setIsStockCountModalOpen(true);
    loadAllData();
  };

  const handleApproveStockCount = (sessionId: string) => {
    approveStockCountAdjustment(business.id, sessionId, 'Vijay Kumar (Auditor)');
    showNotice('Stock count physical reconciliation approved! Audited balances synced with ledger.');
    loadAllData();
  };

  const handleRecordWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const out = outlets.find(o => o.id === wstOutlet);
    const prod = inventory.find(i => i.product_id === wstProduct || i.id === wstProduct);
    if (!out || !prod) return;

    recordWastageEvent(business.id, {
      outlet_id: out.id,
      outlet_name: out.name,
      product_id: prod.product_id,
      product_name: prod.product_name,
      sku: prod.sku,
      unit: prod.unit,
      quantity: wstQuantity,
      unit_cost: prod.unit_cost,
      cost_impact: wstQuantity * prod.unit_cost,
      reason: wstReason,
      reported_by: 'Kitchen Supervisor',
      date: new Date().toISOString().split('T')[0],
      notes: wstNotes,
    });

    setIsWastageModalOpen(false);
    showNotice(`Wastage record logged: ${wstQuantity} ${prod.unit} of ${prod.product_name} at ${out.name}`);
    loadAllData();
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOut = outlets.find(o => o.id === targetOutletId);
    if (!targetOut) return;

    addTenantInventoryEnhanced(business.id, {
      outlet_id: targetOut.id,
      outlet_name: targetOut.name,
      product_id: `prod_${Date.now()}`,
      product_name: newProductName,
      sku: newSku.toUpperCase(),
      category: newCategory,
      current_stock: newCurrentStock,
      min_stock: newMinStock,
      max_stock: newMaxStock,
      reorder_point: Math.round(newMinStock * 1.2),
      unit_cost: newUnitCost,
      unit: newUnit,
      supplier: newSupplier,
      lead_time_days: newLeadTime,
      daily_consumption: newDailyConsumption,
      waste_qty: 0,
      last_restocked: new Date().toISOString().split('T')[0],
      status: newCurrentStock <= newMinStock * 0.5 ? 'CRITICAL' :
              newCurrentStock <= newMinStock ? 'LOW STOCK' :
              newCurrentStock >= newMaxStock ? 'OVERSTOCK' : 'HEALTHY',
    });

    setIsAddModalOpen(false);
    showNotice(`Added SKU ${newProductName} to ${targetOut.name}!`);
    loadAllData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-950 border border-emerald-500 text-emerald-100 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="ml-2 text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300 shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Inventory Intelligence & Control Tower
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                  Milestone 2 Real-World
                </span>
              </h1>
              <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">
                End-to-end traceable stock lifecycle, predictive risk scoring (0-100), automated Buy vs Transfer optimizer, and executive control tower for <span className="text-indigo-200 font-bold">{business.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="border-slate-600 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold gap-2 text-xs h-10 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-300" /> Add SKU
          </Button>

          <Button
            onClick={() => setIsCreatePOModalOpen(true)}
            variant="outline"
            className="border-indigo-500/40 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 font-semibold gap-2 text-xs h-10 rounded-xl shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-indigo-300" /> New PO
          </Button>

          <Button
            onClick={() => setIsTransferModalOpen(true)}
            variant="outline"
            className="border-cyan-500/40 bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-200 font-semibold gap-2 text-xs h-10 rounded-xl shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-cyan-300" /> Transfer
          </Button>

          <Button
            onClick={() => setIsWastageModalOpen(true)}
            variant="outline"
            className="border-rose-500/40 bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 font-semibold gap-2 text-xs h-10 rounded-xl shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-300" /> Log Waste
          </Button>

          <Button
            onClick={handleRunInventoryAgent}
            disabled={isAgentRunning}
            className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white gap-2 text-xs font-bold h-10 px-4 rounded-xl shadow-lg shadow-indigo-600/30"
          >
            <Bot className={cn("w-4 h-4", isAgentRunning && "animate-spin")} />
            {isAgentRunning ? 'Scanning Network...' : 'Run Inventory Agent'}
          </Button>
        </div>
      </div>

      {/* Autonomous Agent Thinking Bar (Live Progress) */}
      {isAgentRunning && (
        <div className="bg-slate-900 border border-indigo-500/50 p-4 rounded-xl shadow-xl animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Phase {agentPhase}/5: Autonomous Inventory Agent Reasoning
              </span>
            </div>
            <span className="text-xs text-slate-300 font-medium">Live multi-agent ledger correlation</span>
          </div>
          <p className="text-sm text-white font-medium pl-6">{agentThinkingStep}</p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${(agentPhase / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Top 5 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>Network Valuation</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(kpis.totalInventoryValue)}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1">
              <span>Across {kpis.totalProducts} active SKUs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>Critical Stockouts</span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {kpis.criticalCount + kpis.outOfStockCount} <span className="text-xs font-semibold text-slate-300">SKUs</span>
            </div>
            <div className="text-xs text-rose-300 font-medium mt-1">
              {kpis.lowStockCount} additional in Low Stock warning
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>Open Purchase Orders</span>
              <ShoppingCart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {kpis.openPOCount} <span className="text-xs font-semibold text-slate-300">POs ({formatCurrency(kpis.openPOValue)})</span>
            </div>
            <div className="text-xs text-blue-300 font-medium mt-1">
              {controlTower.incomingDeliveriesToday} scheduled delivery today
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>Transfers & Rebalances</span>
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300">
              {controlTower.transferOpportunitiesCount} <span className="text-xs font-semibold text-slate-300">Opportunities</span>
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              {kpis.pendingTransfersCount} active transfer in-transit
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>Monthly Spoilage Loss</span>
              <Trash2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {formatCurrency(wastageSummary.totalCostImpact)}
            </div>
            <div className="text-xs text-amber-300 font-medium mt-1">
              {wastageSummary.wastagePercentage}% wastage drag rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-300/80 overflow-x-auto pb-3 scrollbar-none">
        {[
          { id: 'control_tower', label: 'Control Tower', icon: ShieldAlert, count: controlTower.actionQueue.length },
          { id: 'stock', label: 'Live Stock & Ledger', icon: Boxes, count: inventory.length },
          { id: 'decisions', label: 'Smart Decision Center', icon: Zap, count: smartRecs.length },
          { id: 'orders', label: 'POs & Goods Receiving', icon: ShoppingCart, count: purchaseOrders.length },
          { id: 'transfers', label: 'Inter-Outlet Transfers', icon: ArrowLeftRight, count: transfers.length },
          { id: 'reconciliation', label: 'Stock Reconciliation', icon: ClipboardCheck, count: stockCounts.length },
          { id: 'wastage', label: 'Wastage Analytics', icon: Trash2, count: wastageRecords.length },
          { id: 'forecast', label: 'Demand Forecasting', icon: TrendingUp },
          { id: 'insights', label: 'AI Insights & Audit', icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm",
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500" 
                  : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold border",
                  isActive ? "bg-white/25 text-white border-white/40" : "bg-slate-100 text-slate-700 border-slate-300"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE CONTROL TOWER */}
      {/* ========================================================================= */}
      {activeTab === 'control_tower' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prioritized Action Queue */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-600" />
                    Autonomous Action Queue (Priority Ranked)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Calculated by AI Agent cross-referencing sales velocity, supplier lead times, buffer gaps, and cross-branch excess.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 font-mono font-bold shadow-sm">
                  {controlTower.actionQueue.length} Active Directives
                </span>
              </div>

              {controlTower.actionQueue.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700/80 p-8 text-center shadow-md">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">All Operational Pipelines Healthy</h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">No critical stockouts, overdue POs, or urgent transfer requirements detected.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {controlTower.actionQueue.map((action, idx) => (
                    <div 
                      key={action.id || idx}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm",
                        action.priority === 'Critical' ? "bg-rose-950/40 border-rose-600/60 hover:border-rose-500" :
                        action.priority === 'High' ? "bg-amber-950/40 border-amber-600/60 hover:border-amber-500" :
                        "bg-slate-900 border-slate-700/80 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0 mt-0.5",
                          action.priority === 'Critical' ? "bg-rose-500/20 text-rose-400" :
                          action.priority === 'High' ? "bg-amber-500/20 text-amber-400" :
                          "bg-indigo-500/20 text-indigo-400"
                        )}>
                          {action.type === 'STOCKOUT' ? <AlertOctagon className="w-4 h-4" /> :
                           action.type === 'TRANSFER' ? <ArrowLeftRight className="w-4 h-4" /> :
                           action.type === 'RECEIPT' ? <Truck className="w-4 h-4" /> :
                           action.type === 'WASTAGE' ? <Trash2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                              action.priority === 'Critical' ? "bg-rose-900/60 text-rose-200 border-rose-500/50" :
                              action.priority === 'High' ? "bg-amber-900/60 text-amber-200 border-amber-500/50" :
                              "bg-slate-800 text-slate-200 border-slate-700"
                            )}>
                              {action.priority} Priority
                            </span>
                            <span className="text-xs font-bold text-white">{action.title}</span>
                            <span className="text-xs text-slate-300 font-medium">• {action.outlet}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-normal mt-1 leading-relaxed">{action.details}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {action.type === 'TRANSFER' ? (
                          <Button
                            size="sm"
                            onClick={() => handleTabChange('transfers')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm"
                          >
                            {action.actionLabel}
                          </Button>
                        ) : action.type === 'RECEIPT' ? (
                          <Button
                            size="sm"
                            onClick={() => handleTabChange('orders')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm"
                          >
                            {action.actionLabel}
                          </Button>
                        ) : action.type === 'WASTAGE' ? (
                          <Button
                            size="sm"
                            onClick={() => handleTabChange('wastage')}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm"
                          >
                            {action.actionLabel}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleTabChange('decisions')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm"
                          >
                            {action.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Network Outlets Risk Balance Panel */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Outlet Health & Stock Imbalance
              </h2>

              <div className="space-y-3">
                {outletComps.map(outlet => (
                  <Card key={outlet.outlet_id} className="bg-slate-900 border-slate-700/80 shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        {outlet.outlet_name}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{outlet.city}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/50 text-emerald-200">
                        <div className="font-bold text-sm text-emerald-300">{outlet.healthy_count}</div>
                        <div className="font-semibold text-[10px]">Healthy</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-200">
                        <div className="font-bold text-sm text-amber-300">{outlet.low_stock_count}</div>
                        <div className="font-semibold text-[10px]">Low Stock</div>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-600/50 text-rose-200">
                        <div className="font-bold text-sm text-rose-300">{outlet.critical_count + outlet.out_of_stock_count}</div>
                        <div className="font-semibold text-[10px]">Critical</div>
                      </div>
                    </div>

                    {outlet.critical_shortages.length > 0 && (
                      <div className="text-xs text-rose-200 font-medium bg-rose-950/50 p-2 rounded-lg border border-rose-800/50 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Shortage: <strong className="text-white font-bold">{outlet.critical_shortages.map(s => s.product_name).join(', ')}</strong></span>
                      </div>
                    )}

                    {outlet.excess_items.length > 0 && (
                      <div className="text-xs text-cyan-200 font-medium bg-cyan-950/50 p-2 rounded-lg border border-cyan-800/50 flex items-center gap-1.5">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Excess buffer available: <strong className="text-white font-bold">{outlet.excess_items.map(e => e.product_name).join(', ')}</strong></span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE STOCK & LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-700/80 shadow-md">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU, product, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-400"
                />
              </div>

              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-xs text-white font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Outlets ({outlets.length})</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-xs text-white font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-300 font-medium">
              Showing <span className="text-white font-bold">{filteredInventory.length}</span> of {inventory.length} SKUs
            </div>
          </div>

          {/* Stock Table */}
          <Card className="bg-slate-900 border-slate-700/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="p-3.5 text-slate-200 font-bold">Product & SKU</th>
                    <th className="p-3.5 text-slate-200 font-bold">Outlet Location</th>
                    <th className="p-3.5 text-slate-200 font-bold">Category</th>
                    <th className="p-3.5 text-right text-slate-200 font-bold">Current Stock</th>
                    <th className="p-3.5 text-right text-slate-200 font-bold">Min / Max Buffer</th>
                    <th className="p-3.5 text-right text-slate-200 font-bold">Daily Velocity</th>
                    <th className="p-3.5 text-right text-slate-200 font-bold">Days Cover</th>
                    <th className="p-3.5 text-center text-slate-200 font-bold">Status</th>
                    <th className="p-3.5 text-center text-slate-200 font-bold">Ledger & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80 font-medium">
                  {filteredInventory.map(item => {
                    const daysRemaining = item.daily_consumption > 0 
                      ? Math.round((item.current_stock / item.daily_consumption) * 10) / 10 
                      : 99;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{item.product_name}</div>
                          <div className="text-xs text-slate-300 font-mono font-medium">{item.sku} • {item.supplier}</div>
                        </td>
                        <td className="p-3.5 text-slate-200 font-semibold">
                          {item.outlet_name}
                        </td>
                        <td className="p-3.5 text-slate-300 font-medium">
                          {item.category}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={cn(
                            "font-bold text-sm",
                            item.current_stock <= item.min_stock * 0.5 ? "text-rose-400" :
                            item.current_stock <= item.min_stock ? "text-amber-400" : "text-white"
                          )}>
                            {formatNumber(item.current_stock)} {item.unit}
                          </span>
                          <div className="text-xs text-slate-300 font-mono font-semibold">₹{(item.current_stock * item.unit_cost).toLocaleString()}</div>
                        </td>
                        <td className="p-3.5 text-right text-slate-300 font-medium">
                          {item.min_stock} / {item.max_stock} {item.unit}
                        </td>
                        <td className="p-3.5 text-right text-slate-200 font-semibold">
                          {item.daily_consumption} {item.unit}/d
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-xs font-bold border",
                            daysRemaining <= 2 ? "bg-rose-950/70 text-rose-300 border-rose-500/50" :
                            daysRemaining <= 5 ? "bg-amber-950/70 text-amber-300 border-amber-500/50" :
                            "bg-slate-800 text-slate-200 border-slate-600"
                          )}>
                            ~{daysRemaining} days
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border",
                            item.status === 'HEALTHY' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                            item.status === 'LOW STOCK' ? "bg-amber-950/80 text-amber-300 border-amber-500/50" :
                            item.status === 'CRITICAL' || item.status === 'OUT OF STOCK' ? "bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse" :
                            "bg-blue-950/80 text-blue-300 border-blue-500/50"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setLedgerItem(item)}
                            className="text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-semibold h-8 px-3 rounded-lg gap-1.5"
                          >
                            <History className="w-3.5 h-3.5" /> Stock Ledger
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

      {/* ========================================================================= */}
      {/* TAB 3: SMART DECISION CENTER & REPLENISHMENT */}
      {/* ========================================================================= */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-xl border border-indigo-500/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Intelligent Replenishment Decisions (Buy vs Transfer Optimizer)
              </h2>
              <p className="text-xs text-slate-200 font-medium mt-1 leading-relaxed">
                The AI engine evaluates network-wide imbalances. If sibling outlets have surplus buffer (&gt;35 days cover), it triggers an inter-outlet transfer before issuing external supplier POs.
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/50 shrink-0">
              {smartRecs.length} Actionable Requisitions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smartRecs.map(rec => (
              <Card key={rec.id} className={cn(
                "border shadow-md transition-all",
                rec.priority === 'Critical' ? "bg-rose-950/30 border-rose-600/50" :
                rec.action_type === 'TRANSFER_FROM_OUTLET' ? "bg-cyan-950/30 border-cyan-600/50" :
                "bg-slate-900 border-slate-700/80"
              )}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                          rec.priority === 'Critical' ? "bg-rose-900/60 text-rose-200 border-rose-500/50" :
                          rec.priority === 'High' ? "bg-amber-900/60 text-amber-200 border-amber-500/50" :
                          "bg-blue-900/60 text-blue-200 border-blue-500/50"
                        )}>
                          {rec.priority}
                        </span>
                        <span className="text-sm font-bold text-white">{rec.product_name}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono font-medium mt-0.5">{rec.sku} • {rec.outlet_name}</div>
                    </div>

                    <span className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold uppercase border shrink-0",
                      rec.action_type === 'TRANSFER_FROM_OUTLET' ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/50" :
                      rec.action_type === 'URGENT_REORDER' ? "bg-rose-500/20 text-rose-200 border-rose-500/50" :
                      "bg-indigo-500/20 text-indigo-200 border-indigo-500/50"
                    )}>
                      {rec.action_type === 'TRANSFER_FROM_OUTLET' ? 'Transfer Rebalance' : 'Supplier Reorder'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1.5">
                    <p className="font-bold text-white">{rec.reason}</p>
                    {rec.action_type === 'TRANSFER_FROM_OUTLET' ? (
                      <p className="text-cyan-200 text-xs font-semibold">
                        <strong>Optimal Source:</strong> {rec.source_outlet_name} maintains excess stock. Transferring saves external procurement cost!
                      </p>
                    ) : (
                      <p className="text-indigo-200 text-xs font-semibold">
                        <strong>Vendor:</strong> {rec.supplier} (Lead Time: {rec.supplier_lead_time} days)
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="text-slate-300 font-medium">Current Stock</div>
                      <div className="font-bold text-white text-sm mt-0.5">{rec.current_stock} {rec.unit}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50">
                      <div className="text-indigo-200 font-medium">Recommended</div>
                      <div className="font-bold text-indigo-200 text-sm mt-0.5">+{rec.recommended_quantity} {rec.unit}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="text-slate-300 font-medium">Est. Value</div>
                      <div className="font-bold text-emerald-300 text-sm mt-0.5">{formatCurrency(rec.estimated_cost)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismissRec(rec.id)}
                      className="text-slate-300 hover:text-white text-xs font-semibold h-8"
                    >
                      Dismiss
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApproveRec(rec.id)}
                      className={cn(
                        "text-white text-xs font-bold h-8 px-4 rounded-lg shadow-sm",
                        rec.action_type === 'TRANSFER_FROM_OUTLET' 
                          ? "bg-cyan-600 hover:bg-cyan-500" 
                          : "bg-indigo-600 hover:bg-indigo-500"
                      )}
                    >
                      {rec.action_type === 'TRANSFER_FROM_OUTLET' ? 'Approve Transfer Dispatch' : 'Approve & Dispatch PO'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PURCHASE ORDERS & GOODS RECEIVING */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                Purchase Orders & Goods Inward Flow
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Manage supplier procurement POs, approve draft orders, and record goods receiving at docks with damaged goods tracking.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreatePOModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Purchase Order
            </Button>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map(po => (
              <Card key={po.id} className="bg-slate-900 border-slate-700/80 shadow-md p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-300">{po.po_number}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        po.status === 'RECEIVED' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                        po.status === 'PARTIALLY_RECEIVED' ? "bg-amber-950/80 text-amber-300 border-amber-500/50" :
                        po.status === 'ORDERED' ? "bg-blue-950/80 text-blue-300 border-blue-500/50" :
                        "bg-slate-800 text-slate-200 border-slate-700"
                      )}>
                        {po.status}
                      </span>
                      <span className="text-xs text-white font-bold">• {po.supplier_name}</span>
                      <span className="text-xs text-slate-300 font-medium">➔ {po.outlet_name}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mt-1">
                      Items: {po.items.map(it => `${it.product_name} (${it.quantity_ordered} ${it.unit})`).join(', ')} • Total: <strong className="text-emerald-300 font-bold">{formatCurrency(po.total_amount)}</strong> • Delivery by: <span className="text-slate-200 font-semibold">{po.expected_delivery}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {po.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprovePO(po.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm"
                      >
                        Approve & Order
                      </Button>
                    )}

                    {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenReceiveModal(po)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8 px-3 gap-1.5 rounded-lg shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" /> Receive Goods
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTER-OUTLET TRANSFERS */}
      {/* ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-cyan-600" />
                Inter-Outlet Stock Transfers & Logistics
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Rebalance stock across outlets to eliminate shortages while minimizing capital expenditure on new supplier POs.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-9 gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Request Stock Transfer
            </Button>
          </div>

          <div className="space-y-3">
            {transfers.map(tr => (
              <Card key={tr.id} className="bg-slate-900 border-slate-700/80 shadow-md p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-300">{tr.transfer_number}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        tr.status === 'TRANSFER_RECEIPT' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                        tr.status === 'TRANSFER_DISPATCH' ? "bg-blue-950/80 text-blue-300 border-blue-500/50" :
                        "bg-amber-950/80 text-amber-300 border-amber-500/50"
                      )}>
                        {tr.status}
                      </span>
                      <span className="text-xs font-bold text-white">{tr.quantity} {tr.unit} of {tr.product_name}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2">
                      <span>Source: <strong className="text-white font-semibold">{tr.source_outlet_name}</strong></span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Dest: <strong className="text-white font-semibold">{tr.destination_outlet_name}</strong></span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      <em>Reason:</em> {tr.reason}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tr.status === 'TRANSFER_APPROVAL' && (
                      <Button
                        size="sm"
                        onClick={() => handleDispatchTransfer(tr.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm"
                      >
                        Dispatch from Warehouse
                      </Button>
                    )}

                    {tr.status === 'TRANSFER_DISPATCH' && (
                      <Button
                        size="sm"
                        onClick={() => handleReceiveTransfer(tr.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm"
                      >
                        Confirm Receipt at Destination
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STOCK COUNT RECONCILIATION */}
      {/* ========================================================================= */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                Physical Stock Count & Variance Reconciliation
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Perform physical inventory audits, record discrepancies with root cause reasons, and synchronize actual stock into the traceable ledger.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleStartStockCount(outlets[0]?.id || 'out_1')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Start Physical Count Session
            </Button>
          </div>

          <div className="space-y-3">
            {stockCounts.map(sc => (
              <Card key={sc.id} className="bg-slate-900 border-slate-700/80 shadow-md p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{sc.session_name}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        sc.status === 'COMPLETED' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                        sc.status === 'PENDING_APPROVAL' ? "bg-amber-950/80 text-amber-300 border-amber-500/50" :
                        "bg-blue-950/80 text-blue-300 border-blue-500/50"
                      )}>
                        {sc.status}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">• {sc.outlet_name}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mt-1">
                      Audited by: {sc.conducted_by} • SKUs Counted: {sc.items.length} • Net Variance Cost: <strong className={cn(sc.total_variance_cost < 0 ? "text-rose-400" : "text-emerald-400")}>₹{sc.total_variance_cost.toLocaleString()}</strong>
                    </div>

                    {sc.items.some(i => i.variance_quantity !== 0) && (
                      <div className="mt-2 text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        {sc.items.filter(i => i.variance_quantity !== 0).map(i => (
                          <div key={i.id} className="flex items-center gap-2">
                            <span className="font-bold text-white">{i.product_name}:</span>
                            <span className="text-slate-300">System ({i.system_stock}) vs Physical ({i.physical_count}) = </span>
                            <span className={cn("font-bold", i.variance_quantity < 0 ? "text-rose-400" : "text-emerald-400")}>
                              {i.variance_quantity > 0 ? `+${i.variance_quantity}` : i.variance_quantity} {i.unit}
                            </span>
                            <span className="text-slate-400 font-mono">[{i.variance_reason}]</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {sc.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveStockCount(sc.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm"
                      >
                        Approve & Sync Ledger
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: WASTAGE & LOSS ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'wastage' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Wastage, Spoilage & Shrinkage Analytics
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Track root-cause losses across prep error, cold chain breakdown, handling damage, and portioning.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsWastageModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Log Wastage Event
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-700/80 shadow-md p-5 lg:col-span-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Wastage Breakdown by Root Cause</h3>
              <div className="space-y-3">
                {wastageSummary.byReasonBreakdown.map(r => (
                  <div key={r.reason} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{r.reason}</span>
                      <span className="font-bold text-white">₹{r.cost.toLocaleString()} ({r.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 border border-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, r.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-700/80 shadow-md p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top Loss SKUs</h3>
              <div className="space-y-3">
                {wastageSummary.topLossProducts.map(p => (
                  <div key={p.product_name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{p.product_name}</div>
                      <div className="text-xs text-slate-300 font-medium">{p.quantity} {p.unit} wasted</div>
                    </div>
                    <div className="font-bold text-sm text-rose-400">₹{p.cost_impact.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Historical Logs */}
          <Card className="bg-slate-900 border-slate-700/80 shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-950 font-bold text-xs text-white uppercase tracking-wider">Historical Loss Logs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Outlet</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Cost Impact</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Reported By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {wastageRecords.map(w => (
                    <tr key={w.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-3 font-mono text-slate-300 font-medium">{w.date}</td>
                      <td className="p-3 text-white font-semibold">{w.outlet_name}</td>
                      <td className="p-3 font-bold text-white">{w.product_name}</td>
                      <td className="p-3 text-right text-rose-300 font-bold">{w.quantity} {w.unit}</td>
                      <td className="p-3 text-right font-bold text-rose-400">₹{w.cost_impact.toLocaleString()}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs font-semibold">{w.reason}</span></td>
                      <td className="p-3 text-slate-300 font-medium">{w.reported_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: DEMAND FORECASTING */}
      {/* ========================================================================= */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Multi-Horizon Demand Projections & Consumption Velocity
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                7-day, 14-day, and 30-day forward forecasts calculated via historical daily sales velocity with statistical trend smoothing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecasts.map(f => (
              <Card key={f.product_id} className="bg-slate-900 border-slate-700/80 shadow-md p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{f.product_name}</div>
                    <div className="text-xs text-slate-300 font-mono font-medium">{f.sku} • {f.outlet_name}</div>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-xs font-bold border",
                    f.demand_trend === 'Increasing' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                    f.demand_trend === 'Decreasing' ? "bg-rose-950/80 text-rose-300 border-rose-500/50" :
                    "bg-slate-800 text-slate-200 border-slate-700"
                  )}>
                    {f.demand_trend} Trend
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="text-slate-300 font-medium">7-Day Demand</div>
                    <div className="font-bold text-white text-sm mt-0.5">{f.demand_7d} {f.unit}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="text-slate-300 font-medium">14-Day Demand</div>
                    <div className="font-bold text-white text-sm mt-0.5">{f.demand_14d} {f.unit}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="text-slate-300 font-medium">30-Day Demand</div>
                    <div className="font-bold text-white text-sm mt-0.5">{f.demand_30d} {f.unit}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>Current On-Hand: <strong className="text-white font-bold">{f.current_stock} {f.unit}</strong></span>
                  <span className={cn("font-bold text-xs", f.days_remaining <= 3 ? "text-rose-400" : "text-emerald-400")}>
                    ~{f.days_remaining}d Cover
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: AI INSIGHTS & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Autonomous Inventory Insights & Traceable Audit Trail
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Synthesized by the Autonomous Inventory Agent during scheduled scans.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {agentScanResult?.insights ? agentScanResult.insights.map(ins => (
              <Card key={ins.id} className="bg-slate-900 border-slate-700/80 shadow-md p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                    ins.severity === 'Critical' ? "bg-rose-900/60 text-rose-200 border-rose-500/50" :
                    ins.severity === 'Warning' ? "bg-amber-900/60 text-amber-200 border-amber-500/50" :
                    ins.severity === 'Positive' ? "bg-emerald-900/60 text-emerald-200 border-emerald-500/50" :
                    "bg-blue-900/60 text-blue-200 border-blue-500/50"
                  )}>
                    {ins.severity} • {ins.category}
                  </span>
                  <span className="text-xs text-slate-300 font-mono font-medium">{new Date(ins.timestamp).toLocaleTimeString()}</span>
                </div>
                <h3 className="font-bold text-sm text-white">{ins.title}</h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">{ins.summary}</p>
                <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-xs text-indigo-200 mt-2 font-medium">
                  <strong className="text-white font-bold">Action Directive:</strong> {ins.actionable_step}
                </div>
              </Card>
            )) : (
              <Card className="bg-slate-900 border-slate-700/80 shadow-md p-8 text-center">
                <Bot className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Click "Run Inventory Agent" to Generate Insights</h3>
                <p className="text-xs text-slate-300 font-medium mt-1">Agent evaluates lead times, consumption velocity, and inter-branch balance.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STOCK LEDGER DRAWER */}
      {/* ========================================================================= */}
      {ledgerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-950">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Traceable Stock Ledger: {ledgerItem.product_name}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {ledgerItem.sku} • {ledgerItem.outlet_name} • Unit Cost: ₹{ledgerItem.unit_cost}/{ledgerItem.unit}
                </p>
              </div>
              <button onClick={() => setLedgerItem(null)} className="text-slate-300 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ledger Math Breakdown */}
            {(() => {
              const ledger = calculateProductStockLedger(ledgerItem, movements);
              return (
                <div className="p-5 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                      <div className="text-slate-300 text-[10px] font-semibold uppercase">Opening Stock</div>
                      <div className="text-sm font-bold text-white mt-0.5">{ledger.opening_stock} {ledgerItem.unit}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
                      <div className="text-emerald-300 text-[10px] font-semibold uppercase">+ Purchases / Inflows</div>
                      <div className="text-sm font-bold text-emerald-200 mt-0.5">+{ledger.total_purchases + ledger.total_transfers_in} {ledgerItem.unit}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60">
                      <div className="text-rose-300 text-[10px] font-semibold uppercase">- Sales / Outflows / Waste</div>
                      <div className="text-sm font-bold text-rose-200 mt-0.5">-{ledger.total_sales + ledger.total_transfers_out + ledger.total_wastage} {ledgerItem.unit}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/60">
                      <div className="text-indigo-200 text-[10px] font-semibold uppercase">= Closing Balance</div>
                      <div className="text-sm font-bold text-white mt-0.5">{ledger.closing_stock} {ledgerItem.unit}</div>
                    </div>
                  </div>

                  <div className="border border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-3 bg-slate-950 font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                      <span>Movement History & Chronological Audit Entries</span>
                      <span className="text-[11px] font-mono text-slate-300">Total Entries: {ledger.entries.length}</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-xs text-slate-200">
                        <thead className="bg-slate-900 text-slate-200 font-bold text-[10px] uppercase border-b border-slate-700">
                          <tr>
                            <th className="p-3 text-slate-200 font-bold">Date</th>
                            <th className="p-3 text-slate-200 font-bold">Type</th>
                            <th className="p-3 text-slate-200 font-bold">Reference / Notes</th>
                            <th className="p-3 text-right text-slate-200 font-bold">Inflow</th>
                            <th className="p-3 text-right text-slate-200 font-bold">Outflow</th>
                            <th className="p-3 text-right text-slate-200 font-bold">Running Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/80 font-mono text-[11px]">
                          {ledger.entries.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-300 font-sans font-medium">No individual movement logs recorded yet for this SKU.</td>
                            </tr>
                          ) : (
                            ledger.entries.map(entry => (
                              <tr key={entry.id} className="hover:bg-slate-800/60 transition-colors">
                                <td className="p-3 text-slate-300 font-medium">{entry.date}</td>
                                <td className="p-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold border",
                                    entry.movement_type === 'PURCHASE_RECEIPT' || entry.movement_type === 'TRANSFER_IN' ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" :
                                    entry.movement_type === 'SALE' || entry.movement_type === 'TRANSFER_OUT' ? "bg-blue-950/80 text-blue-300 border-blue-500/50" :
                                    "bg-rose-950/80 text-rose-300 border-rose-500/50"
                                  )}>
                                    {entry.movement_type}
                                  </span>
                                </td>
                                <td className="p-3 font-sans text-slate-200 font-medium">
                                  {entry.notes || entry.reference_id || 'System movement'}
                                </td>
                                <td className="p-3 text-right text-emerald-300 font-bold">
                                  {entry.in_quantity > 0 ? `+${entry.in_quantity}` : '-'}
                                </td>
                                <td className="p-3 text-right text-rose-300 font-bold">
                                  {entry.out_quantity > 0 ? `-${entry.out_quantity}` : '-'}
                                </td>
                                <td className="p-3 text-right font-bold text-white">
                                  {entry.balance_stock} {ledgerItem.unit}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECEIVE GOODS */}
      {/* ========================================================================= */}
      {receivingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 bg-slate-950 -mx-6 -mt-6 p-6 rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  Record Goods Inward: {receivingPO.po_number}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">Supplier: {receivingPO.supplier_name} • Outlet: {receivingPO.outlet_name}</p>
              </div>
              <button onClick={() => setReceivingPO(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {receivingPO.items.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{item.product_name}</div>
                      <div className="text-xs text-slate-300 font-medium">Ordered: {item.quantity_ordered} {item.unit}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">₹{item.unit_cost}/{item.unit}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-200 font-semibold mb-1 block uppercase">Received Qty (Good)</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity_ordered}
                        value={receiptReceivedQty[item.product_id] || 0}
                        onChange={(e) => setReceiptReceivedQty({ ...receiptReceivedQty, [item.product_id]: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-rose-300 font-semibold mb-1 block uppercase">Damaged in Transit</label>
                      <input
                        type="number"
                        min="0"
                        value={receiptDamagedQty[item.product_id] || 0}
                        onChange={(e) => setReceiptDamagedQty({ ...receiptDamagedQty, [item.product_id]: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-rose-300 font-medium focus:border-rose-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setReceivingPO(null)} className="text-slate-300 hover:text-white text-xs font-semibold">
                Cancel
              </Button>
              <Button onClick={handleSubmitGoodsReceipt} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 shadow-sm">
                Confirm Inward & Update Ledger
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE PURCHASE ORDER */}
      {/* ========================================================================= */}
      {isCreatePOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 bg-slate-950 -mx-6 -mt-6 p-6 rounded-t-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                Issue New Purchase Order
              </h2>
              <button onClick={() => setIsCreatePOModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3">
              <div>
                <label className="text-xs text-slate-200 font-semibold mb-1 block">Supplier</label>
                <select
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                >
                  <option value="Telangana Agri Supply Hub">Telangana Agri Supply Hub (Rice & Staples)</option>
                  <option value="Deccan Spice Exporters">Deccan Spice Exporters (Spices & Flavors)</option>
                  <option value="Hyderabad Halal Meat Consortium">Hyderabad Halal Meat Consortium (Mutton & Cuts)</option>
                  <option value="Nandini Dairy Logistics">Nandini Dairy Logistics (Ghee & Dairy)</option>
                  <option value="Mumbai Fresh Halal Farms">Mumbai Fresh Halal Farms (Chicken & Poultry)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Destination Outlet</label>
                  <select
                    value={poOutlet}
                    onChange={(e) => setPoOutlet(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Product SKU</label>
                  <select
                    value={poProduct}
                    onChange={(e) => {
                      setPoProduct(e.target.value);
                      const p = inventory.find(i => i.product_id === e.target.value || i.id === e.target.value);
                      if (p) setPoUnitCost(p.unit_cost);
                    }}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.product_id}>{i.product_name} ({i.sku})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={poUnitCost}
                    onChange={(e) => setPoUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={poExpectedDays}
                    onChange={(e) => setPoExpectedDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-800 flex items-center justify-between">
                <span className="font-semibold">Total PO Value:</span>
                <strong className="text-emerald-300 font-bold text-sm">₹{(poQuantity * poUnitCost).toLocaleString()}</strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsCreatePOModalOpen(false)} className="text-slate-300 hover:text-white text-xs font-semibold">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 shadow-sm">
                  Create & Dispatch PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUEST STOCK TRANSFER */}
      {/* ========================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 bg-slate-950 -mx-6 -mt-6 p-6 rounded-t-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                Inter-Outlet Stock Transfer Request
              </h2>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Source Outlet (Excess Stock)</label>
                  <select
                    value={trSourceOutlet}
                    onChange={(e) => setTrSourceOutlet(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-cyan-400"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Destination Outlet (Shortage)</label>
                  <select
                    value={trDestOutlet}
                    onChange={(e) => setTrDestOutlet(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-cyan-400"
                  >
                    {outlets.filter(o => o.id !== trSourceOutlet).map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Product</label>
                  <select
                    value={trProduct}
                    onChange={(e) => setTrProduct(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-cyan-400"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.product_id}>{i.product_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Transfer Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={trQuantity}
                    onChange={(e) => setTrQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-200 font-semibold mb-1 block">Reason / Logistics Note</label>
                <input
                  type="text"
                  value={trReason}
                  onChange={(e) => setTrReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsTransferModalOpen(false)} className="text-slate-300 hover:text-white text-xs font-semibold">
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 shadow-sm">
                  Dispatch Transfer Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG WASTAGE EVENT */}
      {/* ========================================================================= */}
      {isWastageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 bg-slate-950 -mx-6 -mt-6 p-6 rounded-t-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Record Spoilage / Wastage Event
              </h2>
              <button onClick={() => setIsWastageModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordWastage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Outlet</label>
                  <select
                    value={wstOutlet}
                    onChange={(e) => setWstOutlet(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-rose-400"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Product</label>
                  <select
                    value={wstProduct}
                    onChange={(e) => setWstProduct(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-rose-400"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.product_id}>{i.product_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Wasted Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={wstQuantity}
                    onChange={(e) => setWstQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Root Cause Reason</label>
                  <select
                    value={wstReason}
                    onChange={(e) => setWstReason(e.target.value as WastageReason)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-rose-400"
                  >
                    <option value="Kitchen Spoilage">Kitchen Spoilage</option>
                    <option value="Preparation Error">Preparation Error</option>
                    <option value="Expired Batch">Expired Batch</option>
                    <option value="Cold Chain Failure">Cold Chain Failure</option>
                    <option value="Handling Damage">Handling Damage</option>
                    <option value="Over-portioning">Over-portioning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-200 font-semibold mb-1 block">Incident Details / Corrective Action</label>
                <input
                  type="text"
                  placeholder="e.g., walk-in gasket leak or prep station burn"
                  value={wstNotes}
                  onChange={(e) => setWstNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder:text-slate-400 font-medium mt-1 focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsWastageModalOpen(false)} className="text-slate-300 hover:text-white text-xs font-semibold">
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 shadow-sm">
                  Log Wastage & Deduct Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW SKU */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 bg-slate-950 -mx-6 -mt-6 p-6 rounded-t-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add New Inventory SKU
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSku} className="space-y-3">
              <div>
                <label className="text-xs text-slate-200 font-semibold mb-1 block">Target Outlet</label>
                <select
                  value={targetOutletId}
                  onChange={(e) => setTargetOutletId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                >
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kashmiri Saffron"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder:text-slate-400 font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPICE-SAF-09"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder:text-slate-400 font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  >
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Spices & Flavors">Spices & Flavors</option>
                    <option value="Poultry & Meat">Poultry & Meat</option>
                    <option value="Dairy & Produce">Dairy & Produce</option>
                    <option value="Packaging & Disposables">Packaging & Disposables</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Initial Stock</label>
                  <input
                    type="number"
                    value={newCurrentStock}
                    onChange={(e) => setNewCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Min Safety Buffer</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Max Stock</label>
                  <input
                    type="number"
                    value={newMaxStock}
                    onChange={(e) => setNewMaxStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Daily Velocity</label>
                  <input
                    type="number"
                    value={newDailyConsumption}
                    onChange={(e) => setNewDailyConsumption(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-200 font-semibold mb-1 block">Lead Time (d)</label>
                  <input
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white font-medium mt-1 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-200 font-semibold mb-1 block">Supplier Name</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder:text-slate-400 font-medium mt-1 focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white text-xs font-semibold">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 shadow-sm">
                  Add SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
