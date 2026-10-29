export type MarketingChannel = 
  | 'Instagram'
  | 'Google Ads' 
  | 'Facebook'
  | 'Meta Ads'
  | 'WhatsApp'
  | 'Email'
  | 'Email/SMS'
  | 'Influencer' 
  | 'Local OOH / Flyers' 
  | 'Zomato/Swiggy Ads' 
  | 'Social' 
  | 'Referral'
  | 'Other';


export type CampaignStatus = 'Active' | 'Completed' | 'Paused' | 'Draft';

export type CampaignPerformanceTier = 'TOP_PERFORMER' | 'HEALTHY' | 'UNDERPERFORMING' | 'BUDGET_DRAIN';

export interface MarketingCampaign {
  campaignId: string;
  businessId: string;
  campaignName: string;
  outletId: string;
  outletName: string;
  channel: MarketingChannel;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  customersAcquired: number;
  attributedRevenue: number;
  engagementRate: number; // Percentage (e.g., 4.5%)
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  objective?: string;
  targetAudience?: string;
}

export interface CampaignCalculatedMetrics {
  campaignId: string;
  campaignName: string;
  outletId: string;
  outletName: string;
  channel: MarketingChannel;
  spend: number;
  budget: number;
  attributedRevenue: number;
  netProfit: number;
  roi: number; // Percentage, e.g. 300%
  conversions?: number;
  customersAcquired?: number;
  conversionRate: number; // Conversions / Clicks %
  costPerAcquisition: number; // Spend / CustomersAcquired (CAC)
  costPerClick: number; // Spend / Clicks (CPC)
  costPerLead: number; // Spend / Leads (CPL)
  clickThroughRate: number; // Clicks / Impressions % (CTR)
  engagementRate: number;
  budgetUtilizationRate: number; // Spend / Budget %
  effectivenessScore: number; // 0-100 composite score
  performanceTier: CampaignPerformanceTier;
  ranking: number;
  diagnosis: string;
}

export interface ChannelPerformanceSummary {
  channel: MarketingChannel;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalBudget: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalCustomersAcquired: number;
  totalRevenue: number;
  blendedROI: number;
  averageCAC: number;
  averageCTR: number;
  averageConversionRate: number;
  channelEffectivenessScore: number;
  rank: number;
  recommendation: string;
}

export interface OutletMarketingSummary {
  outletId: string;
  outletName: string;
  city: string;
  activeCampaignsCount: number;
  totalMarketingSpend: number;
  totalAttributedRevenue: number;
  averageROI: number;
  totalCustomersAcquired: number;
  blendedCAC: number;
  marketingEfficiencyStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_OPTIMIZATION' | 'CRITICAL_WASTE';
}

export interface MarketingKPIs {
  totalMarketingSpend: number;
  totalMarketingBudget: number;
  totalAttributedRevenue: number;
  blendedROI: number;
  blendedConversionRate: number;
  totalCustomersAcquired: number;
  averageCAC: number;
  averageCTR: number;
  averageEngagementRate: number;
  activeCampaignsCount: number;
  highPerformingCount: number;
  underperformingCount: number;
}

export interface MarketingAgentInsight {
  id: string;
  title: string;
  summary: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Positive';
  category: 'ROI' | 'Budget Drain' | 'Channel Efficiency' | 'Conversion' | 'Customer Acquisition' | 'Optimization';
  affected_campaigns: string[];
  affected_outlets: string[];
  affected_channels: string[];
  actionable_step: string;
  calculated_metrics: Record<string, string | number>;
  timestamp: string;
}

export interface CrossAgentCampaignStaffImpact {
  campaignId: string;
  campaignName: string;
  outletId: string;
  outletName: string;
  channel: MarketingChannel;
  campaignStatus: CampaignStatus;
  attributedCustomerVolume: number;
  outletCurrentAttendanceRate: number;
  outletShiftShortagesCount: number;
  impactRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  insightSummary: string;
  recommendedAction: string;
}

export interface MarketingAgentScanResult {
  businessId: string;
  timestamp: string;
  kpis: MarketingKPIs;
  campaignMetrics: CampaignCalculatedMetrics[];
  channelSummaries: ChannelPerformanceSummary[];
  outletMarketingSummaries: OutletMarketingSummary[];
  insights: MarketingAgentInsight[];
  topCampaigns: CampaignCalculatedMetrics[];
  underperformingCampaigns: CampaignCalculatedMetrics[];
  crossAgentStaffImpacts: CrossAgentCampaignStaffImpact[];
  summaryNarrative: string;
}
