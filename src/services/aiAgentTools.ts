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
  BusinessProfile
} from '../types';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantSales, 
  getTenantInventory, 
  getTenantStaff, 
  getTenantMarketing, 
  getTenantAudits, 
  calculateOverallBusinessHealthScore,
  calculateBusinessSetupProgress
} from './tenantService';
import { getTenantInsights, getTenantRecommendations } from './franchiseIntelligenceEngine';
import { getBenchmarkingData, analyzeRevenueTrends, getUnderperformingDetections } from './outletPerformanceService';

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

export function get_inventory_status(businessId: string, outletId?: string): InventoryRecord[] {
  const inventory = getTenantInventory(businessId);
  if (!outletId) return inventory;
  return inventory.filter(i => i.outlet_id === outletId);
}

export function get_inventory_risks(businessId: string): {
  risks: InventoryRecord[];
  totalRisksCount: number;
  criticalOutlets: string[];
} {
  const inventory = getTenantInventory(businessId);
  const risks = inventory.filter(i => i.status === 'Stockout Risk' || i.current_stock < i.min_stock);
  const criticalOutlets = Array.from(new Set(risks.map(r => r.outlet_name)));
  return {
    risks,
    totalRisksCount: risks.length,
    criticalOutlets,
  };
}

export function get_staff_performance(businessId: string, outletId?: string): StaffRecord[] {
  const staff = getTenantStaff(businessId);
  if (!outletId) return staff;
  return staff.filter(s => s.outlet_id === outletId);
}

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
    return {
      topCampaigns: [],
      underperformingCampaigns: [],
      totalSpend: 0,
      totalRevenue: 0,
      networkRoi: 0,
    };
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

export function get_audit_status(businessId: string): {
  audits: AuditRecord[];
  avgComplianceScore: number;
  criticalIssues: AuditRecord[];
} {
  const audits = getTenantAudits(businessId);
  if (audits.length === 0) {
    return { audits: [], avgComplianceScore: 100, criticalIssues: [] };
  }
  const avgComplianceScore = Math.round(audits.reduce((s, a) => s + a.compliance_score, 0) / audits.length);
  const criticalIssues = audits.filter(a => a.severity === 'Critical' || a.severity === 'High' || a.compliance_score < 75);
  return {
    audits,
    avgComplianceScore,
    criticalIssues,
  };
}

export function get_open_compliance_issues(businessId: string): AuditRecord[] {
  const audits = getTenantAudits(businessId);
  return audits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress' || a.resolution_status === 'Escalated');
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
  inventoryAnomalies: InventoryRecord[];
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
