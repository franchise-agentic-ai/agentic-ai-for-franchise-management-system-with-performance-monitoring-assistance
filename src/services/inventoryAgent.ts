import { 
  InventoryItemEnhanced, 
  InventoryAgentInsight, 
  ReplenishmentRecommendation, 
  StockoutRiskAssessment, 
  DemandForecastResult, 
  InventoryKPIs,
  OutletInventoryComparison,
  FastSlowMovingProduct,
  ControlTowerSummary,
  WastageSummary
} from '../types';
import { 
  getTenantInventoryEnhanced, 
  getTenantSales, 
  getTenantMovements, 
  getTenantOutlets, 
  getTenantPurchaseOrders,
  getTenantTransfers,
  getTenantWastage,
  saveTenantRecommendationsEnhanced,
  logTenantActivity,
  getActiveBusiness
} from './tenantService';
import { 
  forecastProductDemand, 
  detectStockoutRisks, 
  generateSmartReplenishmentDecisions, 
  identifyFastAndSlowMovers, 
  calculateInventoryKPIs, 
  compareOutletsInventory,
  calculateControlTowerSummary,
  calculateWastageSummary
} from './inventoryEngine';

export interface InventoryAgentScanResult {
  businessId: string;
  timestamp: string;
  kpis: InventoryKPIs;
  controlTower: ControlTowerSummary;
  wastageSummary: WastageSummary;
  insights: InventoryAgentInsight[];
  stockoutRisks: StockoutRiskAssessment[];
  recommendations: ReplenishmentRecommendation[];
  forecasts: DemandForecastResult[];
  fastSlowMovers: FastSlowMovingProduct[];
  outletComparisons: OutletInventoryComparison[];
  summaryNarrative: string;
}

export type InventoryThinkingCallback = (step: string, phase: number, totalPhases: number) => void;

/**
 * Autonomous Inventory Agent
 * Runs dynamic multi-step analysis on real database/tenant inventory data, traceable movements, POs, transfers, and wastage.
 */
export async function runInventoryAgent(
  businessId: string,
  onThinkingStep?: InventoryThinkingCallback
): Promise<InventoryAgentScanResult> {
  // Phase 1: OBSERVE & QUERY
  if (onThinkingStep) onThinkingStep('Observing multi-outlet catalog, active stock levels, open POs, and pending transfers...', 1, 5);
  await new Promise(r => setTimeout(r, 120));

  const business = getActiveBusiness();
  const outlets = getTenantOutlets(businessId);
  const inventory = getTenantInventoryEnhanced(businessId);
  const sales = getTenantSales(businessId);
  const movements = getTenantMovements(businessId);
  const purchaseOrders = getTenantPurchaseOrders(businessId);
  const transfers = getTenantTransfers(businessId);
  const wastageRecords = getTenantWastage(businessId);

  // Phase 2: ANALYZE & FORECAST
  if (onThinkingStep) onThinkingStep('Analyzing sales velocity, run-out dates, and calculating multi-horizon demand forecasts...', 2, 5);
  await new Promise(r => setTimeout(r, 150));

  const forecasts: DemandForecastResult[] = inventory.map(item => 
    forecastProductDemand(item, sales, movements, 7)
  );

  // Phase 3: RISK DETECTION & SCORE BREAKDOWN
  if (onThinkingStep) onThinkingStep('Evaluating multi-factor risk scores (0-100), supplier lead times & wastage drag...', 3, 5);
  await new Promise(r => setTimeout(r, 150));

  const stockoutRisks = detectStockoutRisks(inventory, sales, purchaseOrders);
  const criticalRisks = stockoutRisks.filter(r => r.risk_level === 'CRITICAL' || r.risk_level === 'HIGH');
  const fastSlowMovers = identifyFastAndSlowMovers(inventory, sales);
  const wastageSummary = calculateWastageSummary(wastageRecords);

  // Phase 4: EVALUATE OPTIONS (TRANSFER VS BUY VS MONITOR)
  if (onThinkingStep) onThinkingStep('Evaluating smart replenishment strategies (Transfer from excess outlet vs Supplier Purchase Order)...', 4, 5);
  await new Promise(r => setTimeout(r, 150));

  const recommendations = generateSmartReplenishmentDecisions(inventory, purchaseOrders, outlets, sales);
  const kpis = calculateInventoryKPIs(inventory, recommendations, purchaseOrders, transfers, wastageRecords);
  const outletComparisons = compareOutletsInventory(inventory, outlets);
  const controlTower = calculateControlTowerSummary(inventory, recommendations, stockoutRisks, purchaseOrders, transfers, wastageRecords);

  // Phase 5: SYNTHESIZE & FORMULATE EXECUTIVE INTELLIGENCE
  if (onThinkingStep) onThinkingStep('Formulating Control Tower action queue & structured executive intelligence...', 5, 5);
  await new Promise(r => setTimeout(r, 120));

  const insights: InventoryAgentInsight[] = [];

  // 1. Stockout Insights
  if (criticalRisks.length > 0) {
    const affectedOutlets = Array.from(new Set(criticalRisks.map(r => r.outlet_name)));
    const affectedProducts = Array.from(new Set(criticalRisks.map(r => r.product_name)));
    insights.push({
      id: `ins_risk_${Date.now()}_1`,
      title: `${criticalRisks.length} SKU(s) at Critical Stockout Risk across ${affectedOutlets.length} Outlets`,
      summary: `Critical run-out danger detected for ${affectedProducts.slice(0, 3).join(', ')}${affectedProducts.length > 3 ? ` and ${affectedProducts.length - 3} others` : ''}. Current on-hand quantities cannot bridge standard supplier lead times.`,
      severity: 'Critical',
      category: 'Stockout Risk',
      affected_outlets: affectedOutlets,
      affected_products: affectedProducts,
      actionable_step: `Approve expedited replenishment actions totaling ₹${recommendations.filter(r => r.priority === 'Critical').reduce((s, r) => s + r.estimated_cost, 0).toLocaleString()} to avert service disruption.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Cross-Outlet Transfer Opportunities
  const transferRecs = recommendations.filter(r => r.action_type === 'TRANSFER_FROM_OUTLET');
  if (transferRecs.length > 0) {
    const srcOutlets = Array.from(new Set(transferRecs.map(r => r.source_outlet_name || 'Excess Outlet')));
    const destOutlets = Array.from(new Set(transferRecs.map(r => r.outlet_name)));
    insights.push({
      id: `ins_transfer_${Date.now()}_2`,
      title: `${transferRecs.length} Cost-Saving Inter-Outlet Transfer Opportunities`,
      summary: `Identified opportunities to balance stock between ${srcOutlets.join(', ')} and ${destOutlets.join(', ')} without placing unnecessary vendor purchase orders.`,
      severity: 'Positive',
      category: 'Cross-Outlet Transfer',
      affected_outlets: [...srcOutlets, ...destOutlets],
      affected_products: Array.from(new Set(transferRecs.map(r => r.product_name))),
      actionable_step: `Execute transfer dispatch requests to save approximately ₹${transferRecs.reduce((s, r) => s + r.estimated_cost, 0).toLocaleString()} in new procurement expenditure.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Overstock / Waste Insights
  const overstocked = inventory.filter(i => i.status === 'OVERSTOCK');
  if (overstocked.length > 0) {
    const overOutlets = Array.from(new Set(overstocked.map(i => i.outlet_name)));
    const overProducts = Array.from(new Set(overstocked.map(i => i.product_name)));
    insights.push({
      id: `ins_over_${Date.now()}_3`,
      title: `Excess Working Capital in ${overstocked.length} Overstocked Item(s)`,
      summary: `Outlets (${overOutlets.join(', ')}) are holding inventory exceeding 45 days of forward consumption, creating spoilage risk and tying up cash flow.`,
      severity: 'Warning',
      category: 'Overstock / Waste',
      affected_outlets: overOutlets,
      affected_products: overProducts,
      actionable_step: `Pause replenishment POs for these SKUs and evaluate inter-outlet transfers to locations experiencing shortages.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Fast Movers Surge Insight
  const highVelocity = fastSlowMovers.filter(f => f.turnover_type === 'Fast Moving');
  if (highVelocity.length > 0) {
    insights.push({
      id: `ins_fast_${Date.now()}_4`,
      title: `High Velocity Consumption Surge on Core Recipe SKUs`,
      summary: `${highVelocity.map(h => h.product_name).slice(0, 3).join(', ')} are moving at accelerated daily rates (${highVelocity[0].daily_velocity} ${highVelocity[0].unit}/day average).`,
      severity: 'Positive',
      category: 'Velocity Surge',
      affected_outlets: Array.from(new Set(highVelocity.map(h => h.outlet_name))),
      affected_products: Array.from(new Set(highVelocity.map(h => h.product_name))),
      actionable_step: `Increase baseline safety stock multiplier from 1.0x to 1.5x during weekend peaks.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Wastage Impact Alert
  if (wastageSummary.totalCostImpact > 0) {
    insights.push({
      id: `ins_waste_${Date.now()}_5`,
      title: `Monthly Spoilage & Damage Impact: ₹${wastageSummary.totalCostImpact.toLocaleString()}`,
      summary: `Top loss categories: ${wastageSummary.byReasonBreakdown.slice(0, 2).map(r => `${r.reason} (${r.percentage}%)`).join(', ')}.`,
      severity: wastageSummary.totalCostImpact > 5000 ? 'Warning' : 'Info',
      category: 'Overstock / Waste',
      affected_outlets: outlets.map(o => o.name),
      affected_products: wastageSummary.topLossProducts.map(p => p.product_name),
      actionable_step: `Inspect cold chain logs and prep station portion control to reduce wastage percentage below 1.5%.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Persist generated replenishment recommendations
  saveTenantRecommendationsEnhanced(businessId, recommendations);

  // Generate executive summary narrative
  const summaryNarrative = 
    `The Inventory Agent analyzed ${inventory.length} SKUs across ${outlets.length} outlets for ${business.name}. ` +
    `Total network inventory valuation stands at ₹${kpis.totalInventoryValue.toLocaleString()} with ${controlTower.actionQueue.length} prioritized items in the Control Tower. ` +
    `${kpis.criticalCount} item(s) are at CRITICAL stockout risk and ${kpis.lowStockCount} item(s) are in LOW STOCK warning. ` +
    `Formulated ${recommendations.length} intelligent replenishment decisions (${recommendations.filter(r => r.action_type === 'TRANSFER_FROM_OUTLET').length} inter-outlet transfers, ${recommendations.filter(r => r.action_type === 'REORDER' || r.action_type === 'URGENT_REORDER').length} vendor POs).`;

  logTenantActivity(
    businessId,
    'Inventory Agent',
    `Completed inventory intelligence scan: ${criticalRisks.length} critical risks identified, ${recommendations.length} replenishment actions formulated.`,
    insights.length
  );

  return {
    businessId,
    timestamp: new Date().toISOString(),
    kpis,
    controlTower,
    wastageSummary,
    insights,
    stockoutRisks,
    recommendations,
    forecasts,
    fastSlowMovers,
    outletComparisons,
    summaryNarrative,
  };
}
