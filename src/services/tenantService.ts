import { 
  BusinessProfile, 
  BusinessMember, 
  SalesRecord, 
  InventoryRecord, 
  StaffRecord, 
  MarketingRecord, 
  AuditRecord, 
  AgentRunLog, 
  BusinessSetupProgress, 
  DataQualityReport,
  Outlet
} from '../types';
import { mockOutlets, mockPerformances } from './mockData';

const ACTIVE_BIZ_KEY = 'franchiseops_active_business_id';
const BUSINESSES_KEY = 'franchiseops_businesses';
const OUTLETS_KEY_PREFIX = 'franchiseops_outlets_';
const SALES_KEY_PREFIX = 'franchiseops_sales_';
const INVENTORY_KEY_PREFIX = 'franchiseops_inventory_';
const STAFF_KEY_PREFIX = 'franchiseops_staff_';
const MARKETING_KEY_PREFIX = 'franchiseops_marketing_';
const AUDITS_KEY_PREFIX = 'franchiseops_audits_';
const MEMBERS_KEY_PREFIX = 'franchiseops_members_';
const ACTIVITY_KEY_PREFIX = 'franchiseops_activity_';

// Initial default business
const DEFAULT_BUSINESS: BusinessProfile = {
  id: 'biz_biryani_hub_01',
  name: 'Biryani Hub Franchise Group',
  industry: 'Restaurant',
  business_type: 'Quick Service & Dine-in Chain',
  description: 'Regional multi-unit culinary brand specializing in authentic Hyderabadi & Coastal biryani across South India.',
  website: 'https://biryanihub.example.com',
  country: 'India',
  state: 'Telangana',
  city: 'Hyderabad',
  contact_email: 'ops@biryanihub.com',
  contact_phone: '+91 98765 43210',
  currency: 'INR',
  created_at: '2023-01-15T09:00:00Z',
  total_outlets_count: 7,
};

// Initial default members
const DEFAULT_MEMBERS: BusinessMember[] = [
  {
    id: 'mem_1',
    business_id: 'biz_biryani_hub_01',
    name: 'Vijay Kumar',
    email: 'vijay@biryanihub.com',
    role: 'Business Owner',
    assigned_outlet_ids: ['out_1', 'out_2', 'out_3', 'out_4', 'out_5', 'out_6', 'out_7'],
    status: 'Active',
    joined_at: '2023-01-15',
  },
  {
    id: 'mem_2',
    business_id: 'biz_biryani_hub_01',
    name: 'Rahul Sharma',
    email: 'rahul.s@biryanihub.com',
    role: 'Franchise Manager',
    assigned_outlet_ids: ['out_1', 'out_2', 'out_3'],
    status: 'Active',
    joined_at: '2023-03-10',
  },
  {
    id: 'mem_3',
    business_id: 'biz_biryani_hub_01',
    name: 'Priya Sundaram',
    email: 'priya.s@biryanihub.com',
    role: 'Outlet Manager',
    assigned_outlet_ids: ['out_3'],
    status: 'Active',
    joined_at: '2023-04-01',
  },
];

/**
 * Get all registered business profiles
 */
export function getAllBusinesses(): BusinessProfile[] {
  try {
    const raw = localStorage.getItem(BUSINESSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse businesses from storage:', e);
  }
  // Initialize default
  localStorage.setItem(BUSINESSES_KEY, JSON.stringify([DEFAULT_BUSINESS]));
  return [DEFAULT_BUSINESS];
}

/**
 * Get currently active tenant business
 */
export function getActiveBusiness(): BusinessProfile {
  const businesses = getAllBusinesses();
  const activeId = localStorage.getItem(ACTIVE_BIZ_KEY);
  const found = businesses.find((b) => b.id === activeId);
  if (found) return found;
  
  // Default to first business
  const fallback = businesses[0] || DEFAULT_BUSINESS;
  localStorage.setItem(ACTIVE_BIZ_KEY, fallback.id);
  return fallback;
}

/**
 * Switch active business tenant
 */
export function setActiveBusiness(business: BusinessProfile) {
  localStorage.setItem(ACTIVE_BIZ_KEY, business.id);
  window.dispatchEvent(new CustomEvent('franchiseops_tenant_changed', { detail: business }));
}

/**
 * Create a new business tenant and set as active
 */
export function createBusiness(data: Omit<BusinessProfile, 'id' | 'created_at' | 'total_outlets_count'>): BusinessProfile {
  const businesses = getAllBusinesses();
  const newBusiness: BusinessProfile = {
    ...data,
    id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    total_outlets_count: 0,
  };

  const updated = [...businesses, newBusiness];
  localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated));
  setActiveBusiness(newBusiness);

  // Initialize business owner member
  const ownerMember: BusinessMember = {
    id: `mem_${Date.now()}`,
    business_id: newBusiness.id,
    name: 'Business Owner',
    email: data.contact_email || 'owner@franchiseops.ai',
    role: 'Business Owner',
    assigned_outlet_ids: [],
    status: 'Active',
    joined_at: new Date().toISOString().split('T')[0],
  };
  localStorage.setItem(MEMBERS_KEY_PREFIX + newBusiness.id, JSON.stringify([ownerMember]));

  return newBusiness;
}

/**
 * Update business profile details
 */
export function updateBusinessProfile(businessId: string, updates: Partial<BusinessProfile>): BusinessProfile {
  const businesses = getAllBusinesses();
  const updated = businesses.map((b) => (b.id === businessId ? { ...b, ...updates } : b));
  localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated));
  
  const current = updated.find((b) => b.id === businessId) || DEFAULT_BUSINESS;
  if (getActiveBusiness().id === businessId) {
    setActiveBusiness(current);
  }
  return current;
}

// -------------------------------------------------------------
// OUTLETS MANAGEMENT (Scoped to Business)
// -------------------------------------------------------------

export function getTenantOutlets(businessId: string): Outlet[] {
  try {
    const raw = localStorage.getItem(OUTLETS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // If default business, seed with mockOutlets
  if (businessId === DEFAULT_BUSINESS.id) {
    localStorage.setItem(OUTLETS_KEY_PREFIX + businessId, JSON.stringify(mockOutlets));
    return mockOutlets;
  }
  return [];
}

export function saveTenantOutlets(businessId: string, outlets: Outlet[]) {
  localStorage.setItem(OUTLETS_KEY_PREFIX + businessId, JSON.stringify(outlets));
  updateBusinessProfile(businessId, { total_outlets_count: outlets.length });
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'outlets', businessId } }));
}

export function addTenantOutlet(businessId: string, outletData: Omit<Outlet, 'id' | 'franchise_id'>): Outlet {
  const outlets = getTenantOutlets(businessId);
  const newOutlet: Outlet = {
    ...outletData,
    id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    franchise_id: businessId,
  };
  const updated = [...outlets, newOutlet];
  saveTenantOutlets(businessId, updated);
  logTenantActivity(businessId, 'Outlet Performance Agent', `Added new outlet: ${newOutlet.name} (${newOutlet.city})`);
  return newOutlet;
}

export function updateTenantOutlet(businessId: string, outlet: Outlet): Outlet {
  const outlets = getTenantOutlets(businessId);
  const updated = outlets.map((o) => (o.id === outlet.id ? outlet : o));
  saveTenantOutlets(businessId, updated);
  return outlet;
}

export function deleteTenantOutlet(businessId: string, outletId: string) {
  const outlets = getTenantOutlets(businessId);
  const updated = outlets.filter((o) => o.id !== outletId);
  saveTenantOutlets(businessId, updated);
}

// -------------------------------------------------------------
// SALES RECORDS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantSales(businessId: string): SalesRecord[] {
  try {
    const raw = localStorage.getItem(SALES_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Seed default sales for default business
  if (businessId === DEFAULT_BUSINESS.id) {
    const defaultSales: SalesRecord[] = mockPerformances.map((p, idx) => {
      const out = mockOutlets.find((o) => o.id === p.outlet_id);
      return {
        id: `sale_${idx + 1}`,
        business_id: businessId,
        outlet_id: p.outlet_id,
        outlet_name: out?.name || 'Biryani Hub',
        date: '2023-10-31',
        revenue: p.revenue,
        orders: p.orders,
        customers: p.customers,
        aov: p.aov,
        target_revenue: p.target_revenue,
        product_category: 'Biryani & Combos',
        created_at: '2023-10-31T20:00:00Z',
      };
    });
    localStorage.setItem(SALES_KEY_PREFIX + businessId, JSON.stringify(defaultSales));
    return defaultSales;
  }
  return [];
}

export function saveTenantSales(businessId: string, sales: SalesRecord[]) {
  localStorage.setItem(SALES_KEY_PREFIX + businessId, JSON.stringify(sales));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'sales', businessId } }));
}

export function addTenantSales(businessId: string, record: Omit<SalesRecord, 'id' | 'business_id' | 'created_at'>): SalesRecord {
  const sales = getTenantSales(businessId);
  const newRecord: SalesRecord = {
    ...record,
    id: `sale_${Date.now()}`,
    business_id: businessId,
    created_at: new Date().toISOString(),
  };
  saveTenantSales(businessId, [newRecord, ...sales]);
  logTenantActivity(businessId, 'Outlet Performance Agent', `Ingested sales log for ${record.outlet_name}: ₹${record.revenue.toLocaleString()}`);
  return newRecord;
}

export function importSalesBatch(businessId: string, records: Omit<SalesRecord, 'id' | 'business_id' | 'created_at'>[]): number {
  const sales = getTenantSales(businessId);
  const newBatch: SalesRecord[] = records.map((r, i) => ({
    ...r,
    id: `sale_imp_${Date.now()}_${i}`,
    business_id: businessId,
    created_at: new Date().toISOString(),
  }));
  saveTenantSales(businessId, [...newBatch, ...sales]);
  logTenantActivity(businessId, 'Outlet Performance Agent', `CSV batch import: ${records.length} sales records loaded successfully`);
  return records.length;
}

// -------------------------------------------------------------
// INVENTORY RECORDS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantInventory(businessId: string): InventoryRecord[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Seed default inventory
  if (businessId === DEFAULT_BUSINESS.id) {
    const defaultInventory: InventoryRecord[] = [
      {
        id: 'inv_1',
        business_id: businessId,
        outlet_id: 'out_1',
        outlet_name: 'Biryani Hub - Gachibowli',
        product_name: 'Basmati Rice (Aged Royal)',
        sku: 'RICE-BAS-01',
        category: 'Grains & Staples',
        current_stock: 480,
        min_stock: 200,
        max_stock: 800,
        daily_consumption: 65,
        waste_qty: 2,
        unit: 'kg',
        supplier: 'Telangana Agri Supply Hub',
        last_restocked: '2023-10-25',
        status: 'In Stock',
      },
      {
        id: 'inv_2',
        business_id: businessId,
        outlet_id: 'out_5',
        outlet_name: 'Biryani Hub - KP',
        product_name: 'Shahi Biryani Spice Blend (Secret Masala)',
        sku: 'SPICE-SHA-09',
        category: 'Spices & Flavors',
        current_stock: 14,
        min_stock: 50,
        max_stock: 150,
        daily_consumption: 12,
        waste_qty: 0,
        unit: 'kg',
        supplier: 'Deccan Spice Exporters',
        last_restocked: '2023-10-12',
        status: 'Stockout Risk',
      },
      {
        id: 'inv_3',
        business_id: businessId,
        outlet_id: 'out_4',
        outlet_name: 'Biryani Hub - Bandra',
        product_name: 'Fresh Free-Range Chicken',
        sku: 'MEAT-CHK-01',
        category: 'Poultry & Meat',
        current_stock: 180,
        min_stock: 100,
        max_stock: 350,
        daily_consumption: 75,
        waste_qty: 4,
        unit: 'kg',
        supplier: 'Mumbai Fresh Halal Farms',
        last_restocked: '2023-10-30',
        status: 'In Stock',
      },
      {
        id: 'inv_4',
        business_id: businessId,
        outlet_id: 'out_2',
        outlet_name: 'Biryani Hub - Indiranagar',
        product_name: 'Pure Desi Ghee (Tin)',
        sku: 'DAIRY-GHEE-05',
        category: 'Dairy',
        current_stock: 28,
        min_stock: 40,
        max_stock: 120,
        daily_consumption: 8,
        waste_qty: 0,
        unit: 'litres',
        supplier: 'Nandini Dairy Logistics',
        last_restocked: '2023-10-18',
        status: 'Low Stock',
      },
    ];
    localStorage.setItem(INVENTORY_KEY_PREFIX + businessId, JSON.stringify(defaultInventory));
    return defaultInventory;
  }
  return [];
}

export function saveTenantInventory(businessId: string, inventory: InventoryRecord[]) {
  localStorage.setItem(INVENTORY_KEY_PREFIX + businessId, JSON.stringify(inventory));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'inventory', businessId } }));
}

export function addTenantInventory(businessId: string, record: Omit<InventoryRecord, 'id' | 'business_id'>): InventoryRecord {
  const inventory = getTenantInventory(businessId);
  const newRecord: InventoryRecord = {
    ...record,
    id: `inv_${Date.now()}`,
    business_id: businessId,
  };
  saveTenantInventory(businessId, [newRecord, ...inventory]);
  logTenantActivity(businessId, 'Inventory Agent', `Added inventory item: ${record.product_name} at ${record.outlet_name}`);
  return newRecord;
}

// -------------------------------------------------------------
// STAFF RECORDS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantStaff(businessId: string): StaffRecord[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  if (businessId === DEFAULT_BUSINESS.id) {
    const defaultStaff: StaffRecord[] = [
      {
        id: 'stf_1',
        business_id: businessId,
        outlet_id: 'out_1',
        outlet_name: 'Biryani Hub - Gachibowli',
        employee_name: 'Ramesh Reddy',
        role: 'Head Chef & Kitchen Lead',
        attendance_pct: 98,
        hours_worked: 196,
        performance_score: 94,
        sales_contribution: 620000,
        status: 'Active',
      },
      {
        id: 'stf_2',
        business_id: businessId,
        outlet_id: 'out_2',
        outlet_name: 'Biryani Hub - Indiranagar',
        employee_name: 'Sunil Rao',
        role: 'Senior Sous Chef',
        attendance_pct: 72,
        hours_worked: 140,
        performance_score: 68,
        sales_contribution: 380000,
        status: 'On Leave',
      },
      {
        id: 'stf_3',
        business_id: businessId,
        outlet_id: 'out_4',
        outlet_name: 'Biryani Hub - Bandra',
        employee_name: 'Farhan Sheikh',
        role: 'Front-of-House Lead',
        attendance_pct: 96,
        hours_worked: 188,
        performance_score: 92,
        sales_contribution: 890000,
        status: 'Active',
      },
    ];
    localStorage.setItem(STAFF_KEY_PREFIX + businessId, JSON.stringify(defaultStaff));
    return defaultStaff;
  }
  return [];
}

export function saveTenantStaff(businessId: string, staff: StaffRecord[]) {
  localStorage.setItem(STAFF_KEY_PREFIX + businessId, JSON.stringify(staff));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'staff', businessId } }));
}

export function addTenantStaff(businessId: string, record: Omit<StaffRecord, 'id' | 'business_id'>): StaffRecord {
  const staff = getTenantStaff(businessId);
  const newRecord: StaffRecord = {
    ...record,
    id: `stf_${Date.now()}`,
    business_id: businessId,
  };
  saveTenantStaff(businessId, [newRecord, ...staff]);
  logTenantActivity(businessId, 'Staff Agent', `Registered team member: ${record.employee_name} (${record.role})`);
  return newRecord;
}

// -------------------------------------------------------------
// MARKETING RECORDS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantMarketing(businessId: string): MarketingRecord[] {
  try {
    const raw = localStorage.getItem(MARKETING_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  if (businessId === DEFAULT_BUSINESS.id) {
    const defaultMarketing: MarketingRecord[] = [
      {
        id: 'mkt_1',
        business_id: businessId,
        outlet_id: 'out_4',
        outlet_name: 'Biryani Hub - Bandra',
        campaign_name: 'Mumbai Weekend Biryani Carnival',
        campaign_type: 'Social',
        start_date: '2023-10-01',
        end_date: '2023-10-31',
        budget: 150000,
        spend: 142000,
        customers_acquired: 1480,
        revenue_generated: 795000,
        roi: 459.8,
        conversion_rate: 6.4,
        status: 'Completed',
      },
      {
        id: 'mkt_2',
        business_id: businessId,
        outlet_id: 'out_5',
        outlet_name: 'Biryani Hub - KP',
        campaign_name: 'Pune IT Park Lunch Express Discount',
        campaign_type: 'Local Delivery',
        start_date: '2023-10-15',
        end_date: '2023-11-15',
        budget: 80000,
        spend: 45000,
        customers_acquired: 390,
        revenue_generated: 182000,
        roi: 304.4,
        conversion_rate: 3.8,
        status: 'Active',
      },
    ];
    localStorage.setItem(MARKETING_KEY_PREFIX + businessId, JSON.stringify(defaultMarketing));
    return defaultMarketing;
  }
  return [];
}

export function saveTenantMarketing(businessId: string, marketing: MarketingRecord[]) {
  localStorage.setItem(MARKETING_KEY_PREFIX + businessId, JSON.stringify(marketing));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'marketing', businessId } }));
}

export function addTenantMarketing(businessId: string, record: Omit<MarketingRecord, 'id' | 'business_id' | 'roi'>): MarketingRecord {
  const marketing = getTenantMarketing(businessId);
  const roi = record.spend > 0 ? ((record.revenue_generated - record.spend) / record.spend) * 100 : 0;
  const newRecord: MarketingRecord = {
    ...record,
    id: `mkt_${Date.now()}`,
    business_id: businessId,
    roi: Math.round(roi * 10) / 10,
  };
  saveTenantMarketing(businessId, [newRecord, ...marketing]);
  logTenantActivity(businessId, 'Marketing Agent', `Launched campaign: ${record.campaign_name} for ${record.outlet_name}`);
  return newRecord;
}

// -------------------------------------------------------------
// AUDIT RECORDS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantAudits(businessId: string): AuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDITS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  if (businessId === DEFAULT_BUSINESS.id) {
    const defaultAudits: AuditRecord[] = [
      {
        id: 'aud_1',
        business_id: businessId,
        outlet_id: 'out_1',
        outlet_name: 'Biryani Hub - Gachibowli',
        audit_date: '2023-10-22',
        category: 'Food Safety',
        compliance_score: 96,
        issue: 'Cold storage thermometer log calibration required verification',
        severity: 'Low',
        corrective_action: 'Calibrated temperature probe and updated weekly checklist',
        responsible_person: 'Ramesh Reddy',
        resolution_status: 'Resolved',
      },
      {
        id: 'aud_2',
        business_id: businessId,
        outlet_id: 'out_2',
        outlet_name: 'Biryani Hub - Indiranagar',
        audit_date: '2023-10-26',
        category: 'Service Speed',
        compliance_score: 64,
        issue: 'Dinner peak ticket fulfillment latency reached 22 mins (SOP standard: max 14 mins)',
        severity: 'High',
        corrective_action: 'Allocate float sous chef from regional hub and streamline prep stations',
        responsible_person: 'Karthik Raja',
        resolution_status: 'In Progress',
      },
    ];
    localStorage.setItem(AUDITS_KEY_PREFIX + businessId, JSON.stringify(defaultAudits));
    return defaultAudits;
  }
  return [];
}

export function saveTenantAudits(businessId: string, audits: AuditRecord[]) {
  localStorage.setItem(AUDITS_KEY_PREFIX + businessId, JSON.stringify(audits));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'audits', businessId } }));
}

export function addTenantAudit(businessId: string, record: Omit<AuditRecord, 'id' | 'business_id'>): AuditRecord {
  const audits = getTenantAudits(businessId);
  const newRecord: AuditRecord = {
    ...record,
    id: `aud_${Date.now()}`,
    business_id: businessId,
  };
  saveTenantAudits(businessId, [newRecord, ...audits]);
  logTenantActivity(businessId, 'Audit Agent', `Recorded audit finding for ${record.outlet_name}: Compliance ${record.compliance_score}%`);
  return newRecord;
}

// -------------------------------------------------------------
// TEAM MEMBERS MANAGEMENT (Scoped to Business)
// -------------------------------------------------------------

export function getTenantMembers(businessId: string): BusinessMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  if (businessId === DEFAULT_BUSINESS.id) {
    localStorage.setItem(MEMBERS_KEY_PREFIX + businessId, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
  }
  return [];
}

export function inviteTenantMember(businessId: string, memberData: Omit<BusinessMember, 'id' | 'business_id' | 'joined_at' | 'status'>): BusinessMember {
  const members = getTenantMembers(businessId);
  const newMember: BusinessMember = {
    ...memberData,
    id: `mem_${Date.now()}`,
    business_id: businessId,
    status: 'Active',
    joined_at: new Date().toISOString().split('T')[0],
  };
  const updated = [...members, newMember];
  localStorage.setItem(MEMBERS_KEY_PREFIX + businessId, JSON.stringify(updated));
  logTenantActivity(businessId, 'Franchise Intelligence Engine', `Added team member ${newMember.name} with role '${newMember.role}'`);
  return newMember;
}

// -------------------------------------------------------------
// ACTIVITY LOGGING (Scoped to Business)
// -------------------------------------------------------------

export function getTenantActivityLogs(businessId: string): AgentRunLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  const defaultLogs: AgentRunLog[] = [
    {
      id: 'log_1',
      business_id: businessId,
      agent_name: 'Franchise Intelligence Engine',
      task: 'Cross-Domain Diagnostic Scan & Anomaly Correlation',
      status: 'Completed',
      start_time: '15m ago',
      end_time: '14m ago',
      findings_count: 3,
      summary: 'Correlated Pune revenue contraction (-17.1%) with spice blend stockout and Indiranagar chef shortages.',
    },
    {
      id: 'log_2',
      business_id: businessId,
      agent_name: 'Outlet Performance Agent',
      task: 'Automated 4-Factor Health Score & Benchmark Evaluation',
      status: 'Completed',
      start_time: '1h ago',
      end_time: '1h ago',
      findings_count: 7,
      summary: 'Calculated deterministic health scores across all 7 outlets (Network Avg: 79/100).',
    },
  ];
  return defaultLogs;
}

export function logTenantActivity(
  businessId: string, 
  agentName: AgentRunLog['agent_name'], 
  summary: string, 
  findingsCount: number = 1
) {
  const logs = getTenantActivityLogs(businessId);
  const newLog: AgentRunLog = {
    id: `log_${Date.now()}`,
    business_id: businessId,
    agent_name: agentName,
    task: summary,
    status: 'Completed',
    start_time: 'Just now',
    end_time: 'Just now',
    findings_count: findingsCount,
    summary,
  };
  localStorage.setItem(ACTIVITY_KEY_PREFIX + businessId, JSON.stringify([newLog, ...logs.slice(0, 49)]));
}

// -------------------------------------------------------------
// BUSINESS SETUP PROGRESS & HEALTH SCORE CALCULATOR
// -------------------------------------------------------------

export function calculateBusinessSetupProgress(businessId: string): BusinessSetupProgress {
  const profile = getActiveBusiness();
  const outlets = getTenantOutlets(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const marketing = getTenantMarketing(businessId);
  const audits = getTenantAudits(businessId);

  const profileScore = profile.name && profile.industry && profile.city ? 100 : 50;
  const outletsScore = outlets.length >= 1 ? 100 : 0;
  const salesScore = sales.length >= 1 ? 100 : 0;
  const inventoryScore = inventory.length >= 2 ? 100 : inventory.length === 1 ? 50 : 0;
  const staffScore = staff.length >= 2 ? 100 : staff.length === 1 ? 50 : 0;
  const marketingScore = marketing.length >= 1 ? 100 : 0;
  const auditsScore = audits.length >= 1 ? 100 : 0;

  // Weightings: Profile (15%), Outlets (25%), Sales (25%), Inventory (15%), Staff (10%), Marketing (5%), Audits (5%)
  const overall = Math.round(
    profileScore * 0.15 +
    outletsScore * 0.25 +
    salesScore * 0.25 +
    inventoryScore * 0.15 +
    staffScore * 0.10 +
    marketingScore * 0.05 +
    auditsScore * 0.05
  );

  let readinessMessage = 'Add more operational streams for deeper AI cross-domain analysis.';
  if (overall >= 90) readinessMessage = 'Your business is fully primed for high-precision autonomous AI recommendations.';
  else if (overall >= 70) readinessMessage = 'Strong data foundation. Upload marketing & audit data to unlock 360° AI synthesis.';
  else if (overall >= 40) readinessMessage = 'Basic setup completed. Add inventory & staff data to detect root-cause friction.';

  return {
    overallPercentage: overall,
    steps: {
      profile: { completed: profileScore === 100, score: profileScore },
      outlets: { completed: outlets.length > 0, count: outlets.length, score: outletsScore },
      sales: { completed: sales.length > 0, recordCount: sales.length, score: salesScore },
      inventory: { completed: inventory.length > 0, recordCount: inventory.length, score: inventoryScore },
      staff: { completed: staff.length > 0, recordCount: staff.length, score: staffScore },
      marketing: { completed: marketing.length > 0, recordCount: marketing.length, score: marketingScore },
      audits: { completed: audits.length > 0, recordCount: audits.length, score: auditsScore },
    },
    readinessMessage,
  };
}

/**
 * Calculates overall business health score across all 5 operational pillars
 */
export function calculateOverallBusinessHealthScore(businessId: string): {
  score: number;
  status: 'Excellent' | 'Healthy' | 'At Risk' | 'Critical';
  pillars: { name: string; score: number; max: number; weight: string }[];
  strengths: string[];
  risks: string[];
} {
  const outlets = getTenantOutlets(businessId);
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const marketing = getTenantMarketing(businessId);
  const audits = getTenantAudits(businessId);

  // Pillar 1: Sales Performance (Weight: 35)
  const targetAchTotal = sales.length > 0 
    ? sales.reduce((s, r) => s + (r.target_revenue > 0 ? (r.revenue / r.target_revenue) * 100 : 90), 0) / sales.length 
    : 85;
  const salesPillarScore = Math.min(35, Math.max(0, (targetAchTotal / 100) * 35));

  // Pillar 2: Operational Health & Outlets (Weight: 25)
  const activeOutletsPct = outlets.length > 0 ? (outlets.filter(o => o.status === 'Active').length / outlets.length) * 100 : 100;
  const outletPillarScore = Math.min(25, Math.max(0, (activeOutletsPct / 100) * 25));

  // Pillar 3: Inventory Reliability (Weight: 15)
  const stockoutCount = inventory.filter(i => i.status === 'Stockout Risk').length;
  const inventoryPillarScore = Math.max(5, 15 - (stockoutCount * 5));

  // Pillar 4: Workforce & Staff Efficiency (Weight: 15)
  const avgAttendance = staff.length > 0 ? staff.reduce((s, m) => s + m.attendance_pct, 0) / staff.length : 88;
  const staffPillarScore = Math.min(15, Math.max(0, (avgAttendance / 100) * 15));

  // Pillar 5: Compliance & Audits (Weight: 10)
  const avgAudit = audits.length > 0 ? audits.reduce((s, a) => s + a.compliance_score, 0) / audits.length : 80;
  const auditPillarScore = Math.min(10, Math.max(0, (avgAudit / 100) * 10));

  const totalScore = Math.round(salesPillarScore + outletPillarScore + inventoryPillarScore + staffPillarScore + auditPillarScore);

  let status: 'Excellent' | 'Healthy' | 'At Risk' | 'Critical' = 'Healthy';
  if (totalScore >= 90) status = 'Excellent';
  else if (totalScore >= 75) status = 'Healthy';
  else if (totalScore >= 60) status = 'At Risk';
  else status = 'Critical';

  const strengths: string[] = [];
  if (salesPillarScore >= 30) strengths.push('Strong target achievement rate across top metropolitan units');
  if (outletPillarScore >= 24) strengths.push('100% active operational uptime across franchise network');
  if (staffPillarScore >= 13) strengths.push('High workforce attendance in flagship locations');

  const risks: string[] = [];
  if (stockoutCount > 0) risks.push(`Critical stockout risk detected for key recipes in ${stockoutCount} outlet(s)`);
  if (avgAttendance < 80) risks.push('Kitchen staff absenteeism causing order preparation bottlenecks');
  if (totalScore < 75) risks.push('Trailing network pacing targets in secondary tier markets');

  return {
    score: totalScore,
    status,
    pillars: [
      { name: 'Sales & Revenue Pacing', score: Math.round(salesPillarScore), max: 35, weight: '35%' },
      { name: 'Outlet Network Uptime', score: Math.round(outletPillarScore), max: 25, weight: '25%' },
      { name: 'Inventory & Supply Health', score: Math.round(inventoryPillarScore), max: 15, weight: '15%' },
      { name: 'Workforce Performance', score: Math.round(staffPillarScore), max: 15, weight: '15%' },
      { name: 'Operational Compliance', score: Math.round(auditPillarScore), max: 10, weight: '10%' },
    ],
    strengths,
    risks,
  };
}

/**
 * Evaluates tenant data quality and freshness
 */
export function getTenantDataQualityReport(businessId: string): DataQualityReport {
  const sales = getTenantSales(businessId);
  const inventory = getTenantInventory(businessId);
  const staff = getTenantStaff(businessId);
  const marketing = getTenantMarketing(businessId);
  const audits = getTenantAudits(businessId);

  const totalRecords = sales.length + inventory.length + staff.length + marketing.length + audits.length;
  const warnings: string[] = [];

  if (sales.length === 0) warnings.push('No sales records registered. Outlet Performance Agent requires sales data.');
  if (inventory.length === 0) warnings.push('No inventory records found. Add stock data to enable predictive stockout alerts.');
  if (staff.length === 0) warnings.push('Staff workforce data not configured. Staff Agent running in passive mode.');

  const missingValuesCount = inventory.filter(i => !i.min_stock || !i.supplier).length;
  const qualityScore = Math.max(30, Math.min(100, 100 - (warnings.length * 15) - (missingValuesCount * 2)));

  return {
    overallQualityScore: qualityScore,
    freshnessDays: 1,
    totalRecordsCount: totalRecords,
    missingValuesCount,
    duplicatesCount: 0,
    warnings,
  };
}

/**
 * Seeds sample franchise operational data for a newly created business
 */
export function seedDemoDataForBusiness(businessId: string, businessName: string) {
  const sampleOutlets: Outlet[] = [
    {
      id: `out_${Date.now()}_1`,
      franchise_id: businessId,
      name: `${businessName} - Downtown Flagship`,
      location: '100 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      manager_name: 'Rajesh Nair',
      status: 'Active',
    },
    {
      id: `out_${Date.now()}_2`,
      franchise_id: businessId,
      name: `${businessName} - Tech Park Express`,
      location: 'Cyber Gateway',
      city: 'Hyderabad',
      state: 'Telangana',
      manager_name: 'Anita Verma',
      status: 'Active',
    },
    {
      id: `out_${Date.now()}_3`,
      franchise_id: businessId,
      name: `${businessName} - Metro Galleria`,
      location: 'South Extension',
      city: 'Delhi NCR',
      state: 'Delhi',
      manager_name: 'Vikram Singh',
      status: 'Active',
    },
  ];
  saveTenantOutlets(businessId, sampleOutlets);

  const sampleSales: SalesRecord[] = sampleOutlets.map((o, idx) => ({
    id: `sale_${Date.now()}_${idx}`,
    business_id: businessId,
    outlet_id: o.id,
    outlet_name: o.name,
    date: new Date().toISOString().split('T')[0],
    revenue: idx === 0 ? 2850000 : idx === 1 ? 1920000 : 1450000,
    orders: idx === 0 ? 5400 : idx === 1 ? 3800 : 2900,
    customers: idx === 0 ? 4900 : idx === 1 ? 3300 : 2500,
    aov: idx === 0 ? 528 : idx === 1 ? 505 : 500,
    target_revenue: idx === 0 ? 2700000 : idx === 1 ? 2000000 : 1800000,
    product_category: 'Core Offerings',
    created_at: new Date().toISOString(),
  }));
  saveTenantSales(businessId, sampleSales);

  const sampleInventory: InventoryRecord[] = [
    {
      id: `inv_${Date.now()}_1`,
      business_id: businessId,
      outlet_id: sampleOutlets[0].id,
      outlet_name: sampleOutlets[0].name,
      product_name: 'Premium Raw Material Unit A',
      sku: 'SKU-PRM-01',
      category: 'Primary Ingredients',
      current_stock: 450,
      min_stock: 150,
      max_stock: 600,
      daily_consumption: 40,
      waste_qty: 1,
      unit: 'kg',
      supplier: 'National Supply Co.',
      last_restocked: new Date().toISOString().split('T')[0],
      status: 'In Stock',
    },
    {
      id: `inv_${Date.now()}_2`,
      business_id: businessId,
      outlet_id: sampleOutlets[2].id,
      outlet_name: sampleOutlets[2].name,
      product_name: 'Key Specialty Ingredient B',
      sku: 'SKU-SPC-02',
      category: 'Signature Flavors',
      current_stock: 12,
      min_stock: 40,
      max_stock: 120,
      daily_consumption: 8,
      waste_qty: 0,
      unit: 'kg',
      supplier: 'Prime Regional Logistics',
      last_restocked: '2023-10-15',
      status: 'Stockout Risk',
    },
  ];
  saveTenantInventory(businessId, sampleInventory);

  const sampleStaff: StaffRecord[] = [
    {
      id: `stf_${Date.now()}_1`,
      business_id: businessId,
      outlet_id: sampleOutlets[0].id,
      outlet_name: sampleOutlets[0].name,
      employee_name: 'Suresh Kumar',
      role: 'Lead Supervisor',
      attendance_pct: 97,
      hours_worked: 190,
      performance_score: 95,
      sales_contribution: 680000,
      status: 'Active',
    },
    {
      id: `stf_${Date.now()}_2`,
      business_id: businessId,
      outlet_id: sampleOutlets[2].id,
      outlet_name: sampleOutlets[2].name,
      employee_name: 'Deepak Sharma',
      role: 'Floor Manager',
      attendance_pct: 74,
      hours_worked: 145,
      performance_score: 70,
      sales_contribution: 320000,
      status: 'Active',
    },
  ];
  saveTenantStaff(businessId, sampleStaff);

  const sampleAudits: AuditRecord[] = [
    {
      id: `aud_${Date.now()}_1`,
      business_id: businessId,
      outlet_id: sampleOutlets[0].id,
      outlet_name: sampleOutlets[0].name,
      audit_date: new Date().toISOString().split('T')[0],
      category: 'SOP & Cleanliness',
      compliance_score: 94,
      issue: 'Routine quarterly audit completed with 0 critical non-conformities',
      severity: 'Low',
      corrective_action: 'None required - maintain standard operating compliance',
      responsible_person: sampleOutlets[0].manager_name,
      resolution_status: 'Resolved',
    },
  ];
  saveTenantAudits(businessId, sampleAudits);

  logTenantActivity(businessId, 'Franchise Intelligence Engine', `Initialized business workspace with 3 outlets, sales stream, and operational baselines.`);
}
