import { 
  MarketingCampaign, 
  CampaignCalculatedMetrics, 
  ChannelPerformanceSummary, 
  OutletMarketingSummary, 
  MarketingKPIs, 
  MarketingAgentInsight, 
  MarketingChannel,
  CrossAgentCampaignStaffImpact
} from '../types/marketing';
import { Outlet } from '../types';
import { ShiftRecord, Employee } from '../types/workforce';

/**
 * Deterministic Marketing Calculation Engine for Marketing Agent
 * Pure business logic with deterministic calculations. LLM does NOT invent numbers.
 */

export function calculateCampaignROI(spend: number, attributedRevenue: number): number {
  if (!spend || spend <= 0) return 0;
  return Math.round(((attributedRevenue - spend) / spend) * 1000) / 10;
}

export function calculateConversionRate(conversions: number, clicks: number): number {
  if (!clicks || clicks <= 0) return 0;
  return Math.round((conversions / clicks) * 1000) / 10;
}

export function calculateCustomerAcquisitionCost(spend: number, customersAcquired: number): number {
  if (!customersAcquired || customersAcquired <= 0) return spend;
  return Math.round((spend / customersAcquired) * 10) / 10;
}

export function calculateCostPerClick(spend: number, clicks: number): number {
  if (!clicks || clicks <= 0) return 0;
  return Math.round((spend / clicks) * 100) / 100;
}

export function calculateClickThroughRate(clicks: number, impressions: number): number {
  if (!impressions || impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 1000) / 10;
}

export function calculateBudgetUtilization(spend: number, budget: number): number {
  if (!budget || budget <= 0) return 0;
  return Math.round((spend / budget) * 1000) / 10;
}

export function calculateCampaignMetrics(campaign: MarketingCampaign): CampaignCalculatedMetrics {
  const roi = calculateCampaignROI(campaign.spend, campaign.attributedRevenue);
  const conversionRate = calculateConversionRate(campaign.conversions, campaign.clicks);
  const costPerAcquisition = calculateCustomerAcquisitionCost(campaign.spend, campaign.customersAcquired);
  const costPerClick = calculateCostPerClick(campaign.spend, campaign.clicks);
  const costPerLead = campaign.leads > 0 ? Math.round((campaign.spend / campaign.leads) * 10) / 10 : 0;
  const clickThroughRate = calculateClickThroughRate(campaign.clicks, campaign.impressions);
  const budgetUtilizationRate = calculateBudgetUtilization(campaign.spend, campaign.budget);
  const netProfit = Math.round(campaign.attributedRevenue - campaign.spend);

  // Effectiveness score (0-100)
  // ROI contribution (40%), Conversion Rate (30%), CAC efficiency (15%), CTR (15%)
  const roiComponent = Math.min(40, Math.max(0, (roi / 400) * 40));
  const convComponent = Math.min(30, Math.max(0, (conversionRate / 10) * 30));
  const cacComponent = Math.min(15, Math.max(0, (1 - Math.min(1, costPerAcquisition / 300)) * 15));
  const ctrComponent = Math.min(15, Math.max(0, (clickThroughRate / 8) * 15));

  const effectivenessScore = Math.round(roiComponent + convComponent + cacComponent + ctrComponent);

  let performanceTier: CampaignCalculatedMetrics['performanceTier'] = 'HEALTHY';
  let diagnosis = 'Performing within healthy ROAS benchmarks.';

  if (roi >= 250 && conversionRate >= 5.0) {
    performanceTier = 'TOP_PERFORMER';
    diagnosis = `Exceptional ROAS (${roi}%) and strong conversion efficiency (${conversionRate}%). Scale spend.`;
  } else if (roi < 0 || costPerAcquisition > 200) {
    performanceTier = 'BUDGET_DRAIN';
    diagnosis = `Negative ROAS (${roi}%) with elevated CAC (₹${costPerAcquisition}). Wasting ad spend. Immediate pause or creative overhaul required.`;
  } else if (roi < 100 || conversionRate < 3.0) {
    performanceTier = 'UNDERPERFORMING';
    diagnosis = `Sub-optimal return (${roi}% ROI) and low click-to-conversion rate (${conversionRate}%). Optimize targeting and offer.`;
  }

  return {
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    outletId: campaign.outletId,
    outletName: campaign.outletName,
    channel: campaign.channel,
    spend: campaign.spend,
    budget: campaign.budget,
    attributedRevenue: campaign.attributedRevenue,
    netProfit,
    roi,
    conversionRate,
    costPerAcquisition,
    costPerClick,
    costPerLead,
    clickThroughRate,
    engagementRate: campaign.engagementRate,
    budgetUtilizationRate,
    effectivenessScore,
    performanceTier,
    ranking: 0, // Assigned in rankCampaigns
    diagnosis
  };
}

export function rankCampaigns(campaigns: MarketingCampaign[]): CampaignCalculatedMetrics[] {
  const analyzed = campaigns.map(calculateCampaignMetrics);
  analyzed.sort((a, b) => b.effectivenessScore - a.effectivenessScore || b.roi - a.roi);
  return analyzed.map((c, index) => ({
    ...c,
    ranking: index + 1
  }));
}

export function compareMarketingChannels(campaigns: MarketingCampaign[]): ChannelPerformanceSummary[] {
  const channelMap = new Map<MarketingChannel, MarketingCampaign[]>();

  for (const campaign of campaigns) {
    const list = channelMap.get(campaign.channel) || [];
    list.push(campaign);
    channelMap.set(campaign.channel, list);
  }

  const summaries: ChannelPerformanceSummary[] = [];

  for (const [channel, list] of channelMap.entries()) {
    const totalSpend = list.reduce((s, c) => s + (c.spend || 0), 0);
    const totalBudget = list.reduce((s, c) => s + (c.budget || 0), 0);
    const totalImpressions = list.reduce((s, c) => s + (c.impressions || 0), 0);
    const totalClicks = list.reduce((s, c) => s + (c.clicks || 0), 0);
    const totalConversions = list.reduce((s, c) => s + (c.conversions || 0), 0);
    const totalCustomersAcquired = list.reduce((s, c) => s + (c.customersAcquired || 0), 0);
    const totalRevenue = list.reduce((s, c) => s + (c.attributedRevenue || 0), 0);
    const activeCampaigns = list.filter(c => c.status === 'Active').length;

    const blendedROI = calculateCampaignROI(totalSpend, totalRevenue);
    const averageCAC = calculateCustomerAcquisitionCost(totalSpend, totalCustomersAcquired);
    const averageCTR = calculateClickThroughRate(totalClicks, totalImpressions);
    const averageConversionRate = calculateConversionRate(totalConversions, totalClicks);

    const score = Math.round(
      Math.min(40, Math.max(0, (blendedROI / 400) * 40)) +
      Math.min(30, Math.max(0, (averageConversionRate / 10) * 30)) +
      Math.min(15, Math.max(0, (1 - Math.min(1, averageCAC / 250)) * 15)) +
      Math.min(15, Math.max(0, (averageCTR / 8) * 15))
    );

    let recommendation = 'Maintain current allocation strategy.';
    if (blendedROI >= 250) {
      recommendation = `Increase channel budget allocation by +25-40% to capture high ROI headroom.`;
    } else if (blendedROI < 50) {
      recommendation = `Reduce ad spend on this channel; reallocate budget into higher-performing channels.`;
    }

    summaries.push({
      channel,
      totalCampaigns: list.length,
      activeCampaigns,
      totalSpend,
      totalBudget,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalCustomersAcquired,
      totalRevenue,
      blendedROI,
      averageCAC,
      averageCTR,
      averageConversionRate,
      channelEffectivenessScore: score,
      rank: 0,
      recommendation
    });
  }

  summaries.sort((a, b) => b.channelEffectivenessScore - a.channelEffectivenessScore || b.blendedROI - a.blendedROI);
  return summaries.map((s, idx) => ({ ...s, rank: idx + 1 }));
}

export function compareOutletMarketing(
  outlets: Outlet[],
  campaigns: MarketingCampaign[]
): OutletMarketingSummary[] {
  return outlets.map(outlet => {
    const outletCampaigns = campaigns.filter(c => c.outletId === outlet.id);
    const activeCount = outletCampaigns.filter(c => c.status === 'Active').length;
    const totalSpend = outletCampaigns.reduce((s, c) => s + (c.spend || 0), 0);
    const totalRevenue = outletCampaigns.reduce((s, c) => s + (c.attributedRevenue || 0), 0);
    const totalCustomers = outletCampaigns.reduce((s, c) => s + (c.customersAcquired || 0), 0);
    const averageROI = calculateCampaignROI(totalSpend, totalRevenue);
    const blendedCAC = calculateCustomerAcquisitionCost(totalSpend, totalCustomers);

    let marketingEfficiencyStatus: OutletMarketingSummary['marketingEfficiencyStatus'] = 'GOOD';
    if (averageROI >= 250 && blendedCAC < 90) {
      marketingEfficiencyStatus = 'EXCELLENT';
    } else if (averageROI < 0 || (totalSpend > 40000 && averageROI < 30)) {
      marketingEfficiencyStatus = 'CRITICAL_WASTE';
    } else if (averageROI < 100) {
      marketingEfficiencyStatus = 'NEEDS_OPTIMIZATION';
    }

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      city: outlet.city,
      activeCampaignsCount: activeCount,
      totalMarketingSpend: totalSpend,
      totalAttributedRevenue: totalRevenue,
      averageROI,
      totalCustomersAcquired: totalCustomers,
      blendedCAC,
      marketingEfficiencyStatus
    };
  }).sort((a, b) => b.totalAttributedRevenue - a.totalAttributedRevenue);
}

export function calculateMarketingKPIs(
  campaigns: MarketingCampaign[],
  rankedCampaigns: CampaignCalculatedMetrics[]
): MarketingKPIs {
  const totalMarketingSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalMarketingBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalAttributedRevenue = campaigns.reduce((s, c) => s + (c.attributedRevenue || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalCustomersAcquired = campaigns.reduce((s, c) => s + (c.customersAcquired || 0), 0);

  const blendedROI = calculateCampaignROI(totalMarketingSpend, totalAttributedRevenue);
  const blendedConversionRate = calculateConversionRate(totalConversions, totalClicks);
  const averageCAC = calculateCustomerAcquisitionCost(totalMarketingSpend, totalCustomersAcquired);
  const averageCTR = calculateClickThroughRate(totalClicks, totalImpressions);
  const averageEngagementRate = campaigns.length > 0
    ? Math.round((campaigns.reduce((s, c) => s + (c.engagementRate || 0), 0) / campaigns.length) * 10) / 10
    : 0;

  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;
  const highPerformingCount = rankedCampaigns.filter(c => c.performanceTier === 'TOP_PERFORMER').length;
  const underperformingCount = rankedCampaigns.filter(c => c.performanceTier === 'UNDERPERFORMING' || c.performanceTier === 'BUDGET_DRAIN').length;

  return {
    totalMarketingSpend,
    totalMarketingBudget,
    totalAttributedRevenue,
    blendedROI,
    blendedConversionRate,
    totalCustomersAcquired,
    averageCAC,
    averageCTR,
    averageEngagementRate,
    activeCampaignsCount,
    highPerformingCount,
    underperformingCount
  };
}

export function detectUnderperformingCampaigns(campaigns: MarketingCampaign[]): CampaignCalculatedMetrics[] {
  const ranked = rankCampaigns(campaigns);
  return ranked.filter(c => c.performanceTier === 'BUDGET_DRAIN' || c.performanceTier === 'UNDERPERFORMING');
}

/**
 * Cross-Agent Operational Intelligence
 * Correlates active marketing campaigns driving customer volume with outlet workforce availability & shift shortages.
 */
export function correlateCampaignsWithWorkforce(
  campaigns: MarketingCampaign[],
  shifts: ShiftRecord[],
  employees: Employee[]
): CrossAgentCampaignStaffImpact[] {
  const impacts: CrossAgentCampaignStaffImpact[] = [];

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  for (const campaign of activeCampaigns) {
    const outletShifts = shifts.filter(s => s.outletId === campaign.outletId);
    const outletEmps = employees.filter(e => e.outletId === campaign.outletId);

    const shiftShortages = outletShifts.filter(s => s.coverageStatus === 'SHORTAGE' || s.coverageStatus === 'CRITICAL_DEFICIT');
    const totalDeficit = shiftShortages.reduce((s, sh) => s + sh.deficitCount, 0);
    
    const avgAttendance = outletEmps.length > 0 
      ? Math.round((outletEmps.reduce((s, e) => s + e.attendanceRate, 0) / outletEmps.length) * 10) / 10 
      : 0;

    let impactRiskLevel: CrossAgentCampaignStaffImpact['impactRiskLevel'] = 'LOW';
    let insightSummary = `Marketing campaign volume is well-supported by current workforce roster at ${campaign.outletName}.`;
    let recommendedAction = `Continue standard campaign pacing.`;

    if (totalDeficit > 0 && campaign.customersAcquired > 500) {
      impactRiskLevel = 'CRITICAL';
      insightSummary = `Active campaign '${campaign.campaignName}' is driving high customer volume (+${campaign.customersAcquired.toLocaleString()} customers) to ${campaign.outletName}, but the outlet suffers from ${shiftShortages.length} active shift shortage(s) (deficit of ${totalDeficit} staff).`;
      recommendedAction = `Immediate cross-outlet crew reallocation required to ${campaign.outletName} during campaign peak hours to prevent kitchen bottlenecks, long wait times, and brand damage.`;
    } else if (avgAttendance < 80) {
      impactRiskLevel = 'HIGH';
      insightSummary = `Campaign '${campaign.campaignName}' is active at ${campaign.outletName}, but local staff attendance is low (${avgAttendance}%). Risk of fulfillment delays during promotion spikes.`;
      recommendedAction = `Bolster reserve staffing at ${campaign.outletName} before scaling weekend marketing spend.`;
    } else if (totalDeficit > 0) {
      impactRiskLevel = 'MEDIUM';
      insightSummary = `Minor shift shortage detected at ${campaign.outletName} during active campaign window.`;
      recommendedAction = `Monitor peak dining shift capacity closely.`;
    }

    if (impactRiskLevel !== 'LOW' || campaign.customersAcquired > 800) {
      impacts.push({
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        outletId: campaign.outletId,
        outletName: campaign.outletName,
        channel: campaign.channel,
        campaignStatus: campaign.status,
        attributedCustomerVolume: campaign.customersAcquired,
        outletCurrentAttendanceRate: avgAttendance,
        outletShiftShortagesCount: shiftShortages.length,
        impactRiskLevel,
        insightSummary,
        recommendedAction
      });
    }
  }

  return impacts;
}

export function generateMarketingAlerts(
  campaigns: MarketingCampaign[],
  rankedCampaigns: CampaignCalculatedMetrics[],
  channelSummaries: ChannelPerformanceSummary[]
): MarketingAgentInsight[] {
  const insights: MarketingAgentInsight[] = [];

  // 1. Budget Drain Alert
  const budgetDrains = rankedCampaigns.filter(c => c.performanceTier === 'BUDGET_DRAIN');
  if (budgetDrains.length > 0) {
    const drainSpend = budgetDrains.reduce((s, c) => s + c.spend, 0);
    const affectedCampaignNames = budgetDrains.map(c => c.campaignName);
    const affectedOutlets = Array.from(new Set(budgetDrains.map(c => c.outletName)));

    insights.push({
      id: `mkt_ins_drain_${Date.now()}`,
      title: `Budget Drain Alert: ₹${drainSpend.toLocaleString()} Spent on Underperforming Campaigns`,
      summary: `${budgetDrains.map(c => `'${c.campaignName}' (${c.roi}% ROI, CAC ₹${c.costPerAcquisition} at ${c.outletName})`).join(', ')} is draining marketing budget without viable customer conversion.`,
      severity: 'Critical',
      category: 'Budget Drain',
      affected_campaigns: affectedCampaignNames,
      affected_outlets: affectedOutlets,
      affected_channels: budgetDrains.map(c => c.channel),
      actionable_step: `Immediately pause '${budgetDrains[0].campaignName}' and reallocate remaining budget (₹${(budgetDrains[0].budget - budgetDrains[0].spend).toLocaleString()}) to high-ROAS channels like ${channelSummaries[0]?.channel || 'Zomato/Swiggy Ads'}.`,
      calculated_metrics: {
        'Wasted Spend': `₹${drainSpend.toLocaleString()}`,
        'Worst Campaign ROI': `${budgetDrains[0].roi}%`,
        'CAC': `₹${budgetDrains[0].costPerAcquisition}`
      },
      timestamp: new Date().toISOString()
    });
  }

  // 2. High ROI Scale Opportunity
  const topCampaigns = rankedCampaigns.filter(c => c.performanceTier === 'TOP_PERFORMER');
  if (topCampaigns.length > 0) {
    const best = topCampaigns[0];
    insights.push({
      id: `mkt_ins_scale_${Date.now()}`,
      title: `High-ROI Headroom: '${best.campaignName}' Delivering ${best.roi}% ROI`,
      summary: `${best.campaignName} at ${best.outletName} generated ₹${best.attributedRevenue.toLocaleString()} with CAC of only ₹${best.costPerAcquisition} (Conversion rate: ${best.conversionRate}%).`,
      severity: 'Positive',
      category: 'ROI',
      affected_campaigns: [best.campaignName],
      affected_outlets: [best.outletName],
      affected_channels: [best.channel],
      actionable_step: `Increase budget by +30% on '${best.campaignName}' to maximize revenue during active campaign window.`,
      calculated_metrics: {
        'Attributed Revenue': `₹${best.attributedRevenue.toLocaleString()}`,
        'ROI': `${best.roi}%`,
        'Conversion Rate': `${best.conversionRate}%`
      },
      timestamp: new Date().toISOString()
    });
  }

  // 3. Channel Disparity Insight
  if (channelSummaries.length >= 2) {
    const bestChannel = channelSummaries[0];
    const worstChannel = channelSummaries[channelSummaries.length - 1];

    if (bestChannel.blendedROI > worstChannel.blendedROI + 150) {
      insights.push({
        id: `mkt_ins_chan_${Date.now()}`,
        title: `Channel Performance Disparity: ${bestChannel.channel} (${bestChannel.blendedROI}% ROI) vs ${worstChannel.channel} (${worstChannel.blendedROI}% ROI)`,
        summary: `${bestChannel.channel} is outperforming ${worstChannel.channel} by ${(bestChannel.blendedROI - worstChannel.blendedROI).toFixed(0)}% ROI with ₹${bestChannel.averageCAC} CAC vs ₹${worstChannel.averageCAC} CAC.`,
        severity: 'Medium',
        category: 'Channel Efficiency',
        affected_campaigns: [],
        affected_outlets: [],
        affected_channels: [bestChannel.channel, worstChannel.channel],
        actionable_step: `Shift ₹20,000 monthly allocation from ${worstChannel.channel} to ${bestChannel.channel}.`,
        calculated_metrics: {
          'Top Channel ROI': `${bestChannel.blendedROI}%`,
          'Lagging Channel ROI': `${worstChannel.blendedROI}%`,
          'CAC Gap': `₹${Math.abs(worstChannel.averageCAC - bestChannel.averageCAC)}`
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  return insights;
}
