export type Role = 'Super Admin' | 'Franchise Manager' | 'Outlet Manager' | 'Analyst';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Franchise {
  id: string;
  name: string;
  total_outlets: number;
}

export interface Outlet {
  id: string;
  franchise_id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  manager_name: string;
  status: 'Active' | 'Inactive' | 'Warning';
}

export interface OutletPerformance {
  outlet_id: string;
  period: string;
  revenue: number;
  previous_revenue: number;
  target_revenue: number;
  orders: number;
  customers: number;
  revenue_growth: number; // calculated
  target_achievement: number; // calculated
  aov: number; // calculated
  health_score: number; // calculated
  performance_status: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export interface AIInsight {
  id: string;
  title: string;
  finding: string;
  evidence: string[];
  possible_causes: string[];
  recommendation: string;
  confidence: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  related_outlet_id?: string;
  related_agent: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  supporting_metrics: string[];
  related_outlet_id?: string;
  related_agent: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  type: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  outlet_id?: string;
  description: string;
  created_at: string;
  status: 'New' | 'Read' | 'Acknowledged' | 'Resolved';
}

export interface AgentRun {
  id: string;
  agent: string;
  task: string;
  start_time: string;
  end_time?: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  input: string;
  output?: string;
}

export type HealthCategory = 'Excellent' | 'Healthy' | 'At Risk' | 'Critical';

export interface HealthScoreBreakdown {
  totalScore: number;
  category: HealthCategory;
  components: {
    targetAchievement: { score: number; max: number; label: string; valueFormatted: string };
    revenueGrowth: { score: number; max: number; label: string; valueFormatted: string };
    customerTraffic: { score: number; max: number; label: string; valueFormatted: string };
    aovPerformance: { score: number; max: number; label: string; valueFormatted: string };
  };
  strengths: string[];
  weaknesses: string[];
  recommendedFocus: string;
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  target: number;
  orders: number;
  customers: number;
  aov: number;
}

export interface OutletBenchmarking {
  outletId: string;
  name: string;
  city: string;
  state: string;
  revenue: number;
  revenueGrowth: number;
  targetAchievement: number;
  customers: number;
  orders: number;
  aov: number;
  healthScore: number;
  category: HealthCategory;
  rank: number;
  isUnderperforming: boolean;
  riskLevel: 'None' | 'Watch' | 'High Risk' | 'Critical';
}

export interface UnderperformanceDetection {
  outletId: string;
  outletName: string;
  city: string;
  healthScore: number;
  revenueGrowth: number;
  targetAchievement: number;
  customerGrowth: number;
  riskLevel: 'Watch' | 'High Risk' | 'Critical';
  whyFlagged: string;
  triggers: string[];
  recommendedAction: string;
}

export interface UnderperformanceAlertItem {
  id: string;
  outletId: string;
  outletName: string;
  severity: 'Critical' | 'High' | 'Watch';
  issue: string;
  metric: string;
  detectedTime: string;
  recommendedAction: string;
}

export interface RevenueTrendAnalysis {
  currentRevenue: number;
  previousRevenue: number;
  growthPercent: number;
  trendDirection: 'Accelerating' | 'Steady' | 'Decelerating' | 'Declining';
  bestPeriod: string;
  worstPeriod: string;
  topContributors: { outletName: string; contributionPercent: number; revenueGrowth: number }[];
  dragOutlets: { outletName: string; revenueDrop: number; growth: number }[];
  insights: string[];
}

export * from './tenant';
export * from './inventory';
export * from './workforce';
export * from './marketing';

