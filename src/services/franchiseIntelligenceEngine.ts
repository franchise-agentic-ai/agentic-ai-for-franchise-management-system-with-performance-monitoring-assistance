import { 
  CrossDomainInsight, 
  Recommendation, 
  AgentRunLog,
  Outlet,
  SalesRecord,
  InventoryRecord,
  StaffRecord,
  MarketingRecord,
  AuditRecord 
} from '../types';
import { 
  getTenantOutlets, 
  getTenantSales, 
  getTenantInventory, 
  getTenantStaff, 
  getTenantMarketing, 
  getTenantAudits, 
  logTenantActivity, 
  getActiveBusiness 
} from './tenantService';
import { GoogleGenAI } from '@google/genai';

const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) 
  || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) 
  || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

const INSIGHTS_STORAGE_KEY_PREFIX = 'franchiseops_insights_';
const RECOMMENDATIONS_STORAGE_KEY_PREFIX = 'franchiseops_recs_';

/**
 * Get stored cross-domain AI insights for business
 */
export function getTenantInsights(businessId: string): CrossDomainInsight[] {
  try {
    const raw = localStorage.getItem(INSIGHTS_STORAGE_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveTenantInsights(businessId: string, insights: CrossDomainInsight[]) {
  localStorage.setItem(INSIGHTS_STORAGE_KEY_PREFIX + businessId, JSON.stringify(insights));
  window.dispatchEvent(new CustomEvent('franchiseops_insights_updated', { detail: { businessId } }));
}

/**
 * Get stored recommendations for business
 */
export function getTenantRecommendations(businessId: string): Recommendation[] {
  try {
    const raw = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveTenantRecommendations(businessId: string, recs: Recommendation[]) {
  localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY_PREFIX + businessId, JSON.stringify(recs));
  window.dispatchEvent(new CustomEvent('franchiseops_recs_updated', { detail: { businessId } }));
}

export function updateRecommendationStatus(businessId: string, recId: string, status: Recommendation['status']): Recommendation[] {
  const recs = getTenantRecommendations(businessId);
  const updated = recs.map(r => r.id === recId ? { ...r, status, updated_at: new Date().toISOString() } : r);
  saveTenantRecommendations(businessId, updated);
  logTenantActivity(businessId, 'Franchise Intelligence Engine', `Updated recommendation '${recs.find(r => r.id === recId)?.title}' to '${status}'`);
  return updated;
}

/**
 * Master "Analyze My Business" Orchestrator
 * Executes multi-agent scans across sales, inventory, staff, marketing, and audits
 */
export async function runFullBusinessAnalysis(businessId: string): Promise<{
  insights: CrossDomainInsight[];
  recommendations: Recommendation[];
  logs: AgentRunLog[];
}> {
  const outlets = getTenantOutlets(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const marketing = getTenantMarketing(businessId);
  const audits = getTenantAudits(businessId);

  const generatedInsights: CrossDomainInsight[] = [];
  const generatedRecs: Recommendation[] = [];

  // 1. OUTLET PERFORMANCE AGENT SCAN
  const underperformingOutlets = sales.filter(s => s.target_revenue > 0 && (s.revenue / s.target_revenue) < 0.85);
  
  // 2. INVENTORY AGENT SCAN
  const stockoutRisks = inventory.filter(i => i.status === 'Stockout Risk' || i.current_stock < i.min_stock);

  // 3. STAFF AGENT SCAN
  const lowAttendanceStaff = staff.filter(st => st.attendance_pct < 80);

  // 4. MARKETING AGENT SCAN
  const highRoiCampaigns = marketing.filter(m => m.roi > 300);

  // 5. AUDIT AGENT SCAN
  const criticalAuditIssues = audits.filter(a => a.severity === 'Critical' || a.severity === 'High' || a.compliance_score < 75);

  // SYNTHESIS & CROSS-DOMAIN CORRELATION
  for (const outlet of outlets) {
    const outSale = sales.find(s => s.outlet_id === outlet.id);
    const outStockout = stockoutRisks.find(i => i.outlet_id === outlet.id);
    const outStaff = lowAttendanceStaff.find(st => st.outlet_id === outlet.id);
    const outAudit = criticalAuditIssues.find(a => a.outlet_id === outlet.id);

    // Correlate: Sales Drop + Stockout
    if (outSale && (outSale.revenue / outSale.target_revenue) < 0.85 && outStockout) {
      const insightId = `ins_cor_${Date.now()}_${outlet.id}`;
      const insight: CrossDomainInsight = {
        id: insightId,
        business_id: businessId,
        title: `Supply-Driven Revenue Slump at ${outlet.name}`,
        headline: `Sales trailing target by ${Math.round((1 - (outSale.revenue / outSale.target_revenue)) * 100)}% linked to ${outStockout.product_name} shortages`,
        finding: `${outlet.name} missed its monthly target (Actual: ₹${(outSale.revenue / 100000).toFixed(1)}L vs Target: ₹${(outSale.target_revenue / 100000).toFixed(1)}L). The Inventory Agent detects acute stockout risk for '${outStockout.product_name}' (Current: ${outStockout.current_stock} ${outStockout.unit}, Min: ${outStockout.min_stock} ${outStockout.unit}), which accounts for core recipe volume.`,
        primary_agent: 'Franchise Intelligence Engine',
        correlated_agents: ['Outlet Performance Agent', 'Inventory Agent'],
        evidence: [
          `Target achievement at ${Math.round((outSale.revenue / outSale.target_revenue) * 100)}%`,
          `Stock level for ${outStockout.product_name} at ${outStockout.current_stock} ${outStockout.unit} (Below minimum safety buffer)`,
          `Last restocked ${outStockout.last_restocked} from supplier ${outStockout.supplier}`
        ],
        possible_causes: [
          'Supplier delivery delay on high-velocity ingredients',
          'Inaccurate consumption forecasting during peak weekend surge'
        ],
        business_impact: `Estimated revenue drag of ₹${Math.round((outSale.target_revenue - outSale.revenue) / 100000)}L this period.`,
        recommendation: `Initiate emergency replenishment order with ${outStockout.supplier} and establish automatic re-order trigger at ${Math.round(outStockout.min_stock * 1.5)} ${outStockout.unit}.`,
        priority: 'Critical',
        confidence: 0.92,
        related_outlet_id: outlet.id,
        related_outlet_name: outlet.name,
        created_at: new Date().toISOString(),
        status: 'Active',
      };
      generatedInsights.push(insight);

      generatedRecs.push({
        id: `rec_${Date.now()}_${outlet.id}`,
        title: `Emergency Supplier Restock & Safety Buffer Expansion (${outlet.name})`,
        description: `Dispatch expedited shipment of ${outStockout.product_name} to ${outlet.name} and increase safety buffer to 1.5x minimum.`,
        reason: `Eliminate product stockouts causing estimated ₹${Math.round((outSale.target_revenue - outSale.revenue) / 100000)}L monthly sales deficit.`,
        supporting_metrics: [
          `Current Stock: ${outStockout.current_stock} ${outStockout.unit}`,
          `Target Achievement: ${Math.round((outSale.revenue / outSale.target_revenue) * 100)}%`
        ],
        related_outlet_id: outlet.id,
        related_agent: 'Inventory Agent',
        priority: 'Critical',
        status: 'New',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Correlate: Service Latency / Audit Friction + Staffing Shortage
    if (outStaff && (outAudit || (outSale && outSale.customers < 3000))) {
      const insightId = `ins_staff_${Date.now()}_${outlet.id}`;
      const insight: CrossDomainInsight = {
        id: insightId,
        business_id: businessId,
        title: `Workforce Strain Causing Operational Delays at ${outlet.name}`,
        headline: `Staff attendance down to ${outStaff.attendance_pct}% causing service bottlenecks`,
        finding: `Workforce attendance dropped below operational thresholds (${outStaff.attendance_pct}%), directly correlating with ${outAudit ? outAudit.issue : 'slowing customer turnover'}.`,
        primary_agent: 'Staff Agent',
        correlated_agents: ['Staff Agent', 'Audit Agent'],
        evidence: [
          `Attendance rate: ${outStaff.attendance_pct}% for key roles (${outStaff.role})`,
          outAudit ? `Audit Compliance Score: ${outAudit.compliance_score}% (${outAudit.issue})` : 'Customer volume dropped below seasonal benchmark'
        ],
        possible_causes: [
          'Unscheduled absenteeism in primary kitchen/floor staff',
          'Lack of cross-trained backup staff for high-volume shifts'
        ],
        business_impact: 'Prolonged order fulfillment times reducing customer repeat visit rates.',
        recommendation: `Deploy float operational staff from nearest hub and initiate weekend incentive stipend.`,
        priority: 'High',
        confidence: 0.88,
        related_outlet_id: outlet.id,
        related_outlet_name: outlet.name,
        created_at: new Date().toISOString(),
        status: 'Active',
      };
      generatedInsights.push(insight);

      generatedRecs.push({
        id: `rec_stf_${Date.now()}_${outlet.id}`,
        title: `Float Staff Allocation & Shift Optimization (${outlet.name})`,
        description: `Transfer 2 trained support staff to ${outlet.name} for peak dinner shifts to restore service speed under SOP limits.`,
        reason: `Resolve attendance deficit (${outStaff.attendance_pct}%) causing kitchen fulfillment latency.`,
        supporting_metrics: [
          `Staff Attendance: ${outStaff.attendance_pct}%`,
          `Hours Worked: ${outStaff.hours_worked} hrs`
        ],
        related_outlet_id: outlet.id,
        related_agent: 'Staff Agent',
        priority: 'High',
        status: 'New',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Correlate: High ROI Marketing Campaign Opportunity
  if (highRoiCampaigns.length > 0) {
    const topCamp = highRoiCampaigns[0];
    const insight: CrossDomainInsight = {
      id: `ins_mkt_${Date.now()}`,
      business_id: businessId,
      title: `High-ROI Campaign Playbook: '${topCamp.campaign_name}'`,
      headline: `Campaign recorded ${topCamp.roi}% ROI with ${topCamp.customers_acquired} customers acquired`,
      finding: `The '${topCamp.campaign_name}' running at ${topCamp.outlet_name} outperformed franchise benchmarks with an ROI of ${topCamp.roi}% and a ${topCamp.conversion_rate}% conversion rate.`,
      primary_agent: 'Marketing Agent',
      correlated_agents: ['Marketing Agent', 'Outlet Performance Agent'],
      evidence: [
        `Campaign Spend: ₹${topCamp.spend.toLocaleString()} generating ₹${topCamp.revenue_generated.toLocaleString()} revenue`,
        `Customers Acquired: ${topCamp.customers_acquired}`
      ],
      possible_causes: [
        'Effective localized geotargeting and appealing combo pricing'
      ],
      business_impact: `Expansion across other outlets could unlock an incremental +₹8.5L monthly revenue.`,
      recommendation: `Replicate campaign creative and promotion structure across trailing outlets.`,
      priority: 'Medium',
      confidence: 0.94,
      related_outlet_id: topCamp.outlet_id,
      related_outlet_name: topCamp.outlet_name,
      created_at: new Date().toISOString(),
      status: 'Active',
    };
    generatedInsights.push(insight);

    generatedRecs.push({
      id: `rec_mkt_${Date.now()}`,
      title: `Replicate '${topCamp.campaign_name}' Campaign Across Network`,
      description: `Adapt and deploy the successful ${topCamp.campaign_type} campaign format across all remaining franchise units.`,
      reason: `Proven high ROI of ${topCamp.roi}% with ${topCamp.conversion_rate}% conversion rate.`,
      supporting_metrics: [
        `ROI: ${topCamp.roi}%`,
        `Revenue: ₹${topCamp.revenue_generated.toLocaleString()}`
      ],
      related_outlet_id: topCamp.outlet_id,
      related_agent: 'Marketing Agent',
      priority: 'Medium',
      status: 'New',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Save generated findings
  saveTenantInsights(businessId, generatedInsights);
  saveTenantRecommendations(businessId, generatedRecs);

  logTenantActivity(
    businessId, 
    'Franchise Intelligence Engine', 
    `Completed full multi-agent business analysis scan (${generatedInsights.length} insights, ${generatedRecs.length} recommendations generated).`,
    generatedInsights.length
  );

  return {
    insights: generatedInsights,
    recommendations: generatedRecs,
    logs: [],
  };
}

/**
 * AI Business Assistant natural language query interface
 */
export async function askBusinessAssistant(
  question: string,
  businessId: string
): Promise<{ answer: string; keyMetrics: string[]; relatedOutlets: string[]; isAiGenerated: boolean }> {
  const business = getActiveBusiness();
  const outlets = getTenantOutlets(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const insights = getTenantInsights(businessId);

  // If Gemini API is connected
  if (aiClient && apiKey) {
    try {
      const summaryContext = {
        businessName: business.name,
        industry: business.industry,
        outletsCount: outlets.length,
        totalRevenue: sales.reduce((s, r) => s + r.revenue, 0),
        outlets: outlets.map(o => {
          const s = sales.find(sl => sl.outlet_id === o.id);
          return {
            name: o.name,
            city: o.city,
            revenue: s ? `₹${(s.revenue / 100000).toFixed(2)}L` : 'N/A',
            targetAch: s && s.target_revenue > 0 ? `${((s.revenue / s.target_revenue) * 100).toFixed(1)}%` : 'N/A',
          };
        }),
        stockouts: inventory.filter(i => i.status === 'Stockout Risk').map(i => `${i.product_name} at ${i.outlet_name}`),
        activeInsights: insights.map(i => ({ title: i.title, finding: i.finding, rec: i.recommendation })),
      };

      const prompt = `You are the Executive AI Business Assistant for '${business.name}'.
Answer the franchise owner's question using ONLY the provided structured business data.
Highlight operational friction, key metrics, and recommended actions clearly.

Business Context:
${JSON.stringify(summaryContext, null, 2)}

Question: "${question}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response.text) {
        return {
          answer: response.text,
          keyMetrics: [
            `Business: ${business.name}`,
            `Outlets: ${outlets.length}`,
            `Total Revenue: ₹${(sales.reduce((s, r) => s + r.revenue, 0) / 100000).toFixed(1)}L`
          ],
          relatedOutlets: outlets.map(o => o.name),
          isAiGenerated: true,
        };
      }
    } catch (e) {
      console.warn('Gemini API call error in Business Assistant:', e);
    }
  }

  // Deterministic Fallback Synthesis
  const q = question.toLowerCase();
  const totalRev = sales.reduce((s, r) => s + r.revenue, 0);

  if (q.includes('worst') || q.includes('underperform') || q.includes('laggard') || q.includes('decline')) {
    const trailingSales = [...sales].sort((a, b) => (a.revenue / a.target_revenue) - (b.revenue / b.target_revenue));
    const lowest = trailingSales[0];
    return {
      answer: `Based on current operational streams for **${business.name}**, the most critical underperformance is at **${lowest?.outlet_name || 'trailing locations'}** achieving only **${lowest ? Math.round((lowest.revenue / lowest.target_revenue) * 100) : 72}% of target** (₹${lowest ? (lowest.revenue / 100000).toFixed(1) : '14.5'}L vs ₹${lowest ? (lowest.target_revenue / 100000).toFixed(1) : '20.0'}L Target).\n\n` +
        `• **Root Causes:** Ingredient stockouts and peak-hour service delays.\n` +
        `• **Action Recommended:** Trigger emergency ingredient replenishment and shift float kitchen staff for weekend rush.`,
      keyMetrics: [`Lowest Target Pace: ${lowest ? Math.round((lowest.revenue / lowest.target_revenue) * 100) : 72}%`, `Active Outlets: ${outlets.length}`],
      relatedOutlets: [lowest?.outlet_name || ''],
      isAiGenerated: false,
    };
  }

  if (q.includes('stockout') || q.includes('inventory') || q.includes('product')) {
    const stockouts = inventory.filter(i => i.status === 'Stockout Risk' || i.current_stock < i.min_stock);
    return {
      answer: `Currently **${stockouts.length} item(s)** are flagged at acute stockout risk:\n\n` +
        stockouts.map(s => `• **${s.product_name}** at **${s.outlet_name}**: Current stock is **${s.current_stock} ${s.unit}** against a safety minimum of **${s.min_stock} ${s.unit}** (Supplier: ${s.supplier}).`).join('\n') +
        `\n\n**Action:** Expedite PO orders with primary logistics hubs to avoid weekend lost sales.`,
      keyMetrics: [`Stockout Items: ${stockouts.length}`, `Total Tracked SKUs: ${inventory.length}`],
      relatedOutlets: Array.from(new Set(stockouts.map(s => s.outlet_name))),
      isAiGenerated: false,
    };
  }

  if (q.includes('prioritize') || q.includes('action') || q.includes('focus') || q.includes('week')) {
    return {
      answer: `**Executive 7-Day Operations Priority Plan for ${business.name}:**\n\n` +
        `1. **Stabilize Trailing Units:** Address kitchen prep bottlenecks and stockout risks at lagging outlets.\n` +
        `2. **Supplier PO Expedited Reorder:** Approve pending ingredient purchase orders before the Friday rush.\n` +
        `3. **Replicate Top Marketing Campaigns:** Scale high-performing promotional formats across remaining tier 2 locations.\n` +
        `4. **Review AI Recommendations:** ${insights.length} actionable insights have been drafted for human-in-the-loop review.`,
      keyMetrics: ['4 Action Priorities', `Network Health: 79/100`],
      relatedOutlets: outlets.map(o => o.name),
      isAiGenerated: false,
    };
  }

  return {
    answer: `**${business.name}** operates **${outlets.length} locations** generating **₹${(totalRev / 100000).toFixed(1)}L** in monthly revenue. The Franchise Intelligence Engine has generated **${insights.length} active insights** across sales, inventory, and workforce domains.\n\n` +
      `You can run **"Analyze My Business"** anytime to refresh cross-agent correlations.`,
    keyMetrics: [`Business: ${business.name}`, `Outlets: ${outlets.length}`, `Active Insights: ${insights.length}`],
    relatedOutlets: outlets.map(o => o.name),
    isAiGenerated: false,
  };
}
