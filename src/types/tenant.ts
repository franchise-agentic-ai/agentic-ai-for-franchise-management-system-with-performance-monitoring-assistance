export type IndustryType = 
  | 'Restaurant' 
  | 'Retail' 
  | 'Education' 
  | 'Healthcare' 
  | 'Fitness' 
  | 'Services' 
  | 'Hospitality' 
  | 'Other';

export type UserRole = 
  | 'Business Owner' 
  | 'Franchise Manager' 
  | 'Outlet Manager' 
  | 'Analyst';

export interface BusinessProfile {
  id: string;
  name: string;
  industry: IndustryType;
  business_type: string;
  description: string;
  website?: string;
  country: string;
  state: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  currency: string;
  logo_url?: string;
  created_at: string;
  total_outlets_count: number;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  name: string;
  email: string;
  role: UserRole;
  assigned_outlet_ids: string[];
  status: 'Active' | 'Pending' | 'Suspended';
  joined_at: string;
}

export interface SalesRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  aov: number;
  target_revenue: number;
  product_category?: string;
  created_at: string;
}

export interface InventoryRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  daily_consumption: number;
  waste_qty: number;
  unit: string;
  supplier: string;
  last_restocked: string;
  status: 'In Stock' | 'Low Stock' | 'Stockout Risk' | 'Overstocked';
}

export interface StaffRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  employee_name: string;
  role: string;
  attendance_pct: number;
  hours_worked: number;
  performance_score: number; // 0-100
  sales_contribution: number;
  status: 'Active' | 'On Leave' | 'Shift Complete';
}

export interface MarketingRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  campaign_name: string;
  campaign_type: 'Social' | 'Local Delivery' | 'Print & Billboard' | 'Influencer' | 'Email & SMS';
  start_date: string;
  end_date: string;
  budget: number;
  spend: number;
  customers_acquired: number;
  revenue_generated: number;
  roi: number; // calculated: (revenue - spend) / spend * 100
  conversion_rate: number;
  status: 'Active' | 'Completed' | 'Planned';
}

export interface AuditRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  audit_date: string;
  category: 'Food Safety' | 'SOP & Cleanliness' | 'Cash & POS' | 'Service Speed' | 'Branding';
  compliance_score: number; // 0-100
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  corrective_action: string;
  responsible_person: string;
  resolution_status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
}

export interface AgentRunLog {
  id: string;
  business_id: string;
  agent_name: 'Outlet Performance Agent' | 'Inventory Agent' | 'Staff Agent' | 'Marketing Agent' | 'Audit Agent' | 'Franchise Intelligence Engine';
  task: string;
  status: 'Running' | 'Completed' | 'Failed';
  start_time: string;
  end_time?: string;
  findings_count: number;
  summary: string;
}

export interface BusinessSetupProgress {
  overallPercentage: number;
  steps: {
    profile: { completed: boolean; score: number };
    outlets: { completed: boolean; count: number; score: number };
    sales: { completed: boolean; recordCount: number; score: number };
    inventory: { completed: boolean; recordCount: number; score: number };
    staff: { completed: boolean; recordCount: number; score: number };
    marketing: { completed: boolean; recordCount: number; score: number };
    audits: { completed: boolean; recordCount: number; score: number };
  };
  readinessMessage: string;
}

export interface DataQualityReport {
  overallQualityScore: number; // 0-100
  freshnessDays: number;
  totalRecordsCount: number;
  missingValuesCount: number;
  duplicatesCount: number;
  warnings: string[];
}

export interface CrossDomainInsight {
  id: string;
  business_id: string;
  title: string;
  headline: string;
  finding: string;
  primary_agent: string;
  correlated_agents: string[];
  evidence: string[];
  possible_causes: string[];
  business_impact: string;
  recommendation: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  related_outlet_id?: string;
  related_outlet_name?: string;
  created_at: string;
  status: 'Active' | 'Acknowledged' | 'Actioned';
}
