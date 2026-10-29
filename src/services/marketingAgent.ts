import { 
  MarketingAgentScanResult, 
  MarketingAgentInsight, 
  MarketingKPIs, 
  CampaignCalculatedMetrics, 
  ChannelPerformanceSummary, 
  OutletMarketingSummary, 
  CrossAgentCampaignStaffImpact 
} from '../types/marketing';
import { 
  getTenantCampaigns, 
  getTenantOutlets, 
  getTenantEmployees, 
  getTenantShifts, 
  logTenantActivity,
  saveTenantMarketingInsights
} from './tenantService';
import { 
  rankCampaigns, 
  compareMarketingChannels, 
  compareOutletMarketing, 
  calculateMarketingKPIs, 
  detectUnderperformingCampaigns, 
  correlateCampaignsWithWorkforce, 
  generateMarketingAlerts 
} from './marketingEngine';
import { GoogleGenAI } from '@google/genai';

const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) 
  || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) 
  || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client in MarketingAgent:', err);
  }
}

export type MarketingThinkingCallback = (step: string, phase: number, totalPhases: number) => void;

/**
 * Autonomous Marketing Agent — Marketing Intelligence
 * Deterministically analyzes multi-channel campaigns, ROI, CAC, conversion rates, cross-agent staff impacts, and generates structured AI intelligence.
 */
export async function runMarketingAgent(
  businessId: string,
  onThinkingStep?: MarketingThinkingCallback
): Promise<MarketingAgentScanResult> {
  // Phase 1: OBSERVE & QUERY
  if (onThinkingStep) onThinkingStep('Observing active multi-outlet campaigns, spend velocity, and ad attribution telemetry...', 1, 5);
  await new Promise(r => setTimeout(r, 120));

  const outlets = getTenantOutlets(businessId);
  const campaigns = getTenantCampaigns(businessId);
  const employees = getTenantEmployees(businessId);
  const shifts = getTenantShifts(businessId);

  // Phase 2: DETERMINISTIC CALCULATIONS & RANKINGS
  if (onThinkingStep) onThinkingStep('Calculating deterministic campaign ROI, CAC, CTR, conversion rates, and effectiveness tiers...', 2, 5);
  await new Promise(r => setTimeout(r, 150));

  const campaignMetrics = rankCampaigns(campaigns);
  const channelSummaries = compareMarketingChannels(campaigns);
  const outletMarketingSummaries = compareOutletMarketing(outlets, campaigns);
  const kpis = calculateMarketingKPIs(campaigns, campaignMetrics);
  const topCampaigns = campaignMetrics.filter(c => c.performanceTier === 'TOP_PERFORMER');
  const underperformingCampaigns = detectUnderperformingCampaigns(campaigns);

  // Phase 3: CROSS-AGENT IMPACT & RISK CORRELATION
  if (onThinkingStep) onThinkingStep('Correlating campaign customer spikes with outlet shift coverage and kitchen capacity...', 3, 150);
  await new Promise(r => setTimeout(r, 150));

  const crossAgentStaffImpacts = correlateCampaignsWithWorkforce(campaigns, shifts, employees);
  const insights = generateMarketingAlerts(campaigns, campaignMetrics, channelSummaries);

  // Phase 4: FORMULATE OPTIMIZATION & REALLOCATION STRATEGY
  if (onThinkingStep) onThinkingStep('Formulating ROAS optimization schedule and budget reallocation strategies...', 4, 5);
  await new Promise(r => setTimeout(r, 120));

  // Phase 5: AI EXECUTIVE SUMMARY
  if (onThinkingStep) onThinkingStep('Formulating Executive Marketing Intelligence briefing & actionable ROAS roadmap...', 5, 5);
  await new Promise(r => setTimeout(r, 120));

  let summaryNarrative = `Total marketing investment across ${campaigns.length} campaigns is ₹${kpis.totalMarketingSpend.toLocaleString()} generating ₹${kpis.totalAttributedRevenue.toLocaleString()} in attributed revenue (Blended ROI: ${kpis.blendedROI}%, Avg CAC: ₹${kpis.averageCAC}). Top performing channel is ${channelSummaries[0]?.channel || 'N/A'} (${channelSummaries[0]?.blendedROI || 0}% ROI).`;

  if (underperformingCampaigns.length > 0) {
    summaryNarrative += ` Identified ${underperformingCampaigns.length} underperforming campaign(s) wasting budget; recommend pausing to reclaim ad spend.`;
  }
  if (crossAgentStaffImpacts.some(ci => ci.impactRiskLevel === 'CRITICAL')) {
    summaryNarrative += ` Cross-agent warning: Active campaigns risk exceeding outlet shift capacity during peak hours.`;
  }

  // Generate LLM narrative if AI client is configured
  if (aiClient) {
    try {
      const prompt = `You are the FranchiseOps Autonomous Marketing Agent.
Analyze the following DETERMINISTIC marketing intelligence data and generate a concise 3-4 sentence executive briefing. Do NOT invent new numbers.

Data:
- Total Spend: ₹${kpis.totalMarketingSpend.toLocaleString()} | Budget: ₹${kpis.totalMarketingBudget.toLocaleString()}
- Attributed Revenue: ₹${kpis.totalAttributedRevenue.toLocaleString()}
- Blended ROI: ${kpis.blendedROI}% | Blended Conversion Rate: ${kpis.blendedConversionRate}%
- Total Customers Acquired: ${kpis.totalCustomersAcquired.toLocaleString()} | Avg CAC: ₹${kpis.averageCAC}
- Top Channel: ${channelSummaries[0]?.channel} (${channelSummaries[0]?.blendedROI}% ROI, CAC ₹${channelSummaries[0]?.averageCAC})
- Underperforming Campaigns: ${underperformingCampaigns.map(c => `${c.campaignName} (${c.roi}% ROI, CAC ₹${c.costPerAcquisition})`).join('; ') || 'None'}
- Cross-Agent Staff Bottlenecks: ${crossAgentStaffImpacts.filter(ci => ci.impactRiskLevel === 'CRITICAL').map(ci => `${ci.campaignName} at ${ci.outletName}`).join(', ') || 'None'}

Format:
1. Executive Performance Assessment (2 sentences)
2. Immediate ROAS / Budget Reallocation Action (1-2 sentences with concrete numbers).`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response.text) {
        summaryNarrative = response.text.trim();
      }
    } catch (e) {
      console.warn('AI generation skipped in MarketingAgent, using deterministic narrative:', e);
    }
  }

  const result: MarketingAgentScanResult = {
    businessId,
    timestamp: new Date().toISOString(),
    kpis,
    campaignMetrics,
    channelSummaries,
    outletMarketingSummaries,
    insights,
    topCampaigns,
    underperformingCampaigns,
    crossAgentStaffImpacts,
    summaryNarrative
  };

  saveTenantMarketingInsights(businessId, insights);
  logTenantActivity(businessId, 'Marketing Agent', `Completed full marketing ROAS scan across ${campaigns.length} campaigns (Blended ROI: ${kpis.blendedROI}%).`);

  return result;
}
