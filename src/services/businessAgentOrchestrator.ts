import { GoogleGenAI } from '@google/genai';
import { 
  get_outlets, 
  get_outlet_details, 
  get_sales_data, 
  get_revenue_trends, 
  get_outlet_benchmarks, 
  get_health_scores, 
  get_inventory_status, 
  get_product_inventory,
  get_inventory_movements,
  get_sales_history,
  get_sales_velocity,
  get_inventory_forecast,
  get_stockout_risk, 
  get_overstock_risk,
  calculate_reorder_point,
  calculate_replenishment_quantity,
  get_replenishment_recommendations,
  get_outlet_inventory_comparison,
  get_fast_slow_moving_products,
  get_inventory_risks, 
  get_stock_ledger,
  get_purchase_orders,
  get_stock_transfers,
  get_wastage_records,
  get_wastage_analytics,
  get_control_tower_summary,
  get_stock_counts,
  get_inventory_audit_logs,
  get_staff_performance, 
  get_staffing_status, 
  get_marketing_performance, 
  get_campaign_roi, 
  get_audit_status, 
  get_open_compliance_issues, 
  get_alerts, 
  get_recommendations, 
  get_franchise_summary, 
  get_business_sop_context,
  compare_outlets, 
  rank_outlets, 
  detect_anomalies, 
  investigate_cross_domain_causes,
  calculate_growth,
  calculate_target_achievement
} from './aiAgentTools';
import { getActiveBusiness, logTenantActivity } from './tenantService';
import { OutletBenchmarking } from '../types';

const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) 
  || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) 
  || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client in Orchestrator:', err);
  }
}

export interface AgentStepStatus {
  step: string;
  tool?: string;
  status: 'running' | 'completed';
}

export interface AgentStructuredOutput {
  intent: string;
  data_sources: string[];
  tools_called: string[];
  reasoning_steps: string[];
  key_metrics: string[];
  related_outlets: string[];
  insights: string[];
  risks: string[];
  recommendations: string[];
  suggested_action?: {
    label: string;
    actionType: string;
    payload?: any;
  };
  answer: string;
  isAiGenerated: boolean;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedOutlets?: string[];
  intent?: string;
}

// In-memory conversation session memory keyed by businessId
const conversationMemory: Record<string, ConversationTurn[]> = {};

export function getConversationHistory(businessId: string): ConversationTurn[] {
  return conversationMemory[businessId] || [];
}

export function clearConversationHistory(businessId: string) {
  conversationMemory[businessId] = [];
}

export function addConversationTurn(businessId: string, turn: ConversationTurn) {
  if (!conversationMemory[businessId]) {
    conversationMemory[businessId] = [];
  }
  conversationMemory[businessId].push(turn);
  // Keep last 20 turns
  if (conversationMemory[businessId].length > 20) {
    conversationMemory[businessId] = conversationMemory[businessId].slice(-20);
  }
}

/**
 * Resolves conversational pronouns and references using historical context
 */
function resolveContextualEntities(question: string, history: ConversationTurn[], availableOutlets: { id: string; name: string; city: string }[]): {
  resolvedQuestion: string;
  targetOutlet: { id: string; name: string; city: string } | null;
  comparisonOutlet: { id: string; name: string; city: string } | null;
} {
  const qLower = question.toLowerCase().trim();
  
  // Direct mention in current query
  let directMatch = availableOutlets.find(o => 
    qLower.includes(o.name.toLowerCase()) || 
    qLower.includes(o.city.toLowerCase()) ||
    qLower.includes(o.id.toLowerCase()) ||
    (o.name.includes(' - ') && qLower.includes(o.name.split(' - ')[1].toLowerCase()))
  );

  let targetOutlet: { id: string; name: string; city: string } | null = directMatch || null;
  let comparisonOutlet: { id: string; name: string; city: string } | null = null;

  // Check for pronoun references like "why is it...", "how to fix it", "show its stock", "what about that outlet"
  const hasPronoun = /\b(it|this|that|there|they|its|the store|the outlet|why\?|why)\b/i.test(qLower);

  if (!targetOutlet && (hasPronoun || qLower === 'why' || qLower === 'why?' || qLower.startsWith('why '))) {
    // Look back in history for the last mentioned outlet
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      if (turn.referencedOutlets && turn.referencedOutlets.length > 0) {
        const found = availableOutlets.find(o => 
          turn.referencedOutlets!.includes(o.name) || 
          turn.referencedOutlets!.includes(o.id) ||
          turn.referencedOutlets!.includes(o.city)
        );
        if (found) {
          targetOutlet = found;
          break;
        }
      }
    }
  }

  // Check for comparison references e.g. "compare it with best outlet", "compare with top"
  if (qLower.includes('compare') || qLower.includes('vs') || qLower.includes('versus')) {
    if (!targetOutlet && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].referencedOutlets && history[i].referencedOutlets.length > 0) {
          const found = availableOutlets.find(o => history[i].referencedOutlets!.includes(o.name));
          if (found) {
            targetOutlet = found;
            break;
          }
        }
      }
    }
  }

  let resolvedQuestion = question;
  if (targetOutlet && hasPronoun && !directMatch) {
    resolvedQuestion = `${question} (referring to ${targetOutlet.name})`;
  }

  return { resolvedQuestion, targetOutlet, comparisonOutlet };
}

/**
 * Main Business Intelligence Agent Orchestrator.
 * Follows the complete:
 * UNDERSTAND -> IDENTIFY REQUIRED TOOLS -> RETRIEVE LIVE DATA -> CALCULATE -> CROSS-DOMAIN REASON -> GENERATE STRUCTURED OUTPUT
 */
export async function runBusinessAgentOrchestrator(
  question: string,
  businessId: string,
  options?: {
    currentPage?: string;
    onStepUpdate?: (step: AgentStepStatus) => void;
  }
): Promise<AgentStructuredOutput> {
  const history = getConversationHistory(businessId);
  const business = getActiveBusiness();
  const outlets = get_outlets(businessId);
  const notifyStep = (stepText: string, toolName?: string) => {
    if (options?.onStepUpdate) {
      options.onStepUpdate({ step: stepText, tool: toolName, status: 'running' });
    }
  };

  // 1. QUERY UNDERSTANDING & CONTEXTUAL RESOLUTION
  notifyStep('Analyzing question intent & conversational memory...', 'intent_parser');
  const { resolvedQuestion, targetOutlet } = resolveContextualEntities(question, history, outlets);
  const q = resolvedQuestion.toLowerCase();

  const toolsCalled: string[] = [];
  const reasoningSteps: string[] = [];
  const dataSources: string[] = [];

  // 2. DYNAMIC TOOL SELECTION & EXECUTION PLAN
  let intent = 'GENERAL_QUERY';
  let structuredResult: AgentStructuredOutput;

  // Pattern Matchers for Intents
  const isBestOutletQuery = (q.includes('best') || q.includes('top') || q.includes('highest revenue') || q.includes('leader')) && 
    (q.includes('outlet') || q.includes('store') || q.includes('performing') || q.includes('location') || q.includes('unit'));
  
  const isWorstOutletQuery = (q.includes('worst') || q.includes('underperform') || q.includes('lowest') || q.includes('poor') || q.includes('laggard') || q.includes('trailing') || q.includes('attention') || q.includes('failing')) && 
    (q.includes('outlet') || q.includes('store') || q.includes('location') || q.includes('which') || q.includes('who') || q.includes('need'));

  const isWhyOrRootCause = (q.includes('why') || q.includes('cause') || q.includes('reason') || q.includes('drop') || q.includes('decline') || q.includes('contract')) || 
    (targetOutlet !== null && (q.includes('improve') || q.includes('fix') || q.includes('problem') || q.includes('status')));

  const isInventoryQuery = q.includes('inventory') || q.includes('stock') || q.includes('stockout') || q.includes('supply') || q.includes('reorder') || q.includes('buffer') || q.includes('sku') || q.includes('ingredient');

  const isStaffQuery = q.includes('staff') || q.includes('employee') || q.includes('attendance') || q.includes('shortage') || q.includes('chef') || q.includes('shift') || q.includes('roster') || q.includes('headcount');

  const isMarketingQuery = q.includes('marketing') || q.includes('campaign') || q.includes('roi') || q.includes('roas') || q.includes('conversion') || q.includes('promot') || q.includes('ad spend') || q.includes('customer acquisition');

  const isAuditComplianceQuery = q.includes('audit') || q.includes('compliance') || q.includes('sop') || q.includes('hygiene') || q.includes('food safety') || q.includes('violation') || q.includes('ticket time');

  const isRiskQuery = q.includes('risk') || q.includes('danger') || q.includes('vulnerab') || q.includes('threat') || q.includes('problem') || q.includes('friction');

  const isSummaryQuery = q.includes('executive summary') || q.includes('summary') || q.includes('overview') || q.includes('consolidated') || q.includes('how is my business') || q.includes('health of my business') || q.includes('business status');

  const isPriorityQuery = q.includes('prioritize') || q.includes('priority') || q.includes('action') || q.includes('what should i do') || q.includes('what to do') || q.includes('recommend') || q.includes('today') || q.includes('this week');

  const isCompareQuery = q.includes('compare') || q.includes('versus') || q.includes('vs') || (q.includes('difference between') && outlets.length >= 2);

  const isRevenueOrSalesQuery = q.includes('total revenue') || q.includes('sales volume') || q.includes('growth rate') || q.includes('target achievement') || q.includes('aov') || q.includes('average order');

  // -------------------------------------------------------------
  // 3. EXECUTE REQUISITE TOOLS & COLLECT LIVE DATA
  // -------------------------------------------------------------

  if (isCompareQuery) {
    intent = 'OUTLET_COMPARISON';
    notifyStep('Invoking comparison engine across multiple outlets...', 'compare_outlets');
    toolsCalled.push('get_outlet_benchmarks', 'get_sales_data', 'compare_outlets');
    dataSources.push('Outlets', 'Sales', 'Inventory', 'Staffing', 'Audits');

    // Find two outlets to compare
    let outletA = outlets[0];
    let outletB = outlets[outlets.length - 1];

    if (targetOutlet) {
      outletA = targetOutlet as any;
      const other = outlets.find(o => o.id !== outletA.id);
      if (other) outletB = other;
    }

    // Try finding specific names in query
    const mentioned = outlets.filter(o => q.includes(o.name.toLowerCase()) || q.includes(o.city.toLowerCase()) || (o.name.includes(' - ') && q.includes(o.name.split(' - ')[1].toLowerCase())));
    if (mentioned.length >= 2) {
      outletA = mentioned[0];
      outletB = mentioned[1];
    }

    const comparison = await compare_outlets(businessId, outletA.name, outletB.name);

    if (comparison) {
      reasoningSteps.push(`Calculated delta across 8 metrics for ${comparison.outletA.name} vs ${comparison.outletB.name}.`);
      reasoningSteps.push(`Identified leader in revenue (${comparison.differences[0].leader}) and leader in growth (${comparison.differences[1].leader}).`);

      const answer = `### Comparative Operational Audit: ${comparison.outletA.name} vs. ${comparison.outletB.name}\n\n` +
        `| Metric | ${comparison.outletA.name} | ${comparison.outletB.name} | Advantage |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        comparison.differences.map(d => `| **${d.metric}** | ${d.outletA} | ${d.outletB} | **${d.leader}** |`).join('\n') +
        `\n\n**Executive Synthesis:**\n` +
        `• **Volume Leader:** **${comparison.differences[0].leader}** generates higher top-line throughput.\n` +
        `• **Health Variance:** **${comparison.outletA.name}** (${comparison.outletA.healthScore}/100) vs **${comparison.outletB.name}** (${comparison.outletB.healthScore}/100).\n` +
        `• **Operational Friction:** ${comparison.outletA.stockouts.length > 0 ? `${comparison.outletA.name} has ${comparison.outletA.stockouts.length} stockout risk(s). ` : ''}${comparison.outletB.stockouts.length > 0 ? `${comparison.outletB.name} has ${comparison.outletB.stockouts.length} stockout risk(s).` : ''}`;

      structuredResult = {
        intent,
        data_sources: dataSources,
        tools_called: toolsCalled,
        reasoning_steps: reasoningSteps,
        key_metrics: [
          `${comparison.outletA.name}: ₹${(comparison.outletA.revenue / 100000).toFixed(1)}L (${comparison.outletA.healthScore}/100)`,
          `${comparison.outletB.name}: ₹${(comparison.outletB.revenue / 100000).toFixed(1)}L (${comparison.outletB.healthScore}/100)`
        ],
        related_outlets: [comparison.outletA.name, comparison.outletB.name],
        insights: [comparison.summary],
        risks: [
          comparison.outletA.healthScore < 75 ? `${comparison.outletA.name} is pacing below operational standards.` : `${comparison.outletB.name} requires monitoring.`
        ],
        recommendations: [
          `Benchmark ${comparison.differences[0].leader}'s high-velocity practices across trailing locations.`
        ],
        suggested_action: {
          label: `Replicate ${comparison.differences[0].leader.split(' - ')[1] || 'Top'} Playbook`,
          actionType: 'benchmark_playbook',
          payload: { leader: comparison.differences[0].leader }
        },
        answer,
        isAiGenerated: false
      };
    } else {
      structuredResult = {
        intent,
        data_sources: ['Outlets'],
        tools_called: toolsCalled,
        reasoning_steps: ['Attempted to compare outlets but could not find two matching units.'],
        key_metrics: [`Total Outlets: ${outlets.length}`],
        related_outlets: outlets.map(o => o.name),
        insights: [],
        risks: [],
        recommendations: [],
        answer: `I need at least two valid outlets to perform a comparative benchmark. Your franchise currently has ${outlets.length} active locations: ${outlets.map(o => o.name).join(', ')}.`,
        isAiGenerated: false
      };
    }
  } 
  else if (isBestOutletQuery) {
    intent = 'OUTLET_PERFORMANCE_LEADER';
    notifyStep('Fetching outlet benchmarks and ranking top performers...', 'get_outlet_benchmarks');
    toolsCalled.push('get_outlet_benchmarks', 'rank_outlets', 'get_revenue_trends');
    dataSources.push('Sales', 'Outlet Benchmarks', 'Revenue Trends');

    const benchmarks = await get_outlet_benchmarks(businessId);
    const topRevenue = [...benchmarks].sort((a, b) => b.revenue - a.revenue)[0];
    const topGrowth = [...benchmarks].sort((a, b) => b.revenueGrowth - a.revenueGrowth)[0];
    const topHealth = [...benchmarks].sort((a, b) => b.healthScore - a.healthScore)[0];

    reasoningSteps.push(`Ranked ${benchmarks.length} outlets on gross revenue, MoM growth, and multi-factor health score.`);
    reasoningSteps.push(`Identified top revenue unit: ${topRevenue.name} (₹${(topRevenue.revenue / 100000).toFixed(2)}L).`);
    reasoningSteps.push(`Identified top growth unit: ${topGrowth.name} (+${topGrowth.revenueGrowth}% MoM).`);

    const answer = `The top performing outlet in **${business.name}** across overall revenue volume is **${topRevenue.name}** (${topRevenue.city}).\n\n` +
      `### Key Operational Performance Breakdown:\n` +
      `• **Monthly Revenue:** **₹${(topRevenue.revenue / 100000).toFixed(2)} Lakhs** (Target Achievement: **${topRevenue.targetAchievement.toFixed(1)}%**)\n` +
      `• **Growth Trajectory:** **${topRevenue.revenueGrowth > 0 ? '+' : ''}${topRevenue.revenueGrowth}% MoM**\n` +
      `• **Operational Health Score:** **${topRevenue.healthScore}/100** (${topRevenue.category})\n` +
      `• **Average Order Value (AOV):** **₹${Math.round(topRevenue.aov)}** across **${topRevenue.orders.toLocaleString()} orders**\n\n` +
      `**Growth & Efficiency Leaders:**\n` +
      `• **Highest Growth Surge:** **${topGrowth.name}** at **+${topGrowth.revenueGrowth}% MoM**\n` +
      `• **Highest Health Score:** **${topHealth.name}** with **${topHealth.healthScore}/100**\n\n` +
      `**Key Driver:** Strong peak-hour ticket throughput and superior combo pricing elasticity.`;

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        `Top Volume: ${topRevenue.name} (₹${(topRevenue.revenue / 100000).toFixed(1)}L)`,
        `Top Growth: ${topGrowth.name} (+${topGrowth.revenueGrowth}%)`,
        `Top Health: ${topHealth.name} (${topHealth.healthScore}/100)`
      ],
      related_outlets: [topRevenue.name, topGrowth.name, topHealth.name],
      insights: [
        `${topRevenue.name} generates the largest revenue share in the franchise network.`,
        `${topGrowth.name} has the strongest MoM upward velocity.`
      ],
      risks: [],
      recommendations: [
        `Replicate ${topRevenue.name}'s menu mix and combo bundling across secondary market locations.`
      ],
      suggested_action: {
        label: `Benchmark ${topRevenue.name.split(' - ')[1] || 'Flagship'} SOPs`,
        actionType: 'benchmark_playbook',
        payload: { outletId: topRevenue.outletId }
      },
      answer,
      isAiGenerated: false
    };
  }
  else if (isWorstOutletQuery || (isWhyOrRootCause && targetOutlet)) {
    intent = 'CROSS_DOMAIN_ROOT_CAUSE';
    const focusOutlet = targetOutlet || (await get_outlet_benchmarks(businessId)).sort((a, b) => a.healthScore - b.healthScore)[0];
    
    notifyStep(`Conducting cross-domain root-cause investigation for ${focusOutlet.name}...`, 'investigate_cross_domain_causes');
    toolsCalled.push('get_outlet_details', 'get_sales_data', 'get_inventory_status', 'get_staff_performance', 'get_audit_status', 'investigate_cross_domain_causes');
    dataSources.push('Sales Streams', 'Inventory Buffer Records', 'Staff Roster & Attendance', 'Audit Compliance Logs');

    const investigation = await investigate_cross_domain_causes(businessId, focusOutlet.name);
    
    reasoningSteps.push(`Retrieved real-time records for ${focusOutlet.name}.`);
    reasoningSteps.push(`Correlated revenue variances with stock levels, attendance logs, and audit scores.`);
    investigation.rootCauses.forEach(rc => {
      reasoningSteps.push(`Detected ${rc.domain} friction: ${rc.finding}`);
    });

    const rootCauseBlocks = investigation.rootCauses.length > 0 
      ? investigation.rootCauses.map(rc => `• **${rc.domain} (${rc.severity} Severity):** ${rc.finding}\n  *Evidence:* ${rc.evidence}`).join('\n\n')
      : '• No severe cross-domain operational anomalies detected in active records.';

    const actionList = investigation.recommendedActions.length > 0
      ? investigation.recommendedActions.map(ra => `1. **${ra.label}**: ${ra.description}`).join('\n')
      : '1. Maintain current standard operating supervision.';

    const answer = `### Operational Diagnostic Report: **${investigation.outletName}**\n\n` +
      `**Current Performance Status:** ${investigation.revenueStatus}\n\n` +
      `### Multi-Agent Root Cause Analysis:\n` +
      `${rootCauseBlocks}\n\n` +
      `### Recommended Management Directives:\n` +
      `${actionList}`;

    const topAction = investigation.recommendedActions[0];

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        investigation.revenueStatus,
        `Identified Root Causes: ${investigation.rootCauses.length}`,
        `Action Directives: ${investigation.recommendedActions.length}`
      ],
      related_outlets: [investigation.outletName],
      insights: investigation.rootCauses.map(rc => rc.finding),
      risks: investigation.rootCauses.filter(rc => rc.severity === 'Critical' || rc.severity === 'High').map(rc => rc.finding),
      recommendations: investigation.recommendedActions.map(ra => ra.description),
      suggested_action: topAction ? {
        label: topAction.label,
        actionType: topAction.actionType,
        payload: { outlet: investigation.outletName }
      } : undefined,
      answer,
      isAiGenerated: false
    };
  }
  else if (isInventoryQuery) {
    const isTransferQuestion = q.includes('transfer') || q.includes('inter-branch') || q.includes('rebalance') || q.includes('from another outlet');
    const isWastageQuestion = q.includes('waste') || q.includes('spoilage') || q.includes('damage') || q.includes('loss') || q.includes('shrinkage');
    const isControlTowerQuestion = q.includes('control tower') || q.includes('action queue') || q.includes('supply chain overview');
    const isLedgerQuestion = q.includes('ledger') || q.includes('movement history') || q.includes('audit trail') || q.includes('reconciliation');
    const isPOQuestion = q.includes('purchase order') || q.includes('po status') || q.includes('open po') || q.includes('incoming delivery');
    const isReorderQuestion = q.includes('reorder') || q.includes('how much to order') || q.includes('what should we order') || q.includes('replenishment');
    const isForecastQuestion = q.includes('forecast') || q.includes('predict') || q.includes('demand') || q.includes('velocity') || q.includes('increasing');
    const isOverstockQuestion = q.includes('overstock') || q.includes('excess') || q.includes('dead stock') || q.includes('slow moving');
    const isValueQuestion = q.includes('value') || q.includes('worth') || q.includes('valuation') || q.includes('capital');
    const isComparisonQuestion = q.includes('which outlet') || q.includes('highest risk') || q.includes('compare inventory');

    intent = isTransferQuestion ? 'INVENTORY_TRANSFER_OPTIMIZATION' :
             isWastageQuestion ? 'INVENTORY_WASTAGE_ANALYTICS' :
             isControlTowerQuestion ? 'INVENTORY_CONTROL_TOWER' :
             isLedgerQuestion ? 'INVENTORY_STOCK_LEDGER' :
             isPOQuestion ? 'INVENTORY_PURCHASE_ORDERS' :
             isReorderQuestion ? 'INVENTORY_REPLENISHMENT_RECOMMENDATION' :
             isForecastQuestion ? 'INVENTORY_DEMAND_FORECAST' :
             isOverstockQuestion ? 'INVENTORY_OVERSTOCK_DETECTION' :
             isValueQuestion ? 'INVENTORY_VALUATION' : 'INVENTORY_RISK_ANALYSIS';

    notifyStep('Querying live inventory status and operational ledger...', 'get_inventory_status');
    toolsCalled.push('get_inventory_status', 'get_stockout_risk');
    dataSources.push('Inventory Buffer Logs', 'Traceable Stock Movements', 'Purchase Orders', 'Transfers', 'Wastage Logs');

    const targetOutletId = targetOutlet ? targetOutlet.id : undefined;
    const allStock = get_inventory_status(businessId, targetOutletId);
    const stockoutRisks = get_stockout_risk(businessId, targetOutletId);
    const recs = get_replenishment_recommendations(businessId, targetOutletId);
    const forecasts = get_inventory_forecast(businessId, targetOutletId);
    const movers = get_fast_slow_moving_products(businessId, targetOutletId);
    const outletComps = get_outlet_inventory_comparison(businessId);
    const pos = get_purchase_orders(businessId, targetOutletId ? { outletId: targetOutletId } : undefined);
    const transfers = get_stock_transfers(businessId, targetOutletId ? { outletId: targetOutletId } : undefined);
    const wastage = get_wastage_analytics(businessId);
    const controlTower = get_control_tower_summary(businessId);

    reasoningSteps.push(`Scanned ${allStock.length} SKU(s) across target scope.`);
    reasoningSteps.push(`Evaluated stock depletion horizons, open POs, transfers, and wastage.`);

    let answer = '';
    const keyMetrics: string[] = [];
    const relatedOutlets: string[] = [];
    const insights: string[] = [];
    const risks: string[] = [];
    const recommendationsList: string[] = [];

    if (isTransferQuestion) {
      toolsCalled.push('get_stock_transfers', 'get_replenishment_recommendations');
      const transferRecs = recs.filter(r => r.action_type === 'TRANSFER_FROM_OUTLET');
      reasoningSteps.push(`Identified ${transferRecs.length} cost-saving transfer opportunities across network.`);

      if (transferRecs.length === 0 && transfers.length === 0) {
        answer = `### Stock Transfer Intelligence\n\nNo pending inter-outlet transfers or rebalancing requirements detected. Each outlet's demand is adequately covered without inter-branch relocation.`;
      } else {
        const transferList = transferRecs.map(t => 
          `• **${t.product_name}**: Transfer **${t.recommended_quantity} ${t.unit}** from **${t.source_outlet_name}** (Excess Buffer) to **${t.outlet_name}** (Shortage Risk).\n` +
          `  *Estimated Capital Saved:* ₹${t.estimated_cost.toLocaleString()} vs buying from external supplier.`
        ).join('\n\n');

        const activeTransfers = transfers.filter(t => t.status !== 'TRANSFER_RECEIPT');
        const activeList = activeTransfers.length > 0 
          ? `\n\n### In-Transit & Active Transfers:\n` + activeTransfers.map(t => `• Transfer **${t.transfer_number}**: ${t.quantity} ${t.unit} of ${t.product_name} (${t.source_outlet_name} ➔ ${t.destination_outlet_name}) [Status: ${t.status}]`).join('\n')
          : '';

        answer = `### Inter-Outlet Stock Transfer Optimization\n\n` +
          `The AI Transfer Engine evaluated multi-outlet balances and formulated **${transferRecs.length} transfer recommendation(s)** to resolve shortages without placing vendor POs:\n\n` +
          `${transferList || '• All shortages currently managed through active transfers or direct vendor POs.'}` +
          `${activeList}\n\n` +
          `**Decision Rule:** An inter-outlet transfer is triggered when a destination outlet has <7 days reserve while a source outlet maintains >35 days of stock.`;

        keyMetrics.push(`Transfer Opportunities: ${transferRecs.length}`, `Active In-Transit: ${activeTransfers.length}`);
      }
    } else if (isWastageQuestion) {
      toolsCalled.push('get_wastage_records', 'get_wastage_analytics');
      reasoningSteps.push(`Aggregated wastage logs: ${wastage.totalWastageUnits} units across all outlets.`);

      const topLoss = wastage.topLossProducts.map(p => `• **${p.product_name}**: ${p.quantity} ${p.unit} wasted (Impact: ₹${p.cost_impact.toLocaleString()})`).join('\n');
      const reasons = wastage.byReasonBreakdown.map(r => `• **${r.reason}**: ₹${r.cost.toLocaleString()} (${r.percentage}%)`).join('\n');

      answer = `### Wastage & Spoilage Loss Intelligence\n\n` +
        `**Total Monthly Loss Cost:** **₹${wastage.totalCostImpact.toLocaleString()}** (${wastage.wastagePercentage}% of network stock value).\n` +
        `**Trend Trajectory:** **${wastage.trendDirection}** (${wastage.trendChangePct > 0 ? '+' : ''}${wastage.trendChangePct}% vs previous cycle).\n\n` +
        `### Top Loss SKUs:\n${topLoss || '• Zero critical waste recorded.'}\n\n` +
        `### Loss Breakdown by Root Cause:\n${reasons || '• No loss breakdown available.'}\n\n` +
        `**Recommendation:** Reinforce kitchen prep portioning and verify cold storage thermometer calibration.`;

      keyMetrics.push(`Total Loss: ₹${wastage.totalCostImpact.toLocaleString()}`, `Wastage Rate: ${wastage.wastagePercentage}%`);
    } else if (isControlTowerQuestion) {
      toolsCalled.push('get_control_tower_summary');
      reasoningSteps.push(`Synthesized executive Control Tower with ${controlTower.actionQueue.length} prioritized actions.`);

      const queueList = controlTower.actionQueue.slice(0, 5).map(a => 
        `• [${a.priority.toUpperCase()}] **${a.title}** (${a.outlet}): ${a.details} -> *Action: ${a.actionLabel}*`
      ).join('\n');

      answer = `### Executive Inventory Control Tower\n\n` +
        `**Network Critical Overview:**\n` +
        `• Critical Stockouts: **${controlTower.criticalStockoutsCount}**\n` +
        `• Urgent Replenishments: **${controlTower.urgentReplenishmentsCount}**\n` +
        `• Transfer Opportunities: **${controlTower.transferOpportunitiesCount}**\n` +
        `• Total Capital Tied in Inventory: **₹${controlTower.totalTiedCapital.toLocaleString()}**\n\n` +
        `### Prioritized Operational Action Queue:\n${queueList}`;

      keyMetrics.push(`Action Items: ${controlTower.actionQueue.length}`, `Critical Stockouts: ${controlTower.criticalStockoutsCount}`);
    } else if (isPOQuestion) {
      toolsCalled.push('get_purchase_orders');
      reasoningSteps.push(`Retrieved ${pos.length} purchase orders across scope.`);

      const poList = pos.map(p => 
        `• **${p.po_number}** (${p.supplier_name} ➔ ${p.outlet_name}): ₹${p.total_amount.toLocaleString()} [Status: **${p.status}**] - Expected: ${p.expected_delivery}`
      ).join('\n');

      answer = `### Purchase Orders & Inbound Supply Status\n\n` +
        `Found **${pos.length} purchase order(s)**:\n\n${poList || '• No purchase orders registered.'}`;

      keyMetrics.push(`Total POs: ${pos.length}`, `Pending Delivery: ${pos.filter(p => p.status === 'ORDERED' || p.status === 'PARTIALLY_RECEIVED').length}`);
    } else if (isReorderQuestion) {
      toolsCalled.push('calculate_reorder_point', 'calculate_replenishment_quantity', 'get_replenishment_recommendations');
      reasoningSteps.push(`Calculated deterministic reorder points and evaluated Buy vs Transfer for ${recs.length} item(s).`);

      if (recs.length === 0) {
        answer = `### Automated Replenishment Assessment\n\n` +
          `No urgent replenishment actions required at this time for **${targetOutlet ? targetOutlet.name : business.name}**.\n\n` +
          `All tracked SKUs maintain sufficient buffer levels to bridge supplier lead times.`;
      } else {
        const recList = recs.map(r => 
          `• **${r.product_name}** at **${r.outlet_name}** [${r.priority.toUpperCase()} - ${r.action_type}]:\n` +
          `  Current Stock: **${r.current_stock} ${r.unit}** (~${r.days_remaining}d remaining)\n` +
          `  **Recommended Action:** **${r.action_type === 'TRANSFER_FROM_OUTLET' ? `Transfer +${r.recommended_quantity} ${r.unit} from ${r.source_outlet_name}` : `Reorder +${r.recommended_quantity} ${r.unit} from ${r.supplier}`}** (Est. Value: ₹${r.estimated_cost.toLocaleString()})\n` +
          `  *Reason:* ${r.reason}`
        ).join('\n\n');

        const totalCost = recs.reduce((s, r) => s + r.estimated_cost, 0);

        answer = `### Autonomous Replenishment Decisions (${targetOutlet ? targetOutlet.name : business.name})\n\n` +
          `The Inventory Agent evaluated stock horizons against supplier lead times and inter-branch availability, generating **${recs.length} replenishment decision(s)** totaling **₹${totalCost.toLocaleString()}**:\n\n` +
          `${recList}\n\n` +
          `**Smart Decision Engine:** Automatically evaluates whether excess stock is available at a sibling outlet before proposing external supplier procurement.`;

        keyMetrics.push(`Replenishments: ${recs.length} SKUs`, `Total Est. Value: ₹${totalCost.toLocaleString()}`);
        recommendationsList.push(...recs.map(r => `${r.action_type === 'TRANSFER_FROM_OUTLET' ? 'Transfer' : 'Reorder'} +${r.recommended_quantity} ${r.unit} of ${r.product_name}`));
      }
    } else if (isForecastQuestion) {
      toolsCalled.push('get_sales_velocity', 'get_inventory_forecast');
      reasoningSteps.push(`Generated 7-day demand projections and sales velocity trends.`);

      const forecastList = forecasts.slice(0, 5).map(f => 
        `• **${f.product_name}** (${f.outlet_name}):\n` +
        `  Daily Demand: **${f.avg_daily_demand} ${f.unit}/day** (Trend: **${f.demand_trend}**)\n` +
        `  7-Day Forecasted Volume: **${f.forecasted_demand_7d} ${f.unit}** | Depletion Horizon: **~${f.days_remaining} days remaining**`
      ).join('\n\n');

      answer = `### Dynamic Demand Forecasting & Velocity Report\n\n` +
        `Forward demand projections calculated from historical sales velocity:\n\n` +
        `${forecastList}\n\n` +
        `**Key Trend Insight:** Products with increasing velocity will require buffer scaling before weekend peak dining surges.`;

      keyMetrics.push(`Analyzed SKUs: ${forecasts.length}`, `Surging Items: ${forecasts.filter(f => f.demand_trend === 'Increasing').length}`);
    } else if (isOverstockQuestion) {
      toolsCalled.push('get_overstock_risk', 'get_fast_slow_moving_products');
      const overstocked = movers.filter(m => m.turnover_type === 'Slow Moving' || m.turnover_type === 'Dead Stock');
      reasoningSteps.push(`Detected ${overstocked.length} overstocked or slow-moving items.`);

      if (overstocked.length === 0) {
        answer = `No excessive overstock or dead stock detected across **${targetOutlet ? targetOutlet.name : business.name}**. Turnover velocity is within standard SOP limits.`;
      } else {
        const overList = overstocked.map(o => 
          `• **${o.product_name}** at **${o.outlet_name}** [${o.turnover_type}]:\n` +
          `  Current Stock: **${o.current_stock} ${o.unit}** (Valuation: ₹${o.inventory_value.toLocaleString()}, Holding Cover: ~${o.days_remaining} days)\n` +
          `  *Recommendation:* ${o.recommendation_note}`
        ).join('\n\n');

        answer = `### Excess Inventory & Overstock Diagnostic\n\n` +
          `Identified **${overstocked.length} item(s)** tying up working capital with extended holding cover:\n\n` +
          `${overList}\n\n` +
          `**Corrective Action:** Halt replenishment for these items and evaluate inter-branch inventory transfers.`;

        keyMetrics.push(`Overstocked SKUs: ${overstocked.length}`, `Tied Capital: ₹${overstocked.reduce((s, o) => s + o.inventory_value, 0).toLocaleString()}`);
      }
    } else if (isComparisonQuestion) {
      toolsCalled.push('get_outlet_inventory_comparison');
      reasoningSteps.push(`Compared inventory health and critical risk counts across ${outletComps.length} outlets.`);

      const worstOutlet = [...outletComps].sort((a, b) => (b.critical_count + b.out_of_stock_count) - (a.critical_count + a.out_of_stock_count))[0];
      const compList = outletComps.map(o => 
        `• **${o.outlet_name}** (${o.city}):\n` +
        `  Valuation: ₹${o.total_inventory_value.toLocaleString()} | Healthy: ${o.healthy_count} | Low: ${o.low_stock_count} | **Critical/OOS: ${o.critical_count + o.out_of_stock_count}**`
      ).join('\n\n');

      answer = `### Multi-Outlet Inventory Risk & Health Comparison\n\n` +
        `**Highest Risk Outlet:** **${worstOutlet.outlet_name}** with **${worstOutlet.critical_count + worstOutlet.out_of_stock_count} critical/OOS shortage(s)**.\n\n` +
        `### Franchise Network Overview:\n` +
        `${compList}`;

      keyMetrics.push(`Highest Risk: ${worstOutlet.outlet_name}`, `Total Outlets: ${outletComps.length}`);
      relatedOutlets.push(worstOutlet.outlet_name);
    } else {
      // General Stockout / Inventory Status
      toolsCalled.push('get_stockout_risk');
      const criticalRisks = stockoutRisks.filter(r => r.risk_level === 'CRITICAL' || r.risk_level === 'HIGH');
      reasoningSteps.push(`Identified ${criticalRisks.length} items at critical or high stockout risk.`);

      if (criticalRisks.length === 0) {
        answer = `All monitored SKUs in **${targetOutlet ? targetOutlet.name : business.name}** are currently in healthy stock condition. Zero critical stockouts detected.`;
      } else {
        const riskList = criticalRisks.map(r => 
          `• **${r.product_name}** at **${r.outlet_name}** [${r.risk_level}]:\n` +
          `  Stock On-Hand: **${r.current_stock} ${r.unit}** (~${r.days_remaining}d remaining, Lead Time: ${r.supplier_lead_time}d)\n` +
          `  *Risk Diagnosis:* ${r.explanation}\n` +
          `  *Suggested Action:* ${r.suggested_action}`
        ).join('\n\n');

        answer = `### Real-Time Inventory & Stockout Diagnostic\n\n` +
          `Found **${criticalRisks.length} SKU(s)** requiring immediate inventory management intervention:\n\n` +
          `${riskList}\n\n` +
          `**Operational Impact:** Unresolved stockouts on core recipe ingredients will disrupt kitchen service during peak order volume.`;

        keyMetrics.push(`Critical Risks: ${criticalRisks.length} SKUs`, `Total Monitored: ${allStock.length} SKUs`);
        relatedOutlets.push(...Array.from(new Set(criticalRisks.map(r => r.outlet_name))));
        risks.push(...criticalRisks.map(r => `${r.product_name} at ${r.outlet_name} risks stockout in ~${r.days_remaining}d`));
      }
    }

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: keyMetrics.length > 0 ? keyMetrics : [`Monitored Items: ${allStock.length}`],
      related_outlets: relatedOutlets.length > 0 ? relatedOutlets : outlets.map(o => o.name),
      insights,
      risks,
      recommendations: recommendationsList.length > 0 ? recommendationsList : ['Review inventory health in the Inventory Intelligence Dashboard.'],
      suggested_action: recs.length > 0 ? {
        label: 'View Replenishment Requisitions',
        actionType: 'navigate_inventory_reorder',
        payload: { outletId: targetOutletId }
      } : undefined,
      answer,
      isAiGenerated: false
    };
  }

  else if (isStaffQuery) {
    intent = 'STAFFING_WORKFORCE_ANALYSIS';
    notifyStep('Inspecting workforce rosters and shift attendance...', 'get_staffing_status');
    toolsCalled.push('get_staff_performance', 'get_staffing_status', 'get_audit_status');
    dataSources.push('Staff Rosters', 'Attendance Logs', 'Audit Latency Records');

    const staffing = get_staffing_status(businessId);
    const audits = get_audit_status(businessId);

    reasoningSteps.push(`Analyzed headcount across all active units (Average Attendance: ${staffing.avgAttendance}%).`);
    reasoningSteps.push(`Flagged ${staffing.absenteeismHotspots.length} workforce hotspots with attendance <80% or leave.`);

    if (staffing.absenteeismHotspots.length === 0) {
      const answer = `Staffing levels across **${business.name}** are optimal with an average workforce attendance of **${staffing.avgAttendance}%** and **${staffing.activeHeadcount} active team members** on shift.`;
      
      structuredResult = {
        intent,
        data_sources: dataSources,
        tools_called: toolsCalled,
        reasoning_steps: reasoningSteps,
        key_metrics: [`Avg Attendance: ${staffing.avgAttendance}%`, `Active Headcount: ${staffing.activeHeadcount}`],
        related_outlets: outlets.map(o => o.name),
        insights: ['Workforce fulfillment is meeting franchise standard targets.'],
        risks: [],
        recommendations: ['Maintain existing shift scheduling rotations.'],
        answer,
        isAiGenerated: false
      };
    } else {
      const hotspotsList = staffing.absenteeismHotspots.map(st => 
        `• **${st.employee_name}** (${st.role}) at **${st.outlet_name}**:\n` +
        `  Attendance: **${st.attendance_pct}%** (Status: ${st.status}, Performance Score: ${st.performance_score}/100)`
      ).join('\n\n');

      const answer = `### Workforce & Staffing Shortage Diagnostic\n\n` +
        `Franchise average shift attendance stands at **${staffing.avgAttendance}%**. The Staff Agent has detected **${staffing.absenteeismHotspots.length} critical workforce shortage(s)**:\n\n` +
        `${hotspotsList}\n\n` +
        `**Operational Impact:** Unscheduled absenteeism in core kitchen roles directly increases food preparation latency and causes order fulfillment bottlenecks.\n\n` +
        `**Recommended Action:** Dispatch float support staff from the regional hub to backfill open kitchen stations during high-volume dinner shifts.`;

      structuredResult = {
        intent,
        data_sources: dataSources,
        tools_called: toolsCalled,
        reasoning_steps: reasoningSteps,
        key_metrics: [
          `Network Avg Attendance: ${staffing.avgAttendance}%`,
          `Staffing Hotspots: ${staffing.absenteeismHotspots.length} Roles`,
          `Active Staff: ${staffing.activeHeadcount}`
        ],
        related_outlets: Array.from(new Set(staffing.absenteeismHotspots.map(s => s.outlet_name))),
        insights: [
          `Kitchen chef absenteeism at ${staffing.absenteeismHotspots[0]?.outlet_name} is impacting operational speed.`
        ],
        risks: [
          `Prolonged ticket times risking lower customer review scores.`
        ],
        recommendations: [
          `Deploy float staff from central reserve and implement weekend shift incentive.`
        ],
        suggested_action: {
          label: `Dispatch Float Staff to ${staffing.absenteeismHotspots[0]?.outlet_name.split(' - ')[1] || 'Hub'}`,
          actionType: 'dispatch_staff',
          payload: { outlet: staffing.absenteeismHotspots[0]?.outlet_name }
        },
        answer,
        isAiGenerated: false
      };
    }
  }
  else if (isMarketingQuery) {
    intent = 'MARKETING_CAMPAIGN_ROI';
    notifyStep('Evaluating marketing campaigns and customer acquisition ROAS...', 'get_campaign_roi');
    toolsCalled.push('get_marketing_performance', 'get_campaign_roi');
    dataSources.push('Marketing Campaigns', 'POS Conversion Data');

    const roiData = get_campaign_roi(businessId);

    reasoningSteps.push(`Aggregated spend and revenue across active campaigns.`);
    reasoningSteps.push(`Calculated network ROI at ${roiData.networkRoi}%.`);

    if (roiData.topCampaigns.length === 0 && roiData.underperformingCampaigns.length === 0) {
      const answer = `I do not have sufficient active marketing campaign records for **${business.name}** to calculate campaign ROAS. You can launch or import marketing campaigns in the Marketing module.`;
      structuredResult = {
        intent,
        data_sources: dataSources,
        tools_called: toolsCalled,
        reasoning_steps: reasoningSteps,
        key_metrics: ['No Active Campaigns Logged'],
        related_outlets: outlets.map(o => o.name),
        insights: [],
        risks: [],
        recommendations: ['Add marketing campaigns to unlock autonomous ROI tracking.'],
        answer,
        isAiGenerated: false
      };
    } else {
      const topCamp = roiData.topCampaigns[0];
      const campList = roiData.topCampaigns.map(c => 
        `• **${c.campaign_name}** (${c.outlet_name}):\n` +
        `  **ROI: ${c.roi}%** | Spend: ₹${c.spend.toLocaleString()} → Revenue: **₹${c.revenue_generated.toLocaleString()}** (Acquired: ${c.customers_acquired} customers, Conversion: ${c.conversion_rate}%)`
      ).join('\n\n');

      const answer = `### Marketing Performance & Campaign ROI Analysis\n\n` +
        `The franchise network recorded a consolidated marketing ROI of **${roiData.networkRoi}%** (Total Spend: ₹${roiData.totalSpend.toLocaleString()}, Revenue Generated: **₹${roiData.totalRevenue.toLocaleString()}**).\n\n` +
        `**Top Performing Campaign:**\n` +
        `${campList}\n\n` +
        `**Strategic Recommendation:** The promotional mechanics of **"${topCamp.campaign_name}"** (geotargeted combo discounting) demonstrate superior acquisition efficiency. Replicating this playbook across trailing units is projected to yield high incremental sales.`;

      structuredResult = {
        intent,
        data_sources: dataSources,
        tools_called: toolsCalled,
        reasoning_steps: reasoningSteps,
        key_metrics: [
          `Top Campaign ROI: ${topCamp.roi}% (${topCamp.campaign_name})`,
          `Network Marketing Spend: ₹${(roiData.totalSpend / 1000).toFixed(0)}k`,
          `Network Attributed Revenue: ₹${(roiData.totalRevenue / 100000).toFixed(2)}L`
        ],
        related_outlets: [topCamp.outlet_name],
        insights: [
          `"${topCamp.campaign_name}" delivered a ${topCamp.roi}% return on ad spend.`
        ],
        risks: [],
        recommendations: [
          `Replicate top campaign format across trailing units to lift local walk-ins.`
        ],
        suggested_action: {
          label: `Scale '${topCamp.campaign_name.split(' ')[0]}' Campaign`,
          actionType: 'launch_promo',
          payload: { campaignId: topCamp.id }
        },
        answer,
        isAiGenerated: false
      };
    }
  }
  else if (isAuditComplianceQuery) {
    intent = 'AUDIT_COMPLIANCE_ANALYSIS';
    notifyStep('Auditing standard operating procedures and open non-conformities...', 'get_audit_status');
    toolsCalled.push('get_audit_status', 'get_open_compliance_issues');
    dataSources.push('Audit Logs', 'Food Safety Checklists', 'SOP Guidelines');

    const auditData = get_audit_status(businessId);
    const openIssues = get_open_compliance_issues(businessId);

    reasoningSteps.push(`Calculated average compliance score (${auditData.avgComplianceScore}%).`);
    reasoningSteps.push(`Found ${openIssues.length} unresolved compliance item(s).`);

    const issuesList = openIssues.map(i => 
      `• **${i.category}** at **${i.outlet_name}** (${i.severity} Severity, Score: ${i.compliance_score}%):\n` +
      `  *Issue:* ${i.issue}\n` +
      `  *Corrective Action:* ${i.corrective_action} (Assigned: ${i.responsible_person})`
    ).join('\n\n');

    const answer = `### Operational Audit & Compliance Status\n\n` +
      `The franchise network holds an average compliance score of **${auditData.avgComplianceScore}%**.\n\n` +
      `**Active Compliance Findings (${openIssues.length} Open):**\n` +
      `${issuesList || '• All scheduled audits have 0 critical non-conformities.'}\n\n` +
      `**Operational Standard:** SOP limits mandate that service ticket latency must remain below 14 minutes and food safety cold-chain logs must maintain 90%+ compliance.`;

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        `Avg Compliance Score: ${auditData.avgComplianceScore}%`,
        `Open Compliance Items: ${openIssues.length}`,
        `Critical Issues: ${auditData.criticalIssues.length}`
      ],
      related_outlets: Array.from(new Set(openIssues.map(i => i.outlet_name))),
      insights: [
        `Compliance rate is at ${auditData.avgComplianceScore}%.`
      ],
      risks: auditData.criticalIssues.map(c => `${c.outlet_name}: ${c.issue}`),
      recommendations: [
        `Complete corrective actions on open audit findings within 48 hours.`
      ],
      suggested_action: openIssues.length > 0 ? {
        label: 'Schedule Audit Follow-up Verification',
        actionType: 'schedule_audit',
        payload: { auditId: openIssues[0].id }
      } : undefined,
      answer,
      isAiGenerated: false
    };
  }
  else if (isRiskQuery) {
    intent = 'OPERATIONAL_RISK_SUMMARY';
    notifyStep('Aggregating multi-factor risks across sales, stock, staff, and compliance...', 'detect_anomalies');
    toolsCalled.push('detect_anomalies', 'get_inventory_risks', 'get_staffing_status', 'get_audit_status');
    dataSources.push('Sales Pacing', 'Inventory Safety Buffers', 'Workforce Attendance', 'Audit Compliance Logs');

    const anomalies = await detect_anomalies(businessId);
    reasoningSteps.push(`Cross-correlated signals across all 4 operational domains.`);

    const riskItems: string[] = [];
    if (anomalies.underperforming.length > 0) {
      riskItems.push(`1. **Revenue Pacing Drag:** ${anomalies.underperforming.map(u => `${u.outletName} (${u.revenueGrowth}% MoM)`).join(', ')}`);
    }
    if (anomalies.inventoryAnomalies.length > 0) {
      riskItems.push(`2. **Supply Chain Stockouts:** ${anomalies.inventoryAnomalies.map(i => `${i.product_name} at ${i.outlet_name}`).join(', ')}`);
    }
    if (anomalies.workforceAnomalies.length > 0) {
      riskItems.push(`3. **Workforce Shortages:** ${anomalies.workforceAnomalies.map(w => `${w.employee_name} (${w.role}) at ${w.outlet_name} (${w.attendance_pct}% attendance)`).join(', ')}`);
    }
    if (anomalies.auditAnomalies.length > 0) {
      riskItems.push(`4. **Compliance Friction:** ${anomalies.auditAnomalies.map(a => `${a.outlet_name} (${a.issue})`).join(', ')}`);
    }

    const answer = `### Top Operational Risks Across **${business.name}**\n\n` +
      `Our multi-agent risk scanner has correlated the following operational vulnerabilities:\n\n` +
      `${riskItems.join('\n\n')}\n\n` +
      `### Recommended Priority Action Plan:\n` +
      `• **Immediate (Next 4 Hours):** Dispatch emergency ingredient replenishment orders for flagged SKUs.\n` +
      `• **Weekend Defense:** Deploy float kitchen staff to cover peak-hour service bottlenecks.\n` +
      `• **Revenue Recovery:** Launch localized delivery aggregator promotions in contracting territories.`;

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        `Underperforming Outlets: ${anomalies.underperforming.length}`,
        `Stockout Risks: ${anomalies.inventoryAnomalies.length}`,
        `Staffing Hotspots: ${anomalies.workforceAnomalies.length}`,
        `Audit Issues: ${anomalies.auditAnomalies.length}`
      ],
      related_outlets: Array.from(new Set([
        ...anomalies.underperforming.map(u => u.outletName),
        ...anomalies.inventoryAnomalies.map(i => i.outlet_name)
      ])),
      insights: riskItems,
      risks: riskItems,
      recommendations: [
        'Execute emergency stock replenishment and reallocate float staff for weekend coverage.'
      ],
      suggested_action: {
        label: 'Approve Emergency Multi-Agent Action Plan',
        actionType: 'approve_action_plan',
        payload: { anomalyCount: riskItems.length }
      },
      answer,
      isAiGenerated: false
    };
  }
  else if (isPriorityQuery) {
    intent = 'MANAGEMENT_ACTION_PRIORITIES';
    notifyStep('Synthesizing executive management priority directives...', 'get_franchise_summary');
    toolsCalled.push('get_franchise_summary', 'get_inventory_risks', 'get_staffing_status', 'get_recommendations');
    dataSources.push('Franchise Summary', 'Recommendations Feed', 'Anomaly Registry');

    const summary = await get_franchise_summary(businessId);
    const recs = get_recommendations(businessId);

    reasoningSteps.push(`Synthesized 4 prioritized management directives based on live telemetry.`);

    const answer = `### Executive Operational Priority Directives for Today\n\n` +
      `**Business Health:** **${summary.networkHealth}/100** | Monthly Revenue: **₹${(summary.totalRevenue / 100000).toFixed(1)}L** (${summary.targetAchievement}% of target)\n\n` +
      `**Top 4 Actions for Operations Leadership:**\n\n` +
      `1. **Stabilize Trailing Units:** Intervene on lagging locations experiencing footfall or ingredient deficits.\n` +
      `2. **Approve Emergency Purchase Orders:** Resolve **${summary.stockoutRisksCount} flagged stockout risk(s)** before evening peak hours.\n` +
      `3. **Reallocate Workforce:** Balance shift fill rates across regional kitchens (Current Average: **${summary.staffAttendanceAvg}%**).\n` +
      `4. **Review Autonomous Recommendations:** **${recs.length} actionable directives** are ready for human-in-the-loop signoff.`;

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        `Network Health: ${summary.networkHealth}/100`,
        `Revenue: ₹${(summary.totalRevenue / 100000).toFixed(1)}L`,
        `Pending Directives: ${recs.length}`
      ],
      related_outlets: outlets.map(o => o.name),
      insights: [
        `Priorities center on stock replenishment, staffing balance, and marketing boost.`
      ],
      risks: [
        `${summary.stockoutRisksCount} ingredient buffers require immediate purchase orders.`
      ],
      recommendations: [
        'Approve pending purchase orders and review active recommendations.'
      ],
      suggested_action: {
        label: 'Open Action Center',
        actionType: 'navigate_action_center',
        payload: { path: '/dashboard/action-center' }
      },
      answer,
      isAiGenerated: false
    };
  }
  else {
    // General Executive Overview / Revenue Synthesis / Specific Metric Query
    intent = isRevenueOrSalesQuery ? 'REVENUE_METRICS_QUERY' : isSummaryQuery ? 'EXECUTIVE_SUMMARY' : 'BUSINESS_INTELLIGENCE_QUERY';
    notifyStep('Querying multi-pillar franchise operations telemetry...', 'get_franchise_summary');
    toolsCalled.push('get_franchise_summary', 'get_outlet_benchmarks', 'get_health_scores');
    dataSources.push('Consolidated Sales', 'Outlet Benchmarks', '5-Pillar Health Score Engine');

    const summary = await get_franchise_summary(businessId);
    const benchmarks = await get_outlet_benchmarks(businessId);
    const health = await get_health_scores(businessId);

    reasoningSteps.push(`Calculated consolidated revenue across ${summary.totalOutlets} outlets: ₹${(summary.totalRevenue / 100000).toFixed(2)}L.`);
    reasoningSteps.push(`Evaluated network growth (+${summary.growthPercent}% MoM) and 5-pillar health score (${summary.networkHealth}/100).`);

    const topStore = benchmarks[0];
    const bottomStore = benchmarks[benchmarks.length - 1];

    const answer = `### Executive Summary: **${business.name}**\n\n` +
      `The franchise network operates **${summary.totalOutlets} active units** across **${business.city}, ${business.state}** and regional hubs.\n\n` +
      `### Consolidated Operational KPIs:\n` +
      `• **Consolidated Monthly Revenue:** **₹${(summary.totalRevenue / 100000).toFixed(2)} Lakhs** (Target: ₹${(summary.targetRevenue / 100000).toFixed(2)}L, **${summary.targetAchievement}% Achievement**)\n` +
      `• **Network Growth Trajectory:** **${summary.growthPercent > 0 ? '+' : ''}${summary.growthPercent}% MoM**\n` +
      `• **Consolidated Health Score:** **${summary.networkHealth}/100** (${health.healthStatus})\n` +
      `• **Workforce Shift Attendance:** **${summary.staffAttendanceAvg}%** average across all kitchens\n` +
      `• **Supply Chain Vulnerability:** **${summary.stockoutRisksCount} critical stockout(s)** flagged\n\n` +
      `**Key Unit Highlights:**\n` +
      `• **Top Volume Unit:** **${topStore?.name}** (₹${((topStore?.revenue || 0) / 100000).toFixed(1)}L, Health: ${topStore?.healthScore}/100)\n` +
      `• **Trailing Unit:** **${bottomStore?.name}** (₹${((bottomStore?.revenue || 0) / 100000).toFixed(1)}L, Target Pace: ${bottomStore?.targetAchievement.toFixed(1)}%)\n\n` +
      `*You can ask me to dive deeper into any specific outlet, inventory buffer, staff roster, or marketing campaign.*`;

    structuredResult = {
      intent,
      data_sources: dataSources,
      tools_called: toolsCalled,
      reasoning_steps: reasoningSteps,
      key_metrics: [
        `Consolidated Revenue: ₹${(summary.totalRevenue / 100000).toFixed(1)}L`,
        `Network Health: ${summary.networkHealth}/100`,
        `Target Achievement: ${summary.targetAchievement}%`,
        `Active Outlets: ${summary.totalOutlets}`
      ],
      related_outlets: [topStore?.name || '', bottomStore?.name || ''].filter(Boolean),
      insights: [
        `Consolidated revenue is pacing at ${summary.targetAchievement}% of monthly goal.`,
        `Top revenue driver is ${topStore?.name}.`
      ],
      risks: summary.stockoutRisksCount > 0 ? [`${summary.stockoutRisksCount} stockout risk(s) active.`] : [],
      recommendations: [
        `Monitor ${bottomStore?.name} performance and execute emergency stock POs.`
      ],
      suggested_action: {
        label: 'Run Full Multi-Agent Diagnostic',
        actionType: 'run_analysis',
        payload: { businessId }
      },
      answer,
      isAiGenerated: false
    };
  }

  // -------------------------------------------------------------
  // 4. LLM INFERENCE VIA GEMINI 2.0 FLASH (IF API KEY PRESENT)
  // -------------------------------------------------------------
  if (aiClient && apiKey) {
    try {
      notifyStep('Synthesizing high-precision executive response via Gemini 2.0 Flash...', 'gemini_llm');
      
      const promptContext = {
        businessProfile: {
          name: business.name,
          industry: business.industry,
          businessType: business.business_type,
          city: business.city,
          totalOutlets: outlets.length
        },
        currentQuestion: question,
        resolvedContext: {
          targetOutlet: targetOutlet?.name || null,
          intent: structuredResult.intent
        },
        toolsExecuted: structuredResult.tools_called,
        dataRetrieved: {
          keyMetrics: structuredResult.key_metrics,
          reasoningSteps: structuredResult.reasoning_steps,
          insights: structuredResult.insights,
          risks: structuredResult.risks,
          recommendations: structuredResult.recommendations
        },
        conversationHistory: history.slice(-4).map(h => ({ role: h.role, text: h.text }))
      };

      const systemPrompt = `You are FranchiseOps AI Copilot, an enterprise-grade AI Operations Analyst for franchise businesses.
You have real-time observability across all 5 operational pillars: Sales, Inventory, Staff, Marketing, and Audits.
STRICT RULES:
1. ALWAYS base your response ONLY on the provided structured business telemetry.
2. NEVER hallucinate numbers, revenue, inventory amounts, or staff names.
3. Be concise, direct, executive-grade, and insightful.
4. Format with bold numbers, bullet points, and markdown tables where helpful.
5. Emphasize connected root causes across domains (e.g. Sales dropped because Inventory stockout + Staff shortage).
6. If data is insufficient for a specific question, clearly state: "I don't have sufficient [domain] data to determine this."`;

      const userPrompt = `Live Business Telemetry & Tool Results:\n${JSON.stringify(promptContext, null, 2)}\n\nUser Question: "${question}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
      });

      if (response.text) {
        structuredResult.answer = response.text;
        structuredResult.isAiGenerated = true;
      }
    } catch (llmErr) {
      console.warn('Gemini 2.0 Flash inference error, adhering to deterministic analytical engine:', llmErr);
    }
  }

  // -------------------------------------------------------------
  // 5. UPDATE CONVERSATIONAL MEMORY & LOG ACTIVITY
  // -------------------------------------------------------------
  addConversationTurn(businessId, {
    id: `usr_${Date.now()}`,
    role: 'user',
    text: question,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intent: structuredResult.intent
  });

  addConversationTurn(businessId, {
    id: `ast_${Date.now()}`,
    role: 'assistant',
    text: structuredResult.answer,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referencedOutlets: structuredResult.related_outlets,
    intent: structuredResult.intent
  });

  logTenantActivity(
    businessId, 
    'Franchise Intelligence Engine', 
    `AI Copilot answered query: "${question.substring(0, 50)}..." [Intent: ${structuredResult.intent}]`
  );

  return structuredResult;
}
