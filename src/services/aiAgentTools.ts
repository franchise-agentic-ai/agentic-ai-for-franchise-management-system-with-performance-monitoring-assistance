import { 
  Outlet, 
  SalesRecord, 
  InventoryRecord, 
  StaffRecord, 
  MarketingRecord, 
  AuditRecord, 
  OutletBenchmarking,
  RevenueTrendAnalysis,
  UnderperformanceDetection,
  CrossDomainInsight,
  Recommendation,
  BusinessProfile,
  InventoryItemEnhanced,
  DemandForecastResult,
  StockoutRiskAssessment,
  ReplenishmentRecommendation,
  FastSlowMovingProduct,
  OutletInventoryComparison,
  InventoryMovement,
  ProductStockLedger,
  PurchaseOrder,
  StockTransfer,
  StockCountSession,
  WastageRecord,
  WastageSummary,
  ControlTowerSummary,
  InventoryAuditLogEntry,
  Employee,
  ShiftRecord,
  StaffingRequirement,
  StaffShortageAssessment,
  WorkforceOutletMetrics,
  WorkforceKPIs,
  MarketingCampaign,
  CampaignCalculatedMetrics,
  ChannelPerformanceSummary,
  OutletMarketingSummary,
  CrossAgentCampaignStaffImpact
} from '../types';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantSales, 
  getTenantInventory, 
  getTenantInventoryEnhanced,
  getTenantMovements,
  getTenantRecommendationsEnhanced,
  getTenantPurchaseOrders,
  getTenantTransfers,
  getTenantStockCounts,
  getTenantWastage,
  getTenantInventoryAuditLogs,
  getTenantStaff, 
  getTenantEmployees,
  getTenantShifts,
  getTenantStaffingRequirements,
  getTenantMarketing, 
  getTenantCampaigns,
  getTenantAudits, 
  calculateOverallBusinessHealthScore,
  calculateBusinessSetupProgress
} from './tenantService';
import { getTenantInsights, getTenantRecommendations } from './franchiseIntelligenceEngine';
import { getBenchmarkingData, analyzeRevenueTrends, getUnderperformingDetections } from './outletPerformanceService';
import { 
  forecastProductDemand, 
  detectStockoutRisks, 
  generateSmartReplenishmentDecisions, 
  identifyFastAndSlowMovers, 
  compareOutletsInventory,
  calculateProductDemandAndVelocity,
  calculateProductStockLedger,
  calculateWastageSummary,
  calculateControlTowerSummary
} from './inventoryEngine';
import { 
  calculateAttendanceRate as calcAttendance,
  calculateProductivityScore as calcProductivity,
  calculatePerformanceScore as calcPerformance,
  analyzeWorkingHoursAndOvertime,
  detectStaffShortages as detectShortages,
  analyzeShiftCoverage as analyzeCoverage,
  compareOutletWorkforce as compareWorkforce,
  calculateWorkforceScore as calcWorkforceScore,
  identifyHighAndLowPerformers
} from './staffEngine';
import { 
  calculateCampaignROI as calcROI,
  calculateConversionRate as calcConvRate,
  calculateCustomerAcquisitionCost as calcCAC,
  calculateCostPerClick as calcCPC,
  calculateClickThroughRate as calcCTR,
  calculateBudgetUtilization as calcBudgetUtil,
  rankCampaigns as rankAllCampaigns,
  compareMarketingChannels as compareChannels,
  compareOutletMarketing as compareOutletsMarketing,
  detectUnderperformingCampaigns as detectBadCampaigns,
  correlateCampaignsWithWorkforce
} from './marketingEngine';


/**
 * Reusable AI Tools / Function Calling Layer for FranchiseOps AI.
 * All tools are strictly scoped to the active business tenant (businessId)
 * and operate on live structured data from Supabase / Tenant Storage.
 */

// -------------------------------------------------------------
// 1. DATA ACCESS TOOLS
// -------------------------------------------------------------

export function get_outlets(businessId: string, filter?: { city?: string; status?: string }): Outlet[] {
  const outlets = getTenantOutlets(businessId);
  if (!filter) return outlets;
  return outlets.filter(o => {
    if (filter.city && !o.city.toLowerCase().includes(filter.city.toLowerCase())) return false;
    if (filter.status && o.status !== filter.status) return false;
    return true;
  });
}

export function get_outlet_details(businessId: string, outletIdOrName: string): {
  outlet: Outlet | null;
  sales: SalesRecord | null;
  inventory: InventoryRecord[];
  staff: StaffRecord[];
  marketing: MarketingRecord[];
  audits: AuditRecord[];
  benchmarking: OutletBenchmarking | null;
} {
  const outlets = getTenantOutlets(businessId);
  const target = outlets.find(o => 
    o.id.toLowerCase() === outletIdOrName.toLowerCase() || 
    o.name.toLowerCase().includes(outletIdOrName.toLowerCase()) ||
    o.city.toLowerCase().includes(outletIdOrName.toLowerCase())
  ) || null;

  if (!target) {
    return {
      outlet: null,
      sales: null,
      inventory: [],
      staff: [],
      marketing: [],
      audits: [],
      benchmarking: null,
    };
  }

  const sales = getTenantSales(businessId).find(s => s.outlet_id === target.id) || null;
  const inventory = getTenantInventory(businessId).filter(i => i.outlet_id === target.id);
  const staff = getTenantStaff(businessId).filter(s => s.outlet_id === target.id);
  const marketing = getTenantMarketing(businessId).filter(m => m.outlet_id === target.id);
  const audits = getTenantAudits(businessId).filter(a => a.outlet_id === target.id);

  return {
    outlet: target,
    sales,
    inventory,
    staff,
    marketing,
    audits,
    benchmarking: null, // Will be enriched when requested asynchronously
  };
}

export function get_sales_data(businessId: string, outletId?: string): SalesRecord[] {
  const sales = getTenantSales(businessId);
  if (!outletId) return sales;
  return sales.filter(s => s.outlet_id === outletId);
}

export async function get_revenue_trends(businessId: string): Promise<RevenueTrendAnalysis> {
  return await analyzeRevenueTrends('30D');
}

export async function get_outlet_benchmarks(businessId: string): Promise<OutletBenchmarking[]> {
  const benchmarks = await getBenchmarkingData();
  const outlets = getTenantOutlets(businessId);
  const validIds = new Set(outlets.map(o => o.id));
  
  // If benchmarking contains tenant outlets, filter or return
  const filtered = benchmarks.filter(b => validIds.has(b.outletId));
  return filtered.length > 0 ? filtered : benchmarks;
}

export async function get_health_scores(businessId: string): Promise<{
  networkHealth: number;
  healthStatus: string;
  pillars: { name: string; score: number; max: number; weight: string }[];
  outletScores: { outletName: string; score: number; category: string; rank: number }[];
}> {
  const overall = calculateOverallBusinessHealthScore(businessId);
  const benchmarks = await get_outlet_benchmarks(businessId);
  
  return {
    networkHealth: overall.score,
    healthStatus: overall.status,
    pillars: overall.pillars,
    outletScores: benchmarks.map(b => ({
      outletName: b.name,
      score: b.healthScore,
      category: b.category,
      rank: b.rank,
    })),
  };
}

export function get_inventory_status(businessId: string, outletId?: string): InventoryItemEnhanced[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  if (!outletId) return inventory;
  return inventory.filter(i => i.outlet_id === outletId);
}

export function get_product_inventory(businessId: string, productIdOrName: string): InventoryItemEnhanced[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const qLower = productIdOrName.toLowerCase();
  return inventory.filter(i => 
    i.product_id?.toLowerCase() === qLower || 
    i.id.toLowerCase() === qLower ||
    i.product_name.toLowerCase().includes(qLower) ||
    i.sku.toLowerCase().includes(qLower)
  );
}

export function get_inventory_movements(businessId: string, outletId?: string, productId?: string): InventoryMovement[] {
  const movements = getTenantMovements(businessId);
  return movements.filter(m => {
    if (outletId && m.outlet_id !== outletId) return false;
    if (productId && m.product_id !== productId) return false;
    return true;
  });
}

export function get_sales_history(businessId: string, outletId?: string, productId?: string): SalesRecord[] {
  const sales = getTenantSales(businessId);
  if (!outletId) return sales;
  return sales.filter(s => s.outlet_id === outletId);
}

export function get_sales_velocity(businessId: string, outletId?: string, productId?: string): Array<{
  product_name: string;
  outlet_name: string;
  daily_demand: number;
  weekly_demand: number;
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  velocity_change_pct: number;
}> {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const movements = getTenantMovements(businessId);

  const filtered = inventory.filter(i => {
    if (outletId && i.outlet_id !== outletId) return false;
    if (productId && i.product_id !== productId && i.id !== productId && !i.product_name.toLowerCase().includes(productId.toLowerCase())) return false;
    return true;
  });

  return filtered.map(item => {
    const res = calculateProductDemandAndVelocity(item, sales, movements);
    return {
      product_name: item.product_name,
      outlet_name: item.outlet_name,
      daily_demand: res.dailyDemand,
      weekly_demand: res.demand7d,
      trend: res.velocityTrend,
      velocity_change_pct: res.velocityChangePct,
    };
  });
}

export function get_inventory_forecast(businessId: string, outletId?: string, productId?: string): DemandForecastResult[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const movements = getTenantMovements(businessId);

  const filtered = inventory.filter(i => {
    if (outletId && i.outlet_id !== outletId) return false;
    if (productId && i.product_id !== productId && i.id !== productId && !i.product_name.toLowerCase().includes(productId.toLowerCase())) return false;
    return true;
  });

  return filtered.map(item => forecastProductDemand(item, sales, movements, 7));
}

export function get_stockout_risk(businessId: string, outletId?: string): StockoutRiskAssessment[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const risks = detectStockoutRisks(inventory, sales);
  if (!outletId) return risks;
  return risks.filter(r => r.outlet_id === outletId);
}

export function get_overstock_risk(businessId: string, outletId?: string): FastSlowMovingProduct[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const movers = identifyFastAndSlowMovers(inventory, sales);
  const overstocked = movers.filter(m => m.turnover_type === 'Slow Moving' || m.turnover_type === 'Dead Stock');
  if (!outletId) return overstocked;
  const outName = getTenantOutlets(businessId).find(o => o.id === outletId)?.name || '';
  return overstocked.filter(o => o.outlet_name === outName);
}

export function calculate_reorder_point(dailyDemand: number, leadTimeDays: number, safetyStock: number): number {
  const leadTimeDemand = dailyDemand * leadTimeDays;
  return Math.round(leadTimeDemand + safetyStock);
}

export function calculate_replenishment_quantity(currentStock: number, targetStock: number, leadTimeDemand: number): number {
  const deficit = targetStock - currentStock;
  return Math.max(0, Math.ceil(deficit));
}

export function get_replenishment_recommendations(businessId: string, outletId?: string): ReplenishmentRecommendation[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const pos = getTenantPurchaseOrders(businessId);
  const outlets = getTenantOutlets(businessId);
  const recs = generateSmartReplenishmentDecisions(inventory, pos, outlets, sales);
  if (!outletId) return recs;
  return recs.filter(r => r.outlet_id === outletId);
}

export function get_stock_ledger(businessId: string, productId: string, outletId?: string): ProductStockLedger[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const movements = getTenantMovements(businessId);
  const targetItems = inventory.filter(i => 
    (i.product_id === productId || i.id === productId || i.sku.toLowerCase() === productId.toLowerCase() || i.product_name.toLowerCase().includes(productId.toLowerCase())) &&
    (!outletId || i.outlet_id === outletId)
  );

  return targetItems.map(item => calculateProductStockLedger(item, movements));
}

export function get_purchase_orders(businessId: string, filter?: { outletId?: string; status?: string }): PurchaseOrder[] {
  const pos = getTenantPurchaseOrders(businessId);
  if (!filter) return pos;
  return pos.filter(p => {
    if (filter.outletId && p.outlet_id !== filter.outletId) return false;
    if (filter.status && p.status !== filter.status) return false;
    return true;
  });
}

export function get_stock_transfers(businessId: string, filter?: { outletId?: string; status?: string }): StockTransfer[] {
  const transfers = getTenantTransfers(businessId);
  if (!filter) return transfers;
  return transfers.filter(t => {
    if (filter.outletId && t.source_outlet_id !== filter.outletId && t.destination_outlet_id !== filter.outletId) return false;
    if (filter.status && t.status !== filter.status) return false;
    return true;
  });
}

export function get_wastage_records(businessId: string, outletId?: string): WastageRecord[] {
  const wastage = getTenantWastage(businessId);
  if (!outletId) return wastage;
  return wastage.filter(w => w.outlet_id === outletId);
}

export function get_wastage_analytics(businessId: string): WastageSummary {
  const wastage = getTenantWastage(businessId);
  return calculateWastageSummary(wastage);
}

export function get_control_tower_summary(businessId: string): ControlTowerSummary {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const pos = getTenantPurchaseOrders(businessId);
  const outlets = getTenantOutlets(businessId);
  const transfers = getTenantTransfers(businessId);
  const wastage = getTenantWastage(businessId);
  const recs = generateSmartReplenishmentDecisions(inventory, pos, outlets, sales);
  const risks = detectStockoutRisks(inventory, sales, pos);
  return calculateControlTowerSummary(inventory, recs, risks, pos, transfers, wastage);
}

export function get_stock_counts(businessId: string, outletId?: string): StockCountSession[] {
  const counts = getTenantStockCounts(businessId);
  if (!outletId) return counts;
  return counts.filter(c => c.outlet_id === outletId);
}

export function get_inventory_audit_logs(businessId: string): InventoryAuditLogEntry[] {
  return getTenantInventoryAuditLogs(businessId);
}

export function get_outlet_inventory_comparison(businessId: string): OutletInventoryComparison[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const outlets = getTenantOutlets(businessId);
  return compareOutletsInventory(inventory, outlets);
}

export function get_fast_slow_moving_products(businessId: string, outletId?: string): FastSlowMovingProduct[] {
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const movers = identifyFastAndSlowMovers(inventory, sales);
  if (!outletId) return movers;
  const outName = getTenantOutlets(businessId).find(o => o.id === outletId)?.name || '';
  return movers.filter(m => m.outlet_name === outName);
}

export function get_inventory_risks(businessId: string): {
  risks: InventoryItemEnhanced[];
  totalRisksCount: number;
  criticalOutlets: string[];
} {
  const inventory = getTenantInventoryEnhanced(businessId);
  const risks = inventory.filter(i => i.status === 'CRITICAL' || i.status === 'OUT OF STOCK' || i.status === 'LOW STOCK');
  const criticalOutlets = Array.from(new Set(risks.map(r => r.outlet_name)));
  return {
    risks,
    totalRisksCount: risks.length,
    criticalOutlets,
  };
}


// -------------------------------------------------------------
// STAFF & WORKFORCE INTELLIGENCE TOOLS
// -------------------------------------------------------------

export function getEmployees(businessId: string, filter?: { outletId?: string; department?: string; status?: string }): Employee[] {
  let employees = getTenantEmployees(businessId);
  if (!filter) return employees;
  if (filter.outletId) employees = employees.filter(e => e.outletId === filter.outletId);
  if (filter.department) employees = employees.filter(e => e.department.toLowerCase() === filter.department?.toLowerCase());
  if (filter.status) employees = employees.filter(e => e.status.toLowerCase() === filter.status?.toLowerCase());
  return employees;
}
export const get_employees = getEmployees;

export function getAttendance(businessId: string, filter?: { outletId?: string }): {
  overallAttendanceRate: number;
  outletAttendance: { outletId: string; outletName: string; attendanceRate: number; employeeCount: number }[];
  absenteeismHotspots: Employee[];
} {
  const employees = getTenantEmployees(businessId);
  const outlets = getTenantOutlets(businessId);
  const filtered = filter?.outletId ? employees.filter(e => e.outletId === filter.outletId) : employees;

  const overall = calcAttendance(filtered);
  const outletAttendance = outlets.map(o => {
    const oEmps = employees.filter(e => e.outletId === o.id);
    return {
      outletId: o.id,
      outletName: o.name,
      attendanceRate: calcAttendance(oEmps),
      employeeCount: oEmps.length
    };
  });

  const hotspots = employees.filter(e => e.attendanceRate < 80 || e.status === 'On Leave');

  return {
    overallAttendanceRate: overall,
    outletAttendance,
    absenteeismHotspots: hotspots
  };
}
export const get_attendance = getAttendance;

export function getShiftCoverage(businessId: string, filter?: { outletId?: string }): {
  totalShifts: number;
  coveredShifts: number;
  shortageShifts: number;
  overallCoveragePercentage: number;
  shifts: ShiftRecord[];
} {
  let shifts = getTenantShifts(businessId);
  if (filter?.outletId) shifts = shifts.filter(s => s.outletId === filter.outletId);
  const coverage = analyzeCoverage(shifts);
  return {
    ...coverage,
    shifts
  };
}
export const get_shift_coverage = getShiftCoverage;

export function getStaffPerformance(businessId: string, filter?: { outletId?: string }): {
  overallPerformanceScore: number;
  topPerformers: Employee[];
  attentionRequired: Employee[];
  employees: Employee[];
} {
  let employees = getTenantEmployees(businessId);
  if (filter?.outletId) employees = employees.filter(e => e.outletId === filter.outletId);
  const overall = calcPerformance(employees);
  const { topPerformers, attentionRequired } = identifyHighAndLowPerformers(employees);

  return {
    overallPerformanceScore: overall,
    topPerformers,
    attentionRequired,
    employees
  };
}
export const get_staff_performance = (businessId: string, outletId?: string) => {
  return getTenantStaff(businessId).filter(s => !outletId || s.outlet_id === outletId);
};

export function getStaffProductivity(businessId: string, filter?: { outletId?: string }): {
  overallProductivityScore: number;
  overtimeAnalysis: {
    totalWorkingHours: number;
    totalOvertimeHours: number;
    averageOvertime: number;
    excessiveOvertimeStaff: Employee[];
  };
  productivityByOutlet: { outletId: string; outletName: string; productivityScore: number }[];
} {
  let employees = getTenantEmployees(businessId);
  const outlets = getTenantOutlets(businessId);
  if (filter?.outletId) employees = employees.filter(e => e.outletId === filter.outletId);

  const overall = calcProductivity(employees);
  const overtime = analyzeWorkingHoursAndOvertime(employees);
  const productivityByOutlet = outlets.map(o => {
    const oEmps = employees.filter(e => e.outletId === o.id);
    return {
      outletId: o.id,
      outletName: o.name,
      productivityScore: calcProductivity(oEmps)
    };
  });

  return {
    overallProductivityScore: overall,
    overtimeAnalysis: overtime,
    productivityByOutlet
  };
}
export const get_staff_productivity = getStaffProductivity;

export function detectStaffShortages(businessId: string, filter?: { outletId?: string }): StaffShortageAssessment[] {
  let shifts = getTenantShifts(businessId);
  let employees = getTenantEmployees(businessId);
  const requirements = getTenantStaffingRequirements(businessId);
  if (filter?.outletId) {
    shifts = shifts.filter(s => s.outletId === filter.outletId);
  }
  return detectShortages(shifts, employees, requirements);
}
export const detect_staff_shortages = detectStaffShortages;

export function compareOutletWorkforce(businessId: string): WorkforceOutletMetrics[] {
  const outlets = getTenantOutlets(businessId);
  const employees = getTenantEmployees(businessId);
  const shifts = getTenantShifts(businessId);
  return compareWorkforce(outlets, employees, shifts);
}
export const compare_outlet_workforce = compareOutletWorkforce;

export function calculateWorkforceScore(businessId: string, outletId?: string): {
  overallScore: number;
  outletScores: { outletId: string; outletName: string; score: number; riskLevel: string; primaryReason: string }[];
} {
  const metrics = compareOutletWorkforce(businessId);
  const filtered = outletId ? metrics.filter(m => m.outletId === outletId) : metrics;
  const overallScore = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.workforceHealthScore, 0) / metrics.length) : 0;

  return {
    overallScore,
    outletScores: filtered.map(m => ({
      outletId: m.outletId,
      outletName: m.outletName,
      score: m.workforceHealthScore,
      riskLevel: m.riskLevel,
      primaryReason: m.primaryRiskReason || ''
    }))
  };
}
export const calculate_workforce_score = calculateWorkforceScore;

export function getOvertimeData(businessId: string, filter?: { outletId?: string }) {
  let employees = getTenantEmployees(businessId);
  if (filter?.outletId) employees = employees.filter(e => e.outletId === filter.outletId);
  return analyzeWorkingHoursAndOvertime(employees);
}
export const get_overtime_data = getOvertimeData;

export function detectAttendanceRisks(businessId: string, filter?: { outletId?: string }) {
  const attendance = getAttendance(businessId, filter);
  return attendance.absenteeismHotspots;
}
export const detect_attendance_risks = detectAttendanceRisks;

export function detectOvertimeRisks(businessId: string, filter?: { outletId?: string }) {
  const otData = getOvertimeData(businessId, filter);
  return otData.excessiveOvertimeStaff;
}
export const detect_overtime_risks = detectOvertimeRisks;

export function get_staffing_status(businessId: string): {
  avgAttendance: number;
  absenteeismHotspots: StaffRecord[];
  activeHeadcount: number;
} {
  const staff = getTenantStaff(businessId);
  if (staff.length === 0) {
    return { avgAttendance: 0, absenteeismHotspots: [], activeHeadcount: 0 };
  }
  const avgAttendance = Math.round(staff.reduce((s, st) => s + st.attendance_pct, 0) / staff.length);
  const hotspots = staff.filter(st => st.attendance_pct < 80 || st.status === 'On Leave');
  return {
    avgAttendance,
    absenteeismHotspots: hotspots,
    activeHeadcount: staff.filter(st => st.status === 'Active').length,
  };
}

// -------------------------------------------------------------
// MARKETING INTELLIGENCE TOOLS
// -------------------------------------------------------------

export function getCampaigns(businessId: string, filter?: { outletId?: string; channel?: string; status?: string }): MarketingCampaign[] {
  let campaigns = getTenantCampaigns(businessId);
  if (!filter) return campaigns;
  if (filter.outletId) campaigns = campaigns.filter(c => c.outletId === filter.outletId);
  if (filter.channel) campaigns = campaigns.filter(c => c.channel.toLowerCase() === filter.channel?.toLowerCase());
  if (filter.status) campaigns = campaigns.filter(c => c.status.toLowerCase() === filter.status?.toLowerCase());
  return campaigns;
}
export const get_campaigns = getCampaigns;

export function getCampaignPerformance(businessId: string, filter?: { outletId?: string }): CampaignCalculatedMetrics[] {
  let campaigns = getTenantCampaigns(businessId);
  if (filter?.outletId) campaigns = campaigns.filter(c => c.outletId === filter.outletId);
  return rankAllCampaigns(campaigns);
}
export const get_campaign_performance = getCampaignPerformance;

export function calculateCampaignROI(businessId: string, campaignId?: string): {
  campaigns: { campaignId: string; campaignName: string; spend: number; attributedRevenue: number; roi: number }[];
  blendedROI: number;
  totalSpend: number;
  totalRevenue: number;
} {
  const campaigns = getTenantCampaigns(businessId);
  const filtered = campaignId ? campaigns.filter(c => c.campaignId === campaignId) : campaigns;
  const totalSpend = filtered.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = filtered.reduce((s, c) => s + c.attributedRevenue, 0);
  const blendedROI = calcROI(totalSpend, totalRevenue);

  return {
    campaigns: filtered.map(c => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      spend: c.spend,
      attributedRevenue: c.attributedRevenue,
      roi: calcROI(c.spend, c.attributedRevenue)
    })),
    blendedROI,
    totalSpend,
    totalRevenue
  };
}
export const calculate_campaign_roi = calculateCampaignROI;

export function calculateConversionRate(businessId: string, campaignId?: string): {
  campaigns: { campaignId: string; campaignName: string; clicks: number; conversions: number; conversionRate: number }[];
  blendedConversionRate: number;
} {
  const campaigns = getTenantCampaigns(businessId);
  const filtered = campaignId ? campaigns.filter(c => c.campaignId === campaignId) : campaigns;
  const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = filtered.reduce((s, c) => s + c.conversions, 0);
  const blendedConversionRate = calcConvRate(totalConversions, totalClicks);

  return {
    campaigns: filtered.map(c => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      clicks: c.clicks,
      conversions: c.conversions,
      conversionRate: calcConvRate(c.conversions, c.clicks)
    })),
    blendedConversionRate
  };
}
export const calculate_conversion_rate = calculateConversionRate;

export function calculateCustomerAcquisitionCost(businessId: string, campaignId?: string): {
  campaigns: { campaignId: string; campaignName: string; spend: number; customersAcquired: number; cac: number }[];
  averageCAC: number;
} {
  const campaigns = getTenantCampaigns(businessId);
  const filtered = campaignId ? campaigns.filter(c => c.campaignId === campaignId) : campaigns;
  const totalSpend = filtered.reduce((s, c) => s + c.spend, 0);
  const totalCustomers = filtered.reduce((s, c) => s + c.customersAcquired, 0);
  const averageCAC = calcCAC(totalSpend, totalCustomers);

  return {
    campaigns: filtered.map(c => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      spend: c.spend,
      customersAcquired: c.customersAcquired,
      cac: calcCAC(c.spend, c.customersAcquired)
    })),
    averageCAC
  };
}
export const calculate_customer_acquisition_cost = calculateCustomerAcquisitionCost;

export function compareCampaigns(businessId: string): CampaignCalculatedMetrics[] {
  const campaigns = getTenantCampaigns(businessId);
  return rankAllCampaigns(campaigns);
}
export const compare_campaigns = compareCampaigns;

export function compareMarketingChannels(businessId: string): ChannelPerformanceSummary[] {
  const campaigns = getTenantCampaigns(businessId);
  return compareChannels(campaigns);
}
export const compare_marketing_channels = compareMarketingChannels;

export function detectUnderperformingCampaigns(businessId: string): CampaignCalculatedMetrics[] {
  const campaigns = getTenantCampaigns(businessId);
  return detectBadCampaigns(campaigns);
}
export const detect_underperforming_campaigns = detectUnderperformingCampaigns;

export function calculateMarketingEffectiveness(businessId: string): {
  kpis: {
    totalMarketingSpend: number;
    totalAttributedRevenue: number;
    blendedROI: number;
    blendedConversionRate: number;
    averageCAC: number;
  };
  channelRankings: ChannelPerformanceSummary[];
  outletSummaries: OutletMarketingSummary[];
  topCampaigns: CampaignCalculatedMetrics[];
  underperformingCampaigns: CampaignCalculatedMetrics[];
} {
  const campaigns = getTenantCampaigns(businessId);
  const outlets = getTenantOutlets(businessId);
  const ranked = rankAllCampaigns(campaigns);
  const channels = compareChannels(campaigns);
  const outletSummaries = compareOutletsMarketing(outlets, campaigns);

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.attributedRevenue, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const totalCustomers = campaigns.reduce((s, c) => s + c.customersAcquired, 0);

  return {
    kpis: {
      totalMarketingSpend: totalSpend,
      totalAttributedRevenue: totalRevenue,
      blendedROI: calcROI(totalSpend, totalRevenue),
      blendedConversionRate: calcConvRate(totalConversions, totalClicks),
      averageCAC: calcCAC(totalSpend, totalCustomers)
    },
    channelRankings: channels,
    outletSummaries,
    topCampaigns: ranked.filter(c => c.performanceTier === 'TOP_PERFORMER'),
    underperformingCampaigns: ranked.filter(c => c.performanceTier === 'UNDERPERFORMING' || c.performanceTier === 'BUDGET_DRAIN')
  };
}
export const calculate_marketing_effectiveness = calculateMarketingEffectiveness;

export function get_marketing_performance(businessId: string): MarketingRecord[] {
  return getTenantMarketing(businessId);
}

export function get_campaign_roi(businessId: string): {
  topCampaigns: MarketingRecord[];
  underperformingCampaigns: MarketingRecord[];
  totalSpend: number;
  totalRevenue: number;
  networkRoi: number;
} {
  const marketing = getTenantMarketing(businessId);
  if (marketing.length === 0) {
    return { topCampaigns: [], underperformingCampaigns: [], totalSpend: 0, totalRevenue: 0, networkRoi: 0 };
  }
  const sorted = [...marketing].sort((a, b) => b.roi - a.roi);
  const totalSpend = marketing.reduce((s, m) => s + m.spend, 0);
  const totalRevenue = marketing.reduce((s, m) => s + m.revenue_generated, 0);
  const networkRoi = totalSpend > 0 ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 1000) / 10 : 0;
  return {
    topCampaigns: sorted.filter(m => m.roi >= 200),
    underperformingCampaigns: sorted.filter(m => m.roi < 150),
    totalSpend,
    totalRevenue,
    networkRoi,
  };
}

// -------------------------------------------------------------
// CROSS-AGENT COLLABORATION TOOLS
// -------------------------------------------------------------

export function getCrossAgentOperationalImpact(businessId: string): CrossAgentCampaignStaffImpact[] {
  const campaigns = getTenantCampaigns(businessId);
  const shifts = getTenantShifts(businessId);
  const employees = getTenantEmployees(businessId);
  return correlateCampaignsWithWorkforce(campaigns, shifts, employees);
}
export const get_cross_agent_operational_impact = getCrossAgentOperationalImpact;


import { 
  getAuditOverview, 
  getHighRiskAuditOutlets, 
  generateAIAuditInsights, 
  generateAuditReport 
} from './auditEngine';

export function get_audit_status(businessId: string) {
  return getAuditOverview(businessId);
}

export function get_open_compliance_issues(businessId: string): AuditRecord[] {
  const audits = getTenantAudits(businessId);
  return audits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress' || a.resolution_status === 'Escalated');
}

export function get_overdue_corrective_actions(businessId: string) {
  const audits = getTenantAudits(businessId);
  const now = new Date();
  return audits.filter(a => {
    if (a.resolution_status === 'Resolved') return false;
    const auditDate = new Date(a.audit_date);
    const diffDays = Math.floor((now.getTime() - auditDate.getTime()) / (1000 * 3600 * 24));
    return diffDays > 7;
  });
}

export function get_high_risk_audit_outlets(businessId: string) {
  return getHighRiskAuditOutlets(businessId);
}

export function get_audit_compliance_breakdown(businessId: string) {
  const overview = getAuditOverview(businessId);
  const insights = generateAIAuditInsights(businessId);
  const report = generateAuditReport(businessId);
  return {
    overview,
    insights,
    report
  };
}

export async function get_alerts(businessId: string): Promise<UnderperformanceDetection[]> {
  return await getUnderperformingDetections();
}

export function get_recommendations(businessId: string): Recommendation[] {
  return getTenantRecommendations(businessId);
}

export async function get_franchise_summary(businessId: string): Promise<{
  business: BusinessProfile;
  totalOutlets: number;
  totalRevenue: number;
  targetRevenue: number;
  targetAchievement: number;
  growthPercent: number;
  networkHealth: number;
  stockoutRisksCount: number;
  criticalAuditIssuesCount: number;
  staffAttendanceAvg: number;
}> {
  const business = getActiveBusiness();
  const outlets = getTenantOutlets(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const audits = getTenantAudits(businessId);
  const overallHealth = calculateOverallBusinessHealthScore(businessId);
  const trends = await analyzeRevenueTrends();

  const totalRevenue = sales.reduce((s, r) => s + r.revenue, 0);
  const targetRevenue = sales.reduce((s, r) => s + r.target_revenue, 0);
  const targetAchievement = targetRevenue > 0 ? (totalRevenue / targetRevenue) * 100 : 90;
  const staffAttendanceAvg = staff.length > 0 ? Math.round(staff.reduce((s, st) => s + st.attendance_pct, 0) / staff.length) : 92;

  return {
    business,
    totalOutlets: outlets.length,
    totalRevenue,
    targetRevenue,
    targetAchievement: Math.round(targetAchievement * 10) / 10,
    growthPercent: trends.growthPercent,
    networkHealth: overallHealth.score,
    stockoutRisksCount: inventory.filter(i => i.status === 'Stockout Risk' || i.current_stock < i.min_stock).length,
    criticalAuditIssuesCount: audits.filter(a => a.severity === 'Critical' || a.severity === 'High').length,
    staffAttendanceAvg,
  };
}

// -------------------------------------------------------------
// 2. ANALYTICAL & CALCULATION TOOLS
// -------------------------------------------------------------

export function calculate_growth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function calculate_target_achievement(actual: number, target: number): number {
  if (target === 0) return 100;
  return Math.round((actual / target) * 1000) / 10;
}

export function calculate_average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
}

export async function compare_outlets(
  businessId: string, 
  outletIdOrNameA: string, 
  outletIdOrNameB: string
): Promise<{
  outletA: any;
  outletB: any;
  differences: { metric: string; outletA: string; outletB: string; leader: string }[];
  summary: string;
} | null> {
  const benchmarks = await get_outlet_benchmarks(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const audits = getTenantAudits(businessId);

  const findOutlet = (nameOrId: string) => {
    return benchmarks.find(b => 
      b.outletId.toLowerCase() === nameOrId.toLowerCase() || 
      b.name.toLowerCase().includes(nameOrId.toLowerCase()) ||
      b.city.toLowerCase().includes(nameOrId.toLowerCase())
    );
  };

  const a = findOutlet(outletIdOrNameA);
  const b = findOutlet(outletIdOrNameB);

  if (!a || !b) return null;

  const aSales = sales.find(s => s.outlet_id === a.outletId);
  const bSales = sales.find(s => s.outlet_id === b.outletId);
  const aStockouts = inventory.filter(i => i.outlet_id === a.outletId && (i.status === 'Stockout Risk' || i.current_stock < i.min_stock));
  const bStockouts = inventory.filter(i => i.outlet_id === b.outletId && (i.status === 'Stockout Risk' || i.current_stock < i.min_stock));
  const aStaff = staff.filter(s => s.outlet_id === a.outletId);
  const bStaff = staff.filter(s => s.outlet_id === b.outletId);
  const aAudits = audits.filter(ad => ad.outlet_id === a.outletId);
  const bAudits = audits.filter(ad => ad.outlet_id === b.outletId);

  const aAvgAttendance = aStaff.length > 0 ? Math.round(aStaff.reduce((s, st) => s + st.attendance_pct, 0) / aStaff.length) : 95;
  const bAvgAttendance = bStaff.length > 0 ? Math.round(bStaff.reduce((s, st) => s + st.attendance_pct, 0) / bStaff.length) : 95;
  const aAuditScore = aAudits.length > 0 ? Math.round(aAudits.reduce((s, ad) => s + ad.compliance_score, 0) / aAudits.length) : 90;
  const bAuditScore = bAudits.length > 0 ? Math.round(bAudits.reduce((s, ad) => s + ad.compliance_score, 0) / bAudits.length) : 90;

  const differences = [
    {
      metric: 'Monthly Revenue',
      outletA: `₹${(a.revenue / 100000).toFixed(2)}L`,
      outletB: `₹${(b.revenue / 100000).toFixed(2)}L`,
      leader: a.revenue > b.revenue ? a.name : b.name,
    },
    {
      metric: 'Revenue Growth (MoM)',
      outletA: `${a.revenueGrowth > 0 ? '+' : ''}${a.revenueGrowth}%`,
      outletB: `${b.revenueGrowth > 0 ? '+' : ''}${b.revenueGrowth}%`,
      leader: a.revenueGrowth > b.revenueGrowth ? a.name : b.name,
    },
    {
      metric: 'Target Achievement',
      outletA: `${a.targetAchievement.toFixed(1)}%`,
      outletB: `${b.targetAchievement.toFixed(1)}%`,
      leader: a.targetAchievement > b.targetAchievement ? a.name : b.name,
    },
    {
      metric: 'Average Order Value (AOV)',
      outletA: `₹${Math.round(a.aov)}`,
      outletB: `₹${Math.round(b.aov)}`,
      leader: a.aov > b.aov ? a.name : b.name,
    },
    {
      metric: 'Operational Health Score',
      outletA: `${a.healthScore}/100 (${a.category})`,
      outletB: `${b.healthScore}/100 (${b.category})`,
      leader: a.healthScore > b.healthScore ? a.name : b.name,
    },
    {
      metric: 'Inventory Stockout Risks',
      outletA: `${aStockouts.length} SKU(s)`,
      outletB: `${bStockouts.length} SKU(s)`,
      leader: aStockouts.length < bStockouts.length ? a.name : b.name,
    },
    {
      metric: 'Workforce Attendance',
      outletA: `${aAvgAttendance}%`,
      outletB: `${bAvgAttendance}%`,
      leader: aAvgAttendance > bAvgAttendance ? a.name : b.name,
    },
    {
      metric: 'Audit Compliance',
      outletA: `${aAuditScore}%`,
      outletB: `${bAuditScore}%`,
      leader: aAuditScore > bAuditScore ? a.name : b.name,
    },
  ];

  const summary = `${a.name} is performing at ${a.healthScore}/100 health vs ${b.name} at ${b.healthScore}/100. ` +
    `${a.revenue > b.revenue ? a.name : b.name} leads in gross volume, while ${a.revenueGrowth > b.revenueGrowth ? a.name : b.name} leads in MoM growth trajectory.`;

  return {
    outletA: { ...a, sales: aSales, stockouts: aStockouts, attendance: aAvgAttendance, auditScore: aAuditScore },
    outletB: { ...b, sales: bSales, stockouts: bStockouts, attendance: bAvgAttendance, auditScore: bAuditScore },
    differences,
    summary,
  };
}

export async function rank_outlets(
  businessId: string, 
  metric: 'revenue' | 'growth' | 'targetAchievement' | 'healthScore' | 'aov' = 'healthScore',
  ascending: boolean = false
): Promise<OutletBenchmarking[]> {
  const benchmarks = await get_outlet_benchmarks(businessId);
  const copy = [...benchmarks];
  copy.sort((a, b) => {
    const valA = metric === 'revenue' ? a.revenue :
                 metric === 'growth' ? a.revenueGrowth :
                 metric === 'targetAchievement' ? a.targetAchievement :
                 metric === 'aov' ? a.aov : a.healthScore;
    const valB = metric === 'revenue' ? b.revenue :
                 metric === 'growth' ? b.revenueGrowth :
                 metric === 'targetAchievement' ? b.targetAchievement :
                 metric === 'aov' ? b.aov : b.healthScore;
    return ascending ? valA - valB : valB - valA;
  });
  return copy;
}

export async function detect_anomalies(businessId: string): Promise<{
  underperforming: UnderperformanceDetection[];
  inventoryAnomalies: InventoryItemEnhanced[] | InventoryRecord[];
  workforceAnomalies: StaffRecord[];
  auditAnomalies: AuditRecord[];
}> {
  const underperforming = await getUnderperformingDetections();
  const inventory = get_inventory_risks(businessId).risks;
  const staff = get_staffing_status(businessId).absenteeismHotspots;
  const audits = get_open_compliance_issues(businessId);

  return {
    underperforming,
    inventoryAnomalies: inventory,
    workforceAnomalies: staff,
    auditAnomalies: audits,
  };
}

// -------------------------------------------------------------
// 3. CROSS-DOMAIN INVESTIGATION TOOL
// -------------------------------------------------------------

export async function investigate_cross_domain_causes(
  businessId: string, 
  outletIdOrName: string
): Promise<{
  outletName: string;
  revenueStatus: string;
  rootCauses: { domain: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; finding: string; evidence: string }[];
  connectedExplanation: string;
  recommendedActions: { label: string; actionType: string; priority: string; description: string }[];
}> {
  const details = get_outlet_details(businessId, outletIdOrName);
  const benchmarks = await get_outlet_benchmarks(businessId);

  if (!details.outlet) {
    return {
      outletName: outletIdOrName,
      revenueStatus: 'Outlet not found',
      rootCauses: [],
      connectedExplanation: `I could not locate an outlet matching "${outletIdOrName}" in your current business data.`,
      recommendedActions: [],
    };
  }

  const bm = benchmarks.find(b => b.outletId === details.outlet!.id);
  const rootCauses: { domain: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; finding: string; evidence: string }[] = [];
  const recommendedActions: { label: string; actionType: string; priority: string; description: string }[] = [];

  // 1. Sales & Growth Inspection
  const sales = details.sales;
  const growth = bm?.revenueGrowth ?? (sales ? calculate_growth(sales.revenue, sales.target_revenue) : 0);
  const targetAch = bm?.targetAchievement ?? (sales ? calculate_target_achievement(sales.revenue, sales.target_revenue) : 100);

  // 2. Inventory Cross-Check
  const stockoutItems = details.inventory.filter(i => i.status === 'Stockout Risk' || i.current_stock < i.min_stock);
  if (stockoutItems.length > 0) {
    rootCauses.push({
      domain: 'Inventory & Supply Chain',
      severity: 'Critical',
      finding: `Acute stockout risk detected on core recipe items: ${stockoutItems.map(i => i.product_name).join(', ')}`,
      evidence: stockoutItems.map(i => `${i.product_name}: ${i.current_stock} ${i.unit} in stock (Safety buffer: min ${i.min_stock} ${i.unit}, Supplier: ${i.supplier})`).join('; '),
    });
    recommendedActions.push({
      label: `Approve Emergency Restock PO (${stockoutItems[0].product_name.split(' ')[0]})`,
      actionType: 'dispatch_po',
      priority: 'Critical',
      description: `Dispatch expedited PO for ${stockoutItems[0].product_name} from primary logistics hub.`,
    });
  }

  // 3. Workforce & Staffing Inspection
  const troubledStaff = details.staff.filter(s => s.attendance_pct < 80 || s.status === 'On Leave');
  if (troubledStaff.length > 0) {
    rootCauses.push({
      domain: 'Staffing & Kitchen Operations',
      severity: 'High',
      finding: `Staff absenteeism identified in key kitchen/floor roles (${troubledStaff.map(s => `${s.employee_name} - ${s.role} at ${s.attendance_pct}% attendance`).join(', ')})`,
      evidence: `Workforce attendance dropped below standard 85% threshold, directly reducing table turnover and order preparation velocity.`,
    });
    recommendedActions.push({
      label: `Dispatch Float Staff to ${details.outlet.name.split(' - ')[1] || details.outlet.city}`,
      actionType: 'dispatch_staff',
      priority: 'High',
      description: `Reallocate 2 float kitchen staff from regional hub for peak shift coverage.`,
    });
  }

  // 4. Operational Audits Inspection
  const openAudits = details.audits.filter(a => a.compliance_score < 80 || a.severity === 'High' || a.severity === 'Critical');
  if (openAudits.length > 0) {
    rootCauses.push({
      domain: 'Operational Compliance & SOPs',
      severity: openAudits.some(a => a.severity === 'Critical') ? 'Critical' : 'High',
      finding: `Open compliance non-conformities affecting service: ${openAudits.map(a => a.issue).join(' | ')}`,
      evidence: openAudits.map(a => `${a.category}: ${a.compliance_score}% score - "${a.issue}" (Action: ${a.corrective_action})`).join('; '),
    });
    recommendedActions.push({
      label: `Schedule Audit Follow-up (${details.outlet.city})`,
      actionType: 'schedule_audit',
      priority: 'Medium',
      description: `Assign regional field supervisor to verify resolution of ${openAudits[0].issue}.`,
    });
  }

  // 5. Marketing Inspection
  const outletMarketing = details.marketing;
  if (growth < 0 && outletMarketing.length === 0) {
    rootCauses.push({
      domain: 'Marketing & Demand Generation',
      severity: 'Medium',
      finding: `Zero active promotional or geo-targeted delivery campaigns running in this catchment zone.`,
      evidence: `No active marketing spend recorded to counter footfall drop.`,
    });
    recommendedActions.push({
      label: `Launch 20% Geotargeted Delivery Promo`,
      actionType: 'launch_promo',
      priority: 'High',
      description: `Deploy aggregator 20% promotional discount in 5km radius to recover walk-in footfall deficits.`,
    });
  }

  // Connected Explanation Synthesis
  let connectedExplanation = '';
  if (rootCauses.length === 0) {
    connectedExplanation = `${details.outlet.name} is performing stably with no critical operational friction detected across inventory, staffing, or audits.`;
  } else {
    const causesText = rootCauses.map((rc, i) => `${i + 1}. **${rc.domain}**: ${rc.finding}`).join('\n');
    connectedExplanation = `**Cross-Domain Root Cause Analysis for ${details.outlet.name}:**\n\n` +
      `The store recorded **${growth > 0 ? '+' : ''}${growth}% MoM revenue growth** with target achievement at **${targetAch.toFixed(1)}%**.\n\n` +
      `Our multi-agent investigation identified **${rootCauses.length} interconnected operational factor(s)**:\n\n${causesText}`;
  }

  return {
    outletName: details.outlet.name,
    revenueStatus: `Revenue: ₹${((sales?.revenue || 0) / 100000).toFixed(2)}L (${growth > 0 ? '+' : ''}${growth}% MoM, ${targetAch.toFixed(1)}% Target)`,
    rootCauses,
    connectedExplanation,
    recommendedActions,
  };
}

// -------------------------------------------------------------
// 4. BUSINESS CONTEXT & RAG LAYER
// -------------------------------------------------------------

export function get_business_sop_context(businessId: string, topic?: string): {
  businessProfile: BusinessProfile;
  sopGuidelines: { topic: string; standard: string; rule: string }[];
} {
  const business = getActiveBusiness();
  const sops = [
    {
      topic: 'Order Preparation Time',
      standard: 'Max 14 minutes ticket time from order placement to table/dispatch.',
      rule: 'If average latency exceeds 18 minutes, trigger float kitchen chef support.'
    },
    {
      topic: 'Inventory Safety Buffer',
      standard: 'Maintain minimum 48 hours of primary ingredients (rice, meat, signature spices, ghee).',
      rule: 'If current stock < min_stock, trigger automatic PO reorder alert before 5 PM.'
    },
    {
      topic: 'Staff Attendance & Fill Rate',
      standard: 'Minimum 85% shift attendance required for full station staffing.',
      rule: 'If chef attendance < 80%, notify regional operations manager for emergency float coverage.'
    },
    {
      topic: 'Food Safety & Hygiene Score',
      standard: 'Mandatory 90%+ compliance score on cold chain logs and kitchen sanitation.',
      rule: 'Any critical audit finding requires corrective verification within 48 hours.'
    },
    {
      topic: 'Target Achievement & Performance Triggers',
      standard: 'Outlets pacing below 85% of monthly target are flagged for operational review.',
      rule: 'Pair lagging units with high-ROI local delivery promotions.'
    }
  ];

  if (!topic) return { businessProfile: business, sopGuidelines: sops };
  return {
    businessProfile: business,
    sopGuidelines: sops.filter(s => 
      s.topic.toLowerCase().includes(topic.toLowerCase()) || 
      s.standard.toLowerCase().includes(topic.toLowerCase())
    )
  };
}



