import { Outlet, OutletPerformance, AIInsight, Recommendation, Alert, AgentRun } from '../types';
import { subDays, formatISO } from 'date-fns';

export const mockOutlets: Outlet[] = [
  { id: 'out_1', franchise_id: 'f_1', name: 'Biryani Hub - Gachibowli', location: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', manager_name: 'Rahul Sharma', status: 'Active' },
  { id: 'out_2', franchise_id: 'f_1', name: 'Biryani Hub - Indiranagar', location: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', manager_name: 'Priya Reddy', status: 'Warning' },
  { id: 'out_3', franchise_id: 'f_1', name: 'Biryani Hub - T Nagar', location: 'T Nagar', city: 'Chennai', state: 'Tamil Nadu', manager_name: 'Karthik Iyer', status: 'Active' },
  { id: 'out_4', franchise_id: 'f_1', name: 'Biryani Hub - Bandra', location: 'Bandra', city: 'Mumbai', state: 'Maharashtra', manager_name: 'Amit Patel', status: 'Active' },
  { id: 'out_5', franchise_id: 'f_1', name: 'Biryani Hub - KP', location: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', manager_name: 'Neha Desai', status: 'Warning' },
  { id: 'out_6', franchise_id: 'f_1', name: 'Biryani Hub - Benz Circle', location: 'Benz Circle', city: 'Vijayawada', state: 'Andhra Pradesh', manager_name: 'Srinivas Rao', status: 'Active' },
  { id: 'out_7', franchise_id: 'f_1', name: 'Biryani Hub - MVP Colony', location: 'MVP Colony', city: 'Visakhapatnam', state: 'Andhra Pradesh', manager_name: 'Anjali Verma', status: 'Active' },
];

export const mockPerformances: OutletPerformance[] = [
  { outlet_id: 'out_1', period: '2023-10', revenue: 2450000, previous_revenue: 2200000, target_revenue: 2300000, orders: 4900, customers: 4100, revenue_growth: 11.36, target_achievement: 106.5, aov: 500, health_score: 92, performance_status: 'Excellent' },
  { outlet_id: 'out_2', period: '2023-10', revenue: 1850000, previous_revenue: 2150000, target_revenue: 2400000, orders: 3800, customers: 3200, revenue_growth: -13.95, target_achievement: 77.08, aov: 486, health_score: 64, performance_status: 'Average' },
  { outlet_id: 'out_3', period: '2023-10', revenue: 3100000, previous_revenue: 2850000, target_revenue: 3000000, orders: 6100, customers: 5300, revenue_growth: 8.77, target_achievement: 103.3, aov: 508, health_score: 88, performance_status: 'Good' },
  { outlet_id: 'out_4', period: '2023-10', revenue: 4200000, previous_revenue: 3900000, target_revenue: 4500000, orders: 7800, customers: 6900, revenue_growth: 7.69, target_achievement: 93.3, aov: 538, health_score: 82, performance_status: 'Good' },
  { outlet_id: 'out_5', period: '2023-10', revenue: 1450000, previous_revenue: 1750000, target_revenue: 2000000, orders: 3100, customers: 2800, revenue_growth: -17.14, target_achievement: 72.5, aov: 467, health_score: 58, performance_status: 'Poor' },
  { outlet_id: 'out_6', period: '2023-10', revenue: 1950000, previous_revenue: 1800000, target_revenue: 1800000, orders: 4200, customers: 3800, revenue_growth: 8.33, target_achievement: 108.3, aov: 464, health_score: 90, performance_status: 'Excellent' },
  { outlet_id: 'out_7', period: '2023-10', revenue: 2100000, previous_revenue: 2050000, target_revenue: 2200000, orders: 4300, customers: 3900, revenue_growth: 2.43, target_achievement: 95.4, aov: 488, health_score: 79, performance_status: 'Good' },
];

export const mockInsights: AIInsight[] = [
  {
    id: 'ins_1',
    title: 'Revenue Decline in Pune Outlet',
    finding: 'Biryani Hub - KP is showing a 17.14% revenue decline compared to last month and is achieving only 72.5% of its target.',
    evidence: ['Revenue dropped from ₹17.5L to ₹14.5L', 'Customer footfall decreased by 12%', 'Inventory shortages of key spices noted in Audit Agent'],
    possible_causes: ['Local road construction affecting walk-ins', 'Consistent stockouts of popular biryani variants due to supply chain issues'],
    recommendation: 'Temporarily increase marketing spend for delivery platforms in the Koregaon Park radius to offset dine-in losses, and expedite spice supply from secondary vendors.',
    confidence: 0.88,
    priority: 'High',
    related_outlet_id: 'out_5',
    related_agent: 'Franchise Intelligence Engine',
    created_at: formatISO(subDays(new Date(), 1))
  },
  {
    id: 'ins_2',
    title: 'Staffing Shortage impacting Indiranagar',
    finding: 'Indiranagar outlet is experiencing negative growth (-13.95%) strongly correlated with staff absenteeism.',
    evidence: ['Average shift fill rate is 78% (Target: 95%)', 'Average order preparation time increased by 8 minutes', 'Customer complaints regarding slow service increased by 40%'],
    possible_causes: ['Recent departure of 2 senior chefs', 'High reliance on temporary staff causing operational friction'],
    recommendation: 'Deploy float staff from Gachibowli to Indiranagar for the weekend. Initiate urgent hiring for 2 senior chefs.',
    confidence: 0.92,
    priority: 'Critical',
    related_outlet_id: 'out_2',
    related_agent: 'Staff Agent',
    created_at: formatISO(subDays(new Date(), 2))
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_1',
    title: 'Deploy float staff to Indiranagar',
    description: 'Temporarily transfer 3 experienced staff members from well-performing outlets to Indiranagar to stabilize operations.',
    reason: 'Staff shortage is directly impacting service times and revenue (-13.95% MoM).',
    supporting_metrics: ['Shift fill rate: 78%', 'Prep time: +8m', 'Revenue: -13.95%'],
    related_outlet_id: 'out_2',
    related_agent: 'Staff Agent',
    priority: 'Critical',
    status: 'New',
    created_at: formatISO(subDays(new Date(), 2)),
    updated_at: formatISO(subDays(new Date(), 2)),
  },
  {
    id: 'rec_2',
    title: 'Run Zomato/Swiggy Promo for Koregaon Park',
    description: 'Activate a 20% off promotion on delivery aggregators specifically for the Koregaon Park radius.',
    reason: 'Dine-in traffic is down due to external factors; need to pivot to delivery to meet targets.',
    supporting_metrics: ['Dine-in footfall: -12%', 'Target achievement: 72.5%'],
    related_outlet_id: 'out_5',
    related_agent: 'Marketing Agent',
    priority: 'High',
    status: 'Approved',
    created_at: formatISO(subDays(new Date(), 1)),
    updated_at: formatISO(new Date()),
  }
];

export const mockAlerts: Alert[] = [
  { id: 'alt_1', type: 'Revenue Decline', priority: 'Critical', outlet_id: 'out_2', description: 'Indiranagar revenue dropped below 80% target threshold.', created_at: formatISO(subDays(new Date(), 2)), status: 'Acknowledged' },
  { id: 'alt_2', type: 'Inventory Shortage', priority: 'High', outlet_id: 'out_5', description: 'Basmati Rice stock below 2 days cover in Koregaon Park.', created_at: formatISO(subDays(new Date(), 1)), status: 'New' },
  { id: 'alt_3', type: 'Compliance Violation', priority: 'Medium', outlet_id: 'out_4', description: 'Bandra outlet failed kitchen hygiene spot audit (Score: 65/100).', created_at: formatISO(new Date()), status: 'New' },
];

export const mockAgentRuns: AgentRun[] = [
  { id: 'run_1', agent: 'Outlet Performance Agent', task: 'Analyze EOD Sales Data', start_time: formatISO(subDays(new Date(), 0.1)), end_time: formatISO(subDays(new Date(), 0.09)), status: 'Completed', input: 'Batch: 2023-10-24', output: 'Analyzed 7 outlets. Found 2 anomalies.' },
  { id: 'run_2', agent: 'Franchise Intelligence Engine', task: 'Cross-domain correlation analysis', start_time: formatISO(subDays(new Date(), 0.05)), end_time: formatISO(subDays(new Date(), 0.03)), status: 'Completed', input: 'Data streams: Perf, Inv, Staff', output: 'Generated 2 new insights.' },
  { id: 'run_3', agent: 'Inventory Agent', task: 'Predictive Stock Depletion', start_time: formatISO(new Date()), status: 'Running', input: 'Current stock levels vs Weekend forecast' }
];

export const mockTrendData = [
  { date: 'Oct 01', revenue: 54000, target: 60000 },
  { date: 'Oct 05', revenue: 62000, target: 60000 },
  { date: 'Oct 10', revenue: 58000, target: 60000 },
  { date: 'Oct 15', revenue: 75000, target: 65000 },
  { date: 'Oct 20', revenue: 68000, target: 65000 },
  { date: 'Oct 25', revenue: 82000, target: 70000 },
];
