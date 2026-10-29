import { MarketingCampaign } from '../types/marketing';

export const INITIAL_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  // 1. Madhapur - Instagram (Weekend Biryani Promotion - Top Performer)
  {
    campaignId: 'mkt_madhapur_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Weekend Biryani Feast Promotion',
    outletId: 'out_madhapur',
    outletName: 'Biryani Hub - Madhapur',
    channel: 'Instagram',
    budget: 80000,
    spend: 72500,
    impressions: 340000,
    clicks: 16800,
    leads: 1850,
    conversions: 420,
    customersAcquired: 310,
    attributedRevenue: 310000,
    engagementRate: 6.8,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'Active',
    objective: 'Weekend Dine-in Traffic & Reel Showcases',
    targetAudience: 'Techies & Foodies (20-40 yrs) in Hitec City & Madhapur'
  },

  // 2. Gachibowli - Google Ads (Tech Park Corporate Lunch Search)
  {
    campaignId: 'mkt_gachi_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Tech Park Corporate Lunch Search',
    outletId: 'out_1',
    outletName: 'Biryani Hub - Gachibowli',
    channel: 'Google Ads',
    budget: 65000,
    spend: 61000,
    impressions: 185000,
    clicks: 9400,
    leads: 1400,
    conversions: 780,
    customersAcquired: 520,
    attributedRevenue: 220000,
    engagementRate: 5.9,
    startDate: '2024-03-05',
    endDate: '2024-03-28',
    status: 'Active',
    objective: 'High-Intent Search & Corporate Bulk Orders',
    targetAudience: 'Financial District Office Clusters'
  },

  // 3. Bandra - Facebook / Meta (Mumbai Carnival - Highest Revenue)
  {
    campaignId: 'mkt_bandra_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Mumbai Weekend Biryani Carnival',
    outletId: 'out_4',
    outletName: 'Biryani Hub - Bandra',
    channel: 'Facebook',
    budget: 150000,
    spend: 142000,
    impressions: 520000,
    clicks: 22400,
    leads: 3100,
    conversions: 1840,
    customersAcquired: 1480,
    attributedRevenue: 596400,
    engagementRate: 5.6,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'Active',
    objective: 'Family Dining Footfall & Swiggy Volume',
    targetAudience: 'Bandra, Khar & Santa Cruz Foodies'
  },

  // 4. Kukatpally - Instagram (Family Dining Combos)
  {
    campaignId: 'mkt_kukatpally_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Kukatpally Family Dum Combos',
    outletId: 'out_kukatpally',
    outletName: 'Biryani Hub - Kukatpally',
    channel: 'Instagram',
    budget: 60000,
    spend: 55000,
    impressions: 160000,
    clicks: 7200,
    leads: 920,
    conversions: 360,
    customersAcquired: 280,
    attributedRevenue: 140000,
    engagementRate: 4.8,
    startDate: '2024-03-02',
    endDate: '2024-03-30',
    status: 'Active',
    objective: 'Family Sunday Lunch Bundles',
    targetAudience: 'KPHB & Kukatpally Residential Families'
  },

  // 5. Secunderabad - WhatsApp (Loyalty VIP Blast)
  {
    campaignId: 'mkt_secunderabad_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Secunderabad VIP Loyalty Broadcast',
    outletId: 'out_secunderabad',
    outletName: 'Biryani Hub - Secunderabad',
    channel: 'WhatsApp',
    budget: 50000,
    spend: 48000,
    impressions: 95000,
    clicks: 6800,
    leads: 1200,
    conversions: 310,
    customersAcquired: 260,
    attributedRevenue: 98000,
    engagementRate: 14.2,
    startDate: '2024-03-10',
    endDate: '2024-03-24',
    status: 'Active',
    objective: 'Repeat Customer Retargeting 15% Off',
    targetAudience: 'Past 90-day Diners in Secunderabad'
  },

  // 6. Indiranagar - Facebook (Budget Drain / Underperforming Alert)
  {
    campaignId: 'mkt_indi_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Bangalore Late-Night Delivery Push',
    outletId: 'out_2',
    outletName: 'Biryani Hub - Indiranagar',
    channel: 'Facebook',
    budget: 70000,
    spend: 65000,
    impressions: 195000,
    clicks: 4100,
    leads: 420,
    conversions: 210,
    customersAcquired: 160,
    attributedRevenue: 38000,
    engagementRate: 2.1,
    startDate: '2024-03-01',
    endDate: '2024-03-25',
    status: 'Active',
    objective: 'Midnight Delivery Trial',
    targetAudience: 'Late Night Delivery (18-30 yrs)'
  },

  // 7. Koregaon Park - Influencer (Pune Food Vlogger Showcase)
  {
    campaignId: 'mkt_kp_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Pune Foodie Influencer Showcase',
    outletId: 'out_5',
    outletName: 'Biryani Hub - Koregaon Park',
    channel: 'Influencer',
    budget: 40000,
    spend: 35000,
    impressions: 320000,
    clicks: 14500,
    leads: 1600,
    conversions: 1100,
    customersAcquired: 920,
    attributedRevenue: 147000,
    engagementRate: 7.8,
    startDate: '2024-03-10',
    endDate: '2024-03-24',
    status: 'Active',
    objective: 'Instagram Reels & Food Vlogger Showcase',
    targetAudience: 'Young Adults, Dine-in Enthusiasts Pune'
  },

  // 8. T Nagar - Local OOH (Chennai Traditional Thali Promo)
  {
    campaignId: 'mkt_tnagar_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'Chennai Traditional Thali & Dum Feast',
    outletId: 'out_3',
    outletName: 'Biryani Hub - T Nagar',
    channel: 'Local OOH / Flyers',
    budget: 45000,
    spend: 40000,
    impressions: 95000,
    clicks: 4200,
    leads: 680,
    conversions: 350,
    customersAcquired: 290,
    attributedRevenue: 92000,
    engagementRate: 3.9,
    startDate: '2024-03-01',
    endDate: '2024-03-30',
    status: 'Active',
    objective: 'Family Weekend Dining',
    targetAudience: 'Commercial Shoppers T Nagar'
  },

  // 9. Chain-wide Email Retargeting (Swiggy/Zomato Boost)
  {
    campaignId: 'mkt_chain_email_01',
    businessId: 'biz_biryani_express_01',
    campaignName: 'VIP Biryani Club Newsletter & Promo',
    outletId: 'out_1',
    outletName: 'Biryani Hub - Gachibowli',
    channel: 'Email',
    budget: 20000,
    spend: 14000,
    impressions: 48000,
    clicks: 5200,
    leads: 1100,
    conversions: 890,
    customersAcquired: 740,
    attributedRevenue: 64000,
    engagementRate: 11.4,
    startDate: '2024-03-08',
    endDate: '2024-03-22',
    status: 'Completed',
    objective: 'Direct Re-engagement 20% Off Code',
    targetAudience: 'Email Subscriber Base'
  }
];

export interface MonthlyMarketingTrend {
  month: string;
  spend: number;
  revenue: number;
  roiMultiplier: number;
  conversions: number;
  cac: number;
}

export const MONTHLY_MARKETING_TRENDS: MonthlyMarketingTrend[] = [
  { month: 'Oct 2023', spend: 320000, revenue: 980000, roiMultiplier: 3.06, conversions: 2450, cac: 390 },
  { month: 'Nov 2023', spend: 380000, revenue: 1240000, roiMultiplier: 3.26, conversions: 3100, cac: 385 },
  { month: 'Dec 2023', spend: 490000, revenue: 1820000, roiMultiplier: 3.71, conversions: 4600, cac: 370 },
  { month: 'Jan 2024', spend: 410000, revenue: 1390000, roiMultiplier: 3.39, conversions: 3400, cac: 395 },
  { month: 'Feb 2024', spend: 450000, revenue: 1650000, roiMultiplier: 3.66, conversions: 4100, cac: 380 },
  { month: 'Mar 2024', spend: 532500, revenue: 1905400, roiMultiplier: 3.58, conversions: 6270, cac: 368 }
];
