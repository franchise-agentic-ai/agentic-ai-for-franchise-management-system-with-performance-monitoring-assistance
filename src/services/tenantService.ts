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
  Outlet,
  InventoryItemEnhanced,
  InventoryMovement,
  SupplierItem,
  ProductItem,
  ReplenishmentRecommendation,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceiptPayload,
  StockTransfer,
  StockCountSession,
  StockCountItem,
  WastageRecord,
  InventoryAuditLogEntry,
  StockTransferStatus,
  PurchaseOrderStatus,
  VarianceReason,
  WastageReason,
  Employee,
  ShiftRecord,
  StaffingRequirement,
  StaffAgentInsight,
  MarketingCampaign,
  MarketingAgentInsight
} from '../types';
import { mockOutlets, mockPerformances } from './mockData';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_STAFFING_REQUIREMENTS } from './workforceData';
import { INITIAL_MARKETING_CAMPAIGNS } from './marketingData';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessId: string;
  businessName: string;
  role: 'Business Owner' | 'Franchise Manager' | 'Outlet Manager';
  createdAt: string;
}

const ACTIVE_BIZ_KEY = 'franchiseops_active_business_id';
const BUSINESSES_KEY = 'franchiseops_businesses';
const USERS_KEY = 'franchiseops_users';
const CURRENT_USER_KEY = 'franchiseops_current_user';
const OUTLETS_KEY_PREFIX = 'franchiseops_outlets_';
const SALES_KEY_PREFIX = 'franchiseops_sales_';
const INVENTORY_KEY_PREFIX = 'franchiseops_inventory_';
const INVENTORY_ENHANCED_KEY_PREFIX = 'franchiseops_inventory_enhanced_';
const MOVEMENTS_KEY_PREFIX = 'franchiseops_movements_';
const SUPPLIERS_KEY_PREFIX = 'franchiseops_suppliers_';
const PRODUCTS_KEY_PREFIX = 'franchiseops_products_';
const REPLENISHMENT_RECS_KEY_PREFIX = 'franchiseops_replenishment_recs_';
const PO_KEY_PREFIX = 'franchiseops_po_';
const TRANSFERS_KEY_PREFIX = 'franchiseops_transfers_';
const STOCK_COUNTS_KEY_PREFIX = 'franchiseops_stock_counts_';
const WASTAGE_KEY_PREFIX = 'franchiseops_wastage_';
const AUDIT_LOG_KEY_PREFIX = 'franchiseops_inv_audit_logs_';
const STAFF_KEY_PREFIX = 'franchiseops_staff_';
const EMPLOYEES_KEY_PREFIX = 'franchiseops_employees_v3_';
const SHIFTS_KEY_PREFIX = 'franchiseops_shifts_v3_';
const STAFFING_REQ_KEY_PREFIX = 'franchiseops_staffing_req_v3_';
const WORKFORCE_INSIGHTS_KEY_PREFIX = 'franchiseops_wf_insights_';
const MARKETING_KEY_PREFIX = 'franchiseops_marketing_';
const CAMPAIGNS_KEY_PREFIX = 'franchiseops_campaigns_adv_v3_';
const MARKETING_INSIGHTS_KEY_PREFIX = 'franchiseops_mkt_insights_';
const AUDITS_KEY_PREFIX = 'franchiseops_audits_';
const MEMBERS_KEY_PREFIX = 'franchiseops_members_';
const ACTIVITY_KEY_PREFIX = 'franchiseops_activity_';

// Initial default business
export const DEFAULT_BUSINESS: BusinessProfile = {
  id: 'biz_biryani_express_01',
  name: 'Biryani Express Group',
  industry: 'Restaurant',
  business_type: 'Quick Service & Dine-in Chain',
  description: 'Premium multi-outlet biryani & Indian culinary chain with smart centralized kitchen and automated inventory management.',
  website: 'https://biryaniexpress.example.com',
  country: 'India',
  state: 'Karnataka',
  city: 'Bengaluru',
  contact_email: 'ops@biryaniexpress.com',
  contact_phone: '+91 98765 43210',
  currency: 'INR',
  created_at: '2023-01-15T09:00:00Z',
  total_outlets_count: 3,
};

// Default Demo User Account
export const DEFAULT_DEMO_USER: UserAccount = {
  id: 'usr_demo_01',
  email: 'demo@biryaniexpress.com',
  password: 'password123',
  name: 'Vijay Kumar (Demo)',
  phone: '+91 98765 43210',
  businessId: 'biz_biryani_express_01',
  businessName: 'Biryani Express Group',
  role: 'Business Owner',
  createdAt: '2023-01-15T09:00:00Z',
};

// Initial default members
const DEFAULT_MEMBERS: BusinessMember[] = [
  {
    id: 'mem_1',
    business_id: 'biz_biryani_express_01',
    name: 'Vijay Kumar',
    email: 'vijay@biryaniexpress.com',
    role: 'Business Owner',
    assigned_outlet_ids: ['out_1', 'out_2', 'out_3'],
    status: 'Active',
    joined_at: '2023-01-15',
  },
  {
    id: 'mem_2',
    business_id: 'biz_biryani_express_01',
    name: 'Rahul Sharma',
    email: 'rahul.s@biryaniexpress.com',
    role: 'Franchise Manager',
    assigned_outlet_ids: ['out_1', 'out_2'],
    status: 'Active',
    joined_at: '2023-03-10',
  },
  {
    id: 'mem_3',
    business_id: 'biz_biryani_express_01',
    name: 'Priya Reddy',
    email: 'priya.r@biryaniexpress.com',
    role: 'Outlet Manager',
    assigned_outlet_ids: ['out_2', 'out_3'],
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
// USER ACCOUNTS & AUTHENTICATION
// -------------------------------------------------------------

/**
 * Get all registered user accounts
 */
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse users from storage:', e);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
  return [DEFAULT_DEMO_USER];
}

/**
 * Register a new business owner account
 */
export function registerUserAccount(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessId: string;
  businessName: string;
}): UserAccount {
  const users = getAllUsers();
  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: data.email.toLowerCase().trim(),
    password: data.password,
    name: data.name.trim(),
    phone: data.phone?.trim(),
    businessId: data.businessId,
    businessName: data.businessName,
    role: 'Business Owner',
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...users.filter(u => u.email.toLowerCase() !== newUser.email)];
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  window.dispatchEvent(new CustomEvent('franchiseops_auth_changed'));
  return newUser;
}

/**
 * Authenticate user credentials and activate their business scope
 */
export function loginUser(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const users = getAllUsers();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (!user) {
    return { success: false, error: 'Invalid email or password. Please verify your credentials or use the demo login.' };
  }

  // Set active session
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  // Set active business
  const businesses = getAllBusinesses();
  const targetBiz = businesses.find(b => b.id === user.businessId);
  if (targetBiz) {
    setActiveBusiness(targetBiz);
  }

  window.dispatchEvent(new CustomEvent('franchiseops_auth_changed'));
  return { success: true, user };
}

/**
 * Log out current active user
 */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent('franchiseops_auth_changed'));
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse current user:', e);
  }
  return null;
}

// -------------------------------------------------------------
// OUTLETS MANAGEMENT (Scoped to Business)
// -------------------------------------------------------------

// -------------------------------------------------------------
// OUTLETS MANAGEMENT (Scoped to Business)
// -------------------------------------------------------------

export function getTenantOutlets(businessId: string): Outlet[] {
  try {
    const raw = localStorage.getItem(OUTLETS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultOutlets: Outlet[] = [
    { id: 'out_1', franchise_id: businessId, name: 'Biryani Express – Indiranagar', location: '100ft Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', manager_name: 'Rahul Sharma', status: 'Active' },
    { id: 'out_2', franchise_id: businessId, name: 'Biryani Express – Koramangala', location: '5th Block, Koramangala', city: 'Bengaluru', state: 'Karnataka', manager_name: 'Priya Reddy', status: 'Active' },
    { id: 'out_3', franchise_id: businessId, name: 'Biryani Express – HSR Layout', location: 'Sector 3, HSR Layout', city: 'Bengaluru', state: 'Karnataka', manager_name: 'Karthik Iyer', status: 'Active' },
  ];
  localStorage.setItem(OUTLETS_KEY_PREFIX + businessId, JSON.stringify(defaultOutlets));
  return defaultOutlets;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultSales: SalesRecord[] = [
    {
      id: 'sale_1',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      date: '2023-10-31',
      revenue: 2450000,
      orders: 4900,
      customers: 4100,
      aov: 500,
      target_revenue: 2300000,
      product_category: 'Biryani & Combos',
      created_at: '2023-10-31T20:00:00Z',
    },
    {
      id: 'sale_2',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      date: '2023-10-31',
      revenue: 1850000,
      orders: 3800,
      customers: 3200,
      aov: 486,
      target_revenue: 2400000,
      product_category: 'Biryani & Combos',
      created_at: '2023-10-31T20:00:00Z',
    },
    {
      id: 'sale_3',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      date: '2023-10-31',
      revenue: 3100000,
      orders: 6100,
      customers: 5300,
      aov: 508,
      target_revenue: 3000000,
      product_category: 'Biryani & Combos',
      created_at: '2023-10-31T20:00:00Z',
    },
  ];
  localStorage.setItem(SALES_KEY_PREFIX + businessId, JSON.stringify(defaultSales));
  return defaultSales;
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
// INVENTORY & SUPPLY CHAIN (Scoped to Business)
// -------------------------------------------------------------

export function getTenantInventory(businessId: string): InventoryRecord[] {
  const enhanced = getTenantInventoryEnhanced(businessId);
  return enhanced.map(item => ({
    id: item.id,
    business_id: item.business_id,
    outlet_id: item.outlet_id,
    outlet_name: item.outlet_name,
    product_name: item.product_name,
    sku: item.sku,
    category: item.category,
    current_stock: item.current_stock,
    min_stock: item.min_stock,
    max_stock: item.max_stock,
    daily_consumption: item.daily_consumption,
    waste_qty: item.waste_qty,
    unit: item.unit,
    supplier: item.supplier,
    last_restocked: item.last_restocked,
    status: item.status === 'HEALTHY' ? 'In Stock' :
            item.status === 'LOW STOCK' ? 'Low Stock' :
            item.status === 'CRITICAL' || item.status === 'OUT OF STOCK' ? 'Stockout Risk' : 'Overstocked',
  }));
}

export function saveTenantInventory(businessId: string, inventory: InventoryRecord[]) {
  const existingEnhanced = getTenantInventoryEnhanced(businessId);
  const updatedEnhanced: InventoryItemEnhanced[] = inventory.map(item => {
    const prev = existingEnhanced.find(e => e.id === item.id);
    return {
      id: item.id,
      business_id: businessId,
      outlet_id: item.outlet_id,
      outlet_name: item.outlet_name,
      product_id: prev?.product_id || item.id,
      product_name: item.product_name,
      sku: item.sku,
      category: item.category,
      current_stock: item.current_stock,
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      reorder_point: prev?.reorder_point || Math.round(item.min_stock * 1.2),
      unit_cost: prev?.unit_cost || 120,
      unit: item.unit,
      supplier: item.supplier,
      lead_time_days: prev?.lead_time_days || 3,
      daily_consumption: item.daily_consumption,
      waste_qty: item.waste_qty,
      last_restocked: item.last_restocked,
      status: item.status === 'In Stock' ? 'HEALTHY' :
              item.status === 'Low Stock' ? 'LOW STOCK' :
              item.status === 'Stockout Risk' ? 'CRITICAL' : 'OVERSTOCK',
    };
  });
  saveTenantInventoryEnhanced(businessId, updatedEnhanced);
}

export function addTenantInventory(businessId: string, record: Omit<InventoryRecord, 'id' | 'business_id'>): InventoryRecord {
  const enhancedItem: Omit<InventoryItemEnhanced, 'id' | 'business_id'> = {
    ...record,
    product_id: `prod_${Date.now()}`,
    reorder_point: Math.round(record.min_stock * 1.2),
    unit_cost: 120,
    lead_time_days: 3,
    status: record.status === 'In Stock' ? 'HEALTHY' :
            record.status === 'Low Stock' ? 'LOW STOCK' :
            record.status === 'Stockout Risk' ? 'CRITICAL' : 'OVERSTOCK',
  };
  const created = addTenantInventoryEnhanced(businessId, enhancedItem);
  return {
    ...record,
    id: created.id,
    business_id: businessId,
  };
}

export function getTenantInventoryEnhanced(businessId: string): InventoryItemEnhanced[] {
  try {
    const raw = localStorage.getItem(INVENTORY_ENHANCED_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  // 19 Realistic Interconnected Demo SKUs for Biryani Express Group across 3 Outlets
  const defaultEnhanced: InventoryItemEnhanced[] = [
    // ----------------- Biryani Express – Indiranagar (out_1) -----------------
    {
      id: 'inv_1',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-01',
      category: 'Grains & Staples',
      current_stock: 450,
      min_stock: 150,
      max_stock: 600,
      reorder_point: 220,
      unit_cost: 145,
      unit: 'kg',
      supplier: 'Heritage Agro Mills',
      lead_time_days: 2,
      daily_consumption: 45,
      waste_qty: 2,
      last_restocked: '2023-10-28',
      status: 'HEALTHY',
    },
    {
      id: 'inv_2',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_meat_01',
      product_name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-01',
      category: 'Poultry & Meat',
      current_stock: 20,
      min_stock: 40,
      max_stock: 120,
      reorder_point: 50,
      unit_cost: 240,
      unit: 'kg',
      supplier: 'Suguna Fresh Halal Farms',
      lead_time_days: 1,
      daily_consumption: 25,
      waste_qty: 1,
      last_restocked: '2023-10-30',
      status: 'CRITICAL',
    },
    {
      id: 'inv_3',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_meat_02',
      product_name: 'Premium Tender Mutton',
      sku: 'MEAT-MUT-01',
      category: 'Poultry & Meat',
      current_stock: 12,
      min_stock: 20,
      max_stock: 60,
      reorder_point: 25,
      unit_cost: 750,
      unit: 'kg',
      supplier: 'Bangalore Halal Meat Co.',
      lead_time_days: 1,
      daily_consumption: 10,
      waste_qty: 0,
      last_restocked: '2023-10-29',
      status: 'LOW STOCK',
    },
    {
      id: 'inv_4',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_oil_01',
      product_name: 'Sunflower Cooking Oil (15L Tin)',
      sku: 'OIL-SUN-15L',
      category: 'Grains & Staples',
      current_stock: 16,
      min_stock: 8,
      max_stock: 30,
      reorder_point: 12,
      unit_cost: 1850,
      unit: 'tins',
      supplier: 'Fortune Agro Direct',
      lead_time_days: 2,
      daily_consumption: 2,
      waste_qty: 0,
      last_restocked: '2023-10-25',
      status: 'HEALTHY',
    },
    {
      id: 'inv_5',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_veg_01',
      product_name: 'Red Onions (Nashik Grade A)',
      sku: 'VEG-ONI-01',
      category: 'Vegetables & Produce',
      current_stock: 380,
      min_stock: 100,
      max_stock: 250,
      reorder_point: 130,
      unit_cost: 35,
      unit: 'kg',
      supplier: 'APMC Fresh Mandi Logistics',
      lead_time_days: 2,
      daily_consumption: 30,
      waste_qty: 4,
      last_restocked: '2023-10-26',
      status: 'OVERSTOCK',
    },
    {
      id: 'inv_6',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_veg_02',
      product_name: 'Farm Fresh Tomatoes (Hybrid)',
      sku: 'VEG-TOM-01',
      category: 'Vegetables & Produce',
      current_stock: 45,
      min_stock: 30,
      max_stock: 90,
      reorder_point: 40,
      unit_cost: 40,
      unit: 'kg',
      supplier: 'APMC Fresh Mandi Logistics',
      lead_time_days: 1,
      daily_consumption: 15,
      waste_qty: 1,
      last_restocked: '2023-10-31',
      status: 'HEALTHY',
    },

    // ----------------- Biryani Express – Koramangala (out_2) -----------------
    {
      id: 'inv_7',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-02',
      category: 'Grains & Staples',
      current_stock: 80,
      min_stock: 120,
      max_stock: 500,
      reorder_point: 180,
      unit_cost: 145,
      unit: 'kg',
      supplier: 'Heritage Agro Mills',
      lead_time_days: 2,
      daily_consumption: 50,
      waste_qty: 1,
      last_restocked: '2023-10-24',
      status: 'CRITICAL',
    },
    {
      id: 'inv_8',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_meat_01',
      product_name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-02',
      category: 'Poultry & Meat',
      current_stock: 75,
      min_stock: 45,
      max_stock: 150,
      reorder_point: 60,
      unit_cost: 240,
      unit: 'kg',
      supplier: 'Suguna Fresh Halal Farms',
      lead_time_days: 1,
      daily_consumption: 30,
      waste_qty: 2,
      last_restocked: '2023-10-31',
      status: 'HEALTHY',
    },
    {
      id: 'inv_9',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_spice_01',
      product_name: 'Secret Biryani Masala Blend',
      sku: 'SPICE-MAS-01',
      category: 'Spices & Seasonings',
      current_stock: 8,
      min_stock: 15,
      max_stock: 45,
      reorder_point: 20,
      unit_cost: 680,
      unit: 'kg',
      supplier: 'Deccan Royal Spices',
      lead_time_days: 3,
      daily_consumption: 3,
      waste_qty: 0,
      last_restocked: '2023-10-18',
      status: 'LOW STOCK',
    },
    {
      id: 'inv_10',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_spice_02',
      product_name: 'Ginger-Garlic Paste (Fresh Tub)',
      sku: 'SPICE-GGP-01',
      category: 'Spices & Seasonings',
      current_stock: 25,
      min_stock: 15,
      max_stock: 50,
      reorder_point: 20,
      unit_cost: 160,
      unit: 'kg',
      supplier: 'Deccan Royal Spices',
      lead_time_days: 2,
      daily_consumption: 5,
      waste_qty: 0,
      last_restocked: '2023-10-27',
      status: 'HEALTHY',
    },
    {
      id: 'inv_11',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_veg_03',
      product_name: 'Hot Green Chillies (Guntur)',
      sku: 'VEG-CHI-01',
      category: 'Vegetables & Produce',
      current_stock: 18,
      min_stock: 10,
      max_stock: 30,
      reorder_point: 12,
      unit_cost: 75,
      unit: 'kg',
      supplier: 'APMC Fresh Mandi Logistics',
      lead_time_days: 1,
      daily_consumption: 3,
      waste_qty: 0.5,
      last_restocked: '2023-10-29',
      status: 'HEALTHY',
    },
    {
      id: 'inv_12',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_dairy_01',
      product_name: 'Fresh Curd / Dahi (Nandini Pouch)',
      sku: 'DAIRY-CRD-01',
      category: 'Dairy & Produce',
      current_stock: 35,
      min_stock: 25,
      max_stock: 80,
      reorder_point: 35,
      unit_cost: 52,
      unit: 'litres',
      supplier: 'Karnataka Milk Federation (Nandini)',
      lead_time_days: 1,
      daily_consumption: 18,
      waste_qty: 1,
      last_restocked: '2023-10-30',
      status: 'LOW STOCK',
    },

    // ----------------- Biryani Express – HSR Layout (out_3) -----------------
    {
      id: 'inv_13',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_dairy_02',
      product_name: 'Farm Fresh Eggs (Crate of 30)',
      sku: 'DAIRY-EGG-01',
      category: 'Dairy & Produce',
      current_stock: 40,
      min_stock: 15,
      max_stock: 50,
      reorder_point: 20,
      unit_cost: 180,
      unit: 'crates',
      supplier: 'Suguna Poultry Direct',
      lead_time_days: 1,
      daily_consumption: 8,
      waste_qty: 0,
      last_restocked: '2023-10-31',
      status: 'HEALTHY',
    },
    {
      id: 'inv_14',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_dairy_03',
      product_name: 'Fresh Malai Paneer (Vacuum Pack)',
      sku: 'DAIRY-PAN-01',
      category: 'Dairy & Produce',
      current_stock: 18,
      min_stock: 12,
      max_stock: 40,
      reorder_point: 16,
      unit_cost: 360,
      unit: 'kg',
      supplier: 'Karnataka Milk Federation (Nandini)',
      lead_time_days: 1,
      daily_consumption: 4,
      waste_qty: 0,
      last_restocked: '2023-10-29',
      status: 'HEALTHY',
    },
    {
      id: 'inv_15',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_veg_04',
      product_name: 'Jyoti Potatoes (Dum Biryani Cut)',
      sku: 'VEG-POT-01',
      category: 'Vegetables & Produce',
      current_stock: 120,
      min_stock: 50,
      max_stock: 150,
      reorder_point: 65,
      unit_cost: 28,
      unit: 'kg',
      supplier: 'APMC Fresh Mandi Logistics',
      lead_time_days: 2,
      daily_consumption: 15,
      waste_qty: 2,
      last_restocked: '2023-10-27',
      status: 'HEALTHY',
    },
    {
      id: 'inv_16',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_bev_01',
      product_name: 'Assorted Soft Drinks (Thums Up & Sprite 750ml)',
      sku: 'BEV-DRK-01',
      category: 'Beverages',
      current_stock: 140,
      min_stock: 60,
      max_stock: 200,
      reorder_point: 80,
      unit_cost: 38,
      unit: 'bottles',
      supplier: 'Hindustan Coca-Cola Beverages',
      lead_time_days: 2,
      daily_consumption: 25,
      waste_qty: 0,
      last_restocked: '2023-10-25',
      status: 'HEALTHY',
    },
    {
      id: 'inv_17',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_pkg_01',
      product_name: 'Eco-Friendly Kraft Disposable Meal Boxes (1000ml)',
      sku: 'PKG-BOX-1000',
      category: 'Packaging & Disposables',
      current_stock: 3500,
      min_stock: 1000,
      max_stock: 2500,
      reorder_point: 1400,
      unit_cost: 12,
      unit: 'units',
      supplier: 'GreenPack Packaging India',
      lead_time_days: 4,
      daily_consumption: 120,
      waste_qty: 10,
      last_restocked: '2023-10-20',
      status: 'OVERSTOCK',
    },
    {
      id: 'inv_18',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-03',
      category: 'Grains & Staples',
      current_stock: 320,
      min_stock: 120,
      max_stock: 500,
      reorder_point: 180,
      unit_cost: 145,
      unit: 'kg',
      supplier: 'Heritage Agro Mills',
      lead_time_days: 2,
      daily_consumption: 40,
      waste_qty: 1,
      last_restocked: '2023-10-26',
      status: 'HEALTHY',
    },
    {
      id: 'inv_19',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_meat_01',
      product_name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-03',
      category: 'Poultry & Meat',
      current_stock: 5,
      min_stock: 35,
      max_stock: 100,
      reorder_point: 45,
      unit_cost: 240,
      unit: 'kg',
      supplier: 'Suguna Fresh Halal Farms',
      lead_time_days: 1,
      daily_consumption: 22,
      waste_qty: 0,
      last_restocked: '2023-10-31',
      status: 'CRITICAL',
    },
  ];
  localStorage.setItem(INVENTORY_ENHANCED_KEY_PREFIX + businessId, JSON.stringify(defaultEnhanced));
  return defaultEnhanced;
}

export function saveTenantInventoryEnhanced(businessId: string, inventory: InventoryItemEnhanced[]) {
  localStorage.setItem(INVENTORY_ENHANCED_KEY_PREFIX + businessId, JSON.stringify(inventory));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'inventory', businessId } }));
}

export function addTenantInventoryEnhanced(businessId: string, record: Omit<InventoryItemEnhanced, 'id' | 'business_id'>): InventoryItemEnhanced {
  const inventory = getTenantInventoryEnhanced(businessId);
  const newRecord: InventoryItemEnhanced = {
    ...record,
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    business_id: businessId,
  };
  saveTenantInventoryEnhanced(businessId, [newRecord, ...inventory]);
  logTenantActivity(businessId, 'Inventory Agent', `Added SKU ${newRecord.product_name} at ${newRecord.outlet_name}`);
  return newRecord;
}

export function updateTenantInventoryItem(businessId: string, item: InventoryItemEnhanced): InventoryItemEnhanced {
  const inventory = getTenantInventoryEnhanced(businessId);
  const updated = inventory.map(i => i.id === item.id ? item : i);
  saveTenantInventoryEnhanced(businessId, updated);
  return item;
}

// -------------------------------------------------------------
// SUPPLIERS & PRODUCTS (Scoped to Business)
// -------------------------------------------------------------

export function getTenantSuppliers(businessId: string): SupplierItem[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultSuppliers: SupplierItem[] = [
    {
      id: 'sup_1',
      business_id: businessId,
      name: 'Heritage Agro Mills',
      contact_name: 'Anand Varma',
      contact_email: 'orders@heritageagro.in',
      contact_phone: '+91 94401 22334',
      lead_time_days: 2,
      rating: 4.8,
      on_time_delivery_pct: 98,
      average_purchase_cost: 145,
      last_purchase_price: 145,
      status: 'Preferred',
      created_at: '2023-01-20T10:00:00Z',
    },
    {
      id: 'sup_2',
      business_id: businessId,
      name: 'Suguna Fresh Halal Farms',
      contact_name: 'Imran Khan',
      contact_email: 'b2b@sugunafresh.in',
      contact_phone: '+91 98450 11223',
      lead_time_days: 1,
      rating: 4.9,
      on_time_delivery_pct: 99,
      average_purchase_cost: 240,
      last_purchase_price: 240,
      status: 'Preferred',
      created_at: '2023-01-22T08:00:00Z',
    },
    {
      id: 'sup_3',
      business_id: businessId,
      name: 'Bangalore Halal Meat Co.',
      contact_name: 'Zubair Ahmed',
      contact_email: 'dispatch@bangalorehalal.in',
      contact_phone: '+91 97000 54321',
      lead_time_days: 1,
      rating: 4.7,
      on_time_delivery_pct: 95,
      average_purchase_cost: 750,
      last_purchase_price: 750,
      status: 'Active',
      created_at: '2023-01-25T08:00:00Z',
    },
    {
      id: 'sup_4',
      business_id: businessId,
      name: 'Fortune Agro Direct',
      contact_name: 'Sunil Mehta',
      contact_email: 'b2b@fortuneagro.com',
      contact_phone: '+91 98200 44556',
      lead_time_days: 2,
      rating: 4.8,
      on_time_delivery_pct: 97,
      average_purchase_cost: 1850,
      last_purchase_price: 1850,
      status: 'Preferred',
      created_at: '2023-02-01T09:00:00Z',
    },
    {
      id: 'sup_5',
      business_id: businessId,
      name: 'APMC Fresh Mandi Logistics',
      contact_name: 'Manjunath Swamy',
      contact_email: 'mandi@apmcsupply.in',
      contact_phone: '+91 94800 66778',
      lead_time_days: 1,
      rating: 4.6,
      on_time_delivery_pct: 92,
      average_purchase_cost: 40,
      last_purchase_price: 40,
      status: 'Active',
      created_at: '2023-02-15T06:00:00Z',
    },
    {
      id: 'sup_6',
      business_id: businessId,
      name: 'Deccan Royal Spices',
      contact_name: 'Mohd. Farooq',
      contact_email: 'orders@deccanroyalspices.com',
      contact_phone: '+91 98490 88776',
      lead_time_days: 3,
      rating: 4.9,
      on_time_delivery_pct: 96,
      average_purchase_cost: 680,
      last_purchase_price: 680,
      status: 'Preferred',
      created_at: '2023-02-10T11:00:00Z',
    },
    {
      id: 'sup_7',
      business_id: businessId,
      name: 'Karnataka Milk Federation (Nandini)',
      contact_name: 'K. S. Hegde',
      contact_email: 'b2b@nandinidairy.org',
      contact_phone: '+91 80 2345 6789',
      lead_time_days: 1,
      rating: 4.9,
      on_time_delivery_pct: 99,
      average_purchase_cost: 52,
      last_purchase_price: 52,
      status: 'Preferred',
      created_at: '2023-03-01T09:00:00Z',
    },
    {
      id: 'sup_8',
      business_id: businessId,
      name: 'GreenPack Packaging India',
      contact_name: 'Suresh Kumar',
      contact_email: 'sales@greenpackindia.com',
      contact_phone: '+91 99000 88990',
      lead_time_days: 4,
      rating: 4.7,
      on_time_delivery_pct: 94,
      average_purchase_cost: 12,
      last_purchase_price: 12,
      status: 'Active',
      created_at: '2023-03-15T10:00:00Z',
    },
  ];
  localStorage.setItem(SUPPLIERS_KEY_PREFIX + businessId, JSON.stringify(defaultSuppliers));
  return defaultSuppliers;
}

export function saveTenantSuppliers(businessId: string, suppliers: SupplierItem[]) {
  localStorage.setItem(SUPPLIERS_KEY_PREFIX + businessId, JSON.stringify(suppliers));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'suppliers', businessId } }));
}

export function getTenantProducts(businessId: string): ProductItem[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultProducts: ProductItem[] = [
    {
      id: 'prod_rice_01',
      business_id: businessId,
      name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-01',
      category: 'Grains & Staples',
      unit: 'kg',
      cost_price: 145,
      selling_price: 280,
      supplier_id: 'sup_1',
      supplier_name: 'Heritage Agro Mills',
      lead_time_days: 2,
      min_safety_stock: 150,
      max_stock: 600,
      created_at: '2023-01-20T10:00:00Z',
    },
    {
      id: 'prod_meat_01',
      business_id: businessId,
      name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-01',
      category: 'Poultry & Meat',
      unit: 'kg',
      cost_price: 240,
      selling_price: 450,
      supplier_id: 'sup_2',
      supplier_name: 'Suguna Fresh Halal Farms',
      lead_time_days: 1,
      min_safety_stock: 40,
      max_stock: 120,
      created_at: '2023-01-22T08:00:00Z',
    },
    {
      id: 'prod_meat_02',
      business_id: businessId,
      name: 'Premium Tender Mutton',
      sku: 'MEAT-MUT-01',
      category: 'Poultry & Meat',
      unit: 'kg',
      cost_price: 750,
      selling_price: 1200,
      supplier_id: 'sup_3',
      supplier_name: 'Bangalore Halal Meat Co.',
      lead_time_days: 1,
      min_safety_stock: 20,
      max_stock: 60,
      created_at: '2023-01-25T08:00:00Z',
    },
  ];
  localStorage.setItem(PRODUCTS_KEY_PREFIX + businessId, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function saveTenantProducts(businessId: string, products: ProductItem[]) {
  localStorage.setItem(PRODUCTS_KEY_PREFIX + businessId, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'products', businessId } }));
}

// -------------------------------------------------------------
// INVENTORY MOVEMENTS (Traceable Stock Ledger)
// -------------------------------------------------------------

export function getTenantMovements(businessId: string): InventoryMovement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultMovements: InventoryMovement[] = [
    {
      id: 'mov_1',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-01',
      movement_type: 'PURCHASE_RECEIPT',
      quantity: 500,
      previous_stock: 45,
      new_stock: 545,
      unit_cost: 145,
      reference_id: 'PO-2023-8801',
      notes: 'Monthly bulk batch delivery from Heritage Agro Mills',
      date: '2023-10-25',
      created_at: '2023-10-25T10:00:00Z',
    },
    {
      id: 'mov_2',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-01',
      movement_type: 'SALE',
      quantity: -45,
      previous_stock: 545,
      new_stock: 500,
      unit_cost: 145,
      notes: 'POS Daily recipe depletion - Lunch & Dinner service',
      date: '2023-10-31',
      created_at: '2023-10-31T22:00:00Z',
    },
    {
      id: 'mov_3',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_spice_01',
      product_name: 'Secret Biryani Masala Blend',
      sku: 'SPICE-MAS-01',
      movement_type: 'SALE',
      quantity: -3,
      previous_stock: 11,
      new_stock: 8,
      unit_cost: 680,
      notes: 'POS Daily consumption during dinner peak',
      date: '2023-10-31',
      created_at: '2023-10-31T22:00:00Z',
    },
    {
      id: 'mov_4',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_meat_02',
      product_name: 'Premium Tender Mutton',
      sku: 'MEAT-MUT-01',
      movement_type: 'SALE',
      quantity: -10,
      previous_stock: 22,
      new_stock: 12,
      unit_cost: 750,
      notes: 'Daily mutton dum biryani batch cooking',
      date: '2023-10-31',
      created_at: '2023-10-31T21:30:00Z',
    },
    {
      id: 'mov_5',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_meat_01',
      product_name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-02',
      movement_type: 'PURCHASE_RECEIPT',
      quantity: 100,
      previous_stock: 5,
      new_stock: 105,
      unit_cost: 240,
      reference_id: 'PO-2023-8815',
      notes: 'Farm poultry fresh morning batch delivery',
      date: '2023-10-30',
      created_at: '2023-10-30T07:30:00Z',
    },
    {
      id: 'mov_6',
      business_id: businessId,
      outlet_id: 'out_3',
      outlet_name: 'Biryani Express – HSR Layout',
      product_id: 'prod_pkg_01',
      product_name: 'Eco-Friendly Kraft Disposable Meal Boxes (1000ml)',
      sku: 'PKG-BOX-1000',
      movement_type: 'WASTAGE',
      quantity: -10,
      previous_stock: 3510,
      new_stock: 3500,
      unit_cost: 12,
      notes: 'Water splash damaged outer packing cartons in dry store',
      date: '2023-10-28',
      created_at: '2023-10-28T16:00:00Z',
    },
  ];
  localStorage.setItem(MOVEMENTS_KEY_PREFIX + businessId, JSON.stringify(defaultMovements));
  return defaultMovements;
}

export function saveTenantMovements(businessId: string, movements: InventoryMovement[]) {
  localStorage.setItem(MOVEMENTS_KEY_PREFIX + businessId, JSON.stringify(movements));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'movements', businessId } }));
}

export function addTenantMovement(businessId: string, movement: Omit<InventoryMovement, 'id' | 'business_id' | 'created_at'>): InventoryMovement {
  const movements = getTenantMovements(businessId);
  const newMov: InventoryMovement = {
    ...movement,
    id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    business_id: businessId,
    created_at: new Date().toISOString(),
  };
  saveTenantMovements(businessId, [newMov, ...movements]);
  return newMov;
}

// -------------------------------------------------------------
// PURCHASE ORDERS LIFECYCLE
// -------------------------------------------------------------

export function getTenantPurchaseOrders(businessId: string): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(PO_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultPOs: PurchaseOrder[] = [
    {
      id: 'po_101',
      business_id: businessId,
      po_number: 'PO-2023-8821',
      supplier_id: 'sup_2',
      supplier_name: 'Suguna Fresh Halal Farms',
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      items: [
        {
          id: 'poi_1',
          product_id: 'prod_meat_01',
          product_name: 'Fresh Farm Chicken (Curry Cut)',
          sku: 'MEAT-CHK-01',
          unit: 'kg',
          quantity_ordered: 80,
          quantity_received: 0,
          quantity_damaged: 0,
          unit_cost: 240,
          total_cost: 19200,
        },
      ],
      total_amount: 19200,
      status: 'ORDERED',
      expected_delivery: new Date().toISOString().split('T')[0], // Today
      created_by: 'Vijay Kumar',
      approved_by: 'Vijay Kumar',
      notes: 'Urgent emergency reorder triggered by low chicken reserve at Indiranagar.',
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'po_102',
      business_id: businessId,
      po_number: 'PO-2023-8824',
      supplier_id: 'sup_1',
      supplier_name: 'Heritage Agro Mills',
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      items: [
        {
          id: 'poi_2',
          product_id: 'prod_rice_01',
          product_name: 'Basmati Rice (Daawat Biryani Special)',
          sku: 'RICE-BAS-02',
          unit: 'kg',
          quantity_ordered: 200,
          quantity_received: 0,
          quantity_damaged: 0,
          unit_cost: 145,
          total_cost: 29000,
        },
      ],
      total_amount: 29000,
      status: 'ORDERED',
      expected_delivery: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      created_by: 'Vijay Kumar',
      approved_by: 'Vijay Kumar',
      notes: 'Standing order replenishment for Koramangala.',
      created_at: new Date(Date.now() - 20000000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(PO_KEY_PREFIX + businessId, JSON.stringify(defaultPOs));
  return defaultPOs;
}

export function saveTenantPurchaseOrders(businessId: string, pos: PurchaseOrder[]) {
  localStorage.setItem(PO_KEY_PREFIX + businessId, JSON.stringify(pos));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'purchase_orders', businessId } }));
}

export function createPurchaseOrder(
  businessId: string,
  payload: Omit<PurchaseOrder, 'id' | 'business_id' | 'po_number' | 'created_at' | 'updated_at'>
): PurchaseOrder {
  const pos = getTenantPurchaseOrders(businessId);
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newPO: PurchaseOrder = {
    ...payload,
    id: `po_${Date.now()}`,
    business_id: businessId,
    po_number: poNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveTenantPurchaseOrders(businessId, [newPO, ...pos]);
  logInventoryAuditEvent(businessId, {
    entity_type: 'PURCHASE_ORDER',
    entity_id: newPO.id,
    action: `Created Purchase Order ${poNumber} for ${newPO.supplier_name} (₹${newPO.total_amount.toLocaleString()})`,
    actor_name: payload.created_by,
    outlet_id: newPO.outlet_id,
    outlet_name: newPO.outlet_name,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Created ${poNumber} for ${newPO.outlet_name}: ₹${newPO.total_amount.toLocaleString()}`);
  return newPO;
}

export function approvePurchaseOrder(businessId: string, poId: string, approvedBy: string): PurchaseOrder {
  const pos = getTenantPurchaseOrders(businessId);
  const target = pos.find(p => p.id === poId);
  if (!target) throw new Error('Purchase Order not found');

  const updatedPO: PurchaseOrder = {
    ...target,
    status: 'ORDERED',
    approved_by: approvedBy,
    updated_at: new Date().toISOString(),
  };

  const updatedList = pos.map(p => p.id === poId ? updatedPO : p);
  saveTenantPurchaseOrders(businessId, updatedList);

  logInventoryAuditEvent(businessId, {
    entity_type: 'PURCHASE_ORDER',
    entity_id: target.id,
    action: `Approved & Dispatched Purchase Order ${target.po_number} to ${target.supplier_name}`,
    actor_name: approvedBy,
    outlet_id: target.outlet_id,
    outlet_name: target.outlet_name,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Approved PO ${target.po_number} for delivery to ${target.outlet_name}`);
  return updatedPO;
}

export function receiveGoods(
  businessId: string,
  receipt: GoodsReceiptPayload
): { po: PurchaseOrder; movements: InventoryMovement[] } {
  const pos = getTenantPurchaseOrders(businessId);
  const targetPO = pos.find(p => p.id === receipt.po_id);
  if (!targetPO) throw new Error('Purchase Order not found');

  const inventory = getTenantInventoryEnhanced(businessId);
  const movements: InventoryMovement[] = [];
  let updatedItems = [...targetPO.items];
  let allReceived = true;

  // Process each receipt item
  receipt.items.forEach(recItem => {
    const poItemIdx = updatedItems.findIndex(i => i.product_id === recItem.product_id);
    if (poItemIdx >= 0) {
      const poItem = updatedItems[poItemIdx];
      const newQtyReceived = (poItem.quantity_received || 0) + recItem.quantity_received;
      const newQtyDamaged = (poItem.quantity_damaged || 0) + (recItem.quantity_damaged || 0);

      updatedItems[poItemIdx] = {
        ...poItem,
        quantity_received: newQtyReceived,
        quantity_damaged: newQtyDamaged,
      };

      if (newQtyReceived < poItem.quantity_ordered) {
        allReceived = false;
      }

      // Update Inventory if items received into good stock
      if (recItem.quantity_received > 0) {
        const invItem = inventory.find(inv => inv.outlet_id === targetPO.outlet_id && (inv.product_id === recItem.product_id || inv.sku === poItem.sku));
        const prevStock = invItem ? invItem.current_stock : 0;
        const newStock = prevStock + recItem.quantity_received;

        if (invItem) {
          invItem.current_stock = newStock;
          invItem.last_restocked = new Date().toISOString().split('T')[0];
          invItem.status = newStock <= invItem.min_stock * 0.5 ? 'CRITICAL' :
                           newStock <= invItem.min_stock ? 'LOW STOCK' :
                           newStock >= invItem.max_stock ? 'OVERSTOCK' : 'HEALTHY';
        }

        // Add traceable movement
        const mov = addTenantMovement(businessId, {
          outlet_id: targetPO.outlet_id,
          outlet_name: targetPO.outlet_name,
          product_id: poItem.product_id,
          product_name: poItem.product_name,
          sku: poItem.sku,
          movement_type: 'PURCHASE_RECEIPT',
          quantity: recItem.quantity_received,
          previous_stock: prevStock,
          new_stock: newStock,
          unit_cost: poItem.unit_cost,
          reference_id: targetPO.po_number,
          created_by: receipt.received_by,
          notes: `Goods received against ${targetPO.po_number} from ${targetPO.supplier_name}. ${receipt.notes || ''}`,
          date: new Date().toISOString().split('T')[0],
        });
        movements.push(mov);
      }

      // If damaged goods detected, log damage movement and create wastage entry
      if (recItem.quantity_damaged > 0) {
        const invItem = inventory.find(inv => inv.outlet_id === targetPO.outlet_id && (inv.product_id === recItem.product_id || inv.sku === poItem.sku));
        const curStock = invItem ? invItem.current_stock : 0;

        const dmgMov = addTenantMovement(businessId, {
          outlet_id: targetPO.outlet_id,
          outlet_name: targetPO.outlet_name,
          product_id: poItem.product_id,
          product_name: poItem.product_name,
          sku: poItem.sku,
          movement_type: 'DAMAGE',
          quantity: -recItem.quantity_damaged,
          previous_stock: curStock,
          new_stock: curStock,
          unit_cost: poItem.unit_cost,
          reference_id: targetPO.po_number,
          created_by: receipt.received_by,
          notes: `Damaged in transit during delivery for ${targetPO.po_number}`,
          date: new Date().toISOString().split('T')[0],
        });
        movements.push(dmgMov);

        recordWastageEvent(businessId, {
          outlet_id: targetPO.outlet_id,
          outlet_name: targetPO.outlet_name,
          product_id: poItem.product_id,
          product_name: poItem.product_name,
          sku: poItem.sku,
          unit: poItem.unit,
          quantity: recItem.quantity_damaged,
          unit_cost: poItem.unit_cost,
          cost_impact: recItem.quantity_damaged * poItem.unit_cost,
          reason: 'Handling Damage',
          reported_by: receipt.received_by,
          date: new Date().toISOString().split('T')[0],
          notes: `Damaged on delivery dock from supplier ${targetPO.supplier_name} (${targetPO.po_number})`,
        });
      }
    }
  });

  saveTenantInventoryEnhanced(businessId, inventory);

  const updatedPO: PurchaseOrder = {
    ...targetPO,
    items: updatedItems,
    status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
    received_by: receipt.received_by,
    updated_at: new Date().toISOString(),
  };

  const updatedList = pos.map(p => p.id === targetPO.id ? updatedPO : p);
  saveTenantPurchaseOrders(businessId, updatedList);

  logInventoryAuditEvent(businessId, {
    entity_type: 'GOODS_RECEIPT',
    entity_id: targetPO.id,
    action: `Goods Received for ${targetPO.po_number} (${allReceived ? 'Fully Received' : 'Partially Received'})`,
    actor_name: receipt.received_by,
    outlet_id: targetPO.outlet_id,
    outlet_name: targetPO.outlet_name,
  });

  logTenantActivity(businessId, 'Inventory Agent', `Goods receiving processed for ${targetPO.po_number} at ${targetPO.outlet_name}`);
  return { po: updatedPO, movements };
}

// -------------------------------------------------------------
// STOCK TRANSFERS LIFECYCLE (Cross-Outlet Optimization)
// -------------------------------------------------------------

export function getTenantTransfers(businessId: string): StockTransfer[] {
  try {
    const raw = localStorage.getItem(TRANSFERS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultTransfers: StockTransfer[] = [
    {
      id: 'trn_1',
      business_id: businessId,
      transfer_number: 'TR-2023-104',
      source_outlet_id: 'out_1',
      source_outlet_name: 'Biryani Express – Indiranagar',
      destination_outlet_id: 'out_2',
      destination_outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_rice_01',
      product_name: 'Basmati Rice (Daawat Biryani Special)',
      sku: 'RICE-BAS-01',
      unit: 'kg',
      quantity: 100,
      unit_cost: 145,
      status: 'TRANSFER_DISPATCH',
      requested_by: 'Vijay Kumar (AI Recommended)',
      approved_by: 'Vijay Kumar',
      dispatched_at: new Date(Date.now() - 7200000).toISOString(),
      reason: 'Shortage in Koramangala balanced against Indiranagar surplus stock (10 days reserve)',
      notes: 'Sent via internal express delivery vehicle.',
      created_at: new Date(Date.now() - 28800000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(TRANSFERS_KEY_PREFIX + businessId, JSON.stringify(defaultTransfers));
  return defaultTransfers;
}

export function saveTenantTransfers(businessId: string, transfers: StockTransfer[]) {
  localStorage.setItem(TRANSFERS_KEY_PREFIX + businessId, JSON.stringify(transfers));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'transfers', businessId } }));
}

export function requestStockTransfer(
  businessId: string,
  payload: Omit<StockTransfer, 'id' | 'business_id' | 'transfer_number' | 'created_at' | 'updated_at'>
): StockTransfer {
  const transfers = getTenantTransfers(businessId);
  const transferNumber = `TR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const newTransfer: StockTransfer = {
    ...payload,
    id: `trn_${Date.now()}`,
    business_id: businessId,
    transfer_number: transferNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveTenantTransfers(businessId, [newTransfer, ...transfers]);
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_TRANSFER',
    entity_id: newTransfer.id,
    action: `Requested Stock Transfer ${transferNumber} (${payload.quantity} ${payload.unit} of ${payload.product_name}) from ${payload.source_outlet_name} to ${payload.destination_outlet_name}`,
    actor_name: payload.requested_by,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Transfer request ${transferNumber}: ${payload.quantity} ${payload.unit} of ${payload.product_name} -> ${payload.destination_outlet_name}`);
  return newTransfer;
}

export function approveStockTransfer(businessId: string, transferId: string, approvedBy: string): StockTransfer {
  const transfers = getTenantTransfers(businessId);
  const target = transfers.find(t => t.id === transferId);
  if (!target) throw new Error('Transfer record not found');

  const updated: StockTransfer = {
    ...target,
    status: 'TRANSFER_APPROVAL',
    approved_by: approvedBy,
    updated_at: new Date().toISOString(),
  };

  saveTenantTransfers(businessId, transfers.map(t => t.id === transferId ? updated : t));
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_TRANSFER',
    entity_id: target.id,
    action: `Approved Stock Transfer ${target.transfer_number}`,
    actor_name: approvedBy,
  });
  return updated;
}

export function dispatchStockTransfer(businessId: string, transferId: string): StockTransfer {
  const transfers = getTenantTransfers(businessId);
  const target = transfers.find(t => t.id === transferId);
  if (!target) throw new Error('Transfer record not found');

  // Deduct from Source Outlet
  const inventory = getTenantInventoryEnhanced(businessId);
  const sourceItem = inventory.find(i => i.outlet_id === target.source_outlet_id && (i.product_id === target.product_id || i.sku === target.sku));

  if (sourceItem) {
    const prevStock = sourceItem.current_stock;
    const newStock = Math.max(0, prevStock - target.quantity);
    sourceItem.current_stock = newStock;
    sourceItem.status = newStock <= sourceItem.min_stock * 0.5 ? 'CRITICAL' :
                       newStock <= sourceItem.min_stock ? 'LOW STOCK' : 'HEALTHY';
    saveTenantInventoryEnhanced(businessId, inventory);

    addTenantMovement(businessId, {
      outlet_id: target.source_outlet_id,
      outlet_name: target.source_outlet_name,
      product_id: target.product_id,
      product_name: target.product_name,
      sku: target.sku,
      movement_type: 'TRANSFER_OUT',
      quantity: -target.quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      unit_cost: target.unit_cost,
      reference_id: target.transfer_number,
      notes: `Dispatched inter-outlet transfer to ${target.destination_outlet_name}`,
      date: new Date().toISOString().split('T')[0],
    });
  }

  const updated: StockTransfer = {
    ...target,
    status: 'TRANSFER_DISPATCH',
    dispatched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveTenantTransfers(businessId, transfers.map(t => t.id === transferId ? updated : t));
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_TRANSFER',
    entity_id: target.id,
    action: `Dispatched Stock Transfer ${target.transfer_number} from ${target.source_outlet_name}`,
    actor_name: 'Warehouse Dispatcher',
  });
  return updated;
}

export function receiveStockTransfer(businessId: string, transferId: string, receivedBy: string): StockTransfer {
  const transfers = getTenantTransfers(businessId);
  const target = transfers.find(t => t.id === transferId);
  if (!target) throw new Error('Transfer record not found');

  // Add to Destination Outlet
  const inventory = getTenantInventoryEnhanced(businessId);
  const destItem = inventory.find(i => i.outlet_id === target.destination_outlet_id && (i.product_id === target.product_id || i.sku === target.sku));

  if (destItem) {
    const prevStock = destItem.current_stock;
    const newStock = prevStock + target.quantity;
    destItem.current_stock = newStock;
    destItem.last_restocked = new Date().toISOString().split('T')[0];
    destItem.status = newStock <= destItem.min_stock * 0.5 ? 'CRITICAL' :
                     newStock <= destItem.min_stock ? 'LOW STOCK' : 'HEALTHY';
    saveTenantInventoryEnhanced(businessId, inventory);

    addTenantMovement(businessId, {
      outlet_id: target.destination_outlet_id,
      outlet_name: target.destination_outlet_name,
      product_id: target.product_id,
      product_name: target.product_name,
      sku: target.sku,
      movement_type: 'TRANSFER_IN',
      quantity: target.quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      unit_cost: target.unit_cost,
      reference_id: target.transfer_number,
      created_by: receivedBy,
      notes: `Received inter-outlet transfer from ${target.source_outlet_name}`,
      date: new Date().toISOString().split('T')[0],
    });
  }

  const updated: StockTransfer = {
    ...target,
    status: 'TRANSFER_RECEIPT',
    received_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveTenantTransfers(businessId, transfers.map(t => t.id === transferId ? updated : t));
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_TRANSFER',
    entity_id: target.id,
    action: `Received Stock Transfer ${target.transfer_number} at ${target.destination_outlet_name}`,
    actor_name: receivedBy,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Transfer ${target.transfer_number} received & finalized at ${target.destination_outlet_name}`);
  return updated;
}

// -------------------------------------------------------------
// STOCK RECONCILIATION & PHYSICAL COUNT SESSIONS
// -------------------------------------------------------------

export function getTenantStockCounts(businessId: string): StockCountSession[] {
  try {
    const raw = localStorage.getItem(STOCK_COUNTS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultCounts: StockCountSession[] = [
    {
      id: 'sc_1',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      session_name: 'End-of-Month October Physical Audit',
      status: 'COMPLETED',
      conducted_by: 'Rahul Sharma',
      approved_by: 'Vijay Kumar',
      total_variance_cost: -52,
      items: [
        {
          id: 'sci_1',
          product_id: 'prod_veg_01',
          product_name: 'Red Onions (Nashik Grade A)',
          sku: 'VEG-ONI-01',
          unit: 'kg',
          unit_cost: 35,
          system_stock: 381.5,
          physical_count: 380,
          variance_quantity: -1.5,
          variance_cost: -52.5,
          variance_reason: 'Wastage',
          notes: 'Minor moisture weight loss in vegetable bin',
        },
      ],
      notes: 'Monthly physical reconciliation completed across all grains and produce.',
      created_at: '2023-10-30T17:00:00Z',
      updated_at: '2023-10-30T19:00:00Z',
    },
  ];
  localStorage.setItem(STOCK_COUNTS_KEY_PREFIX + businessId, JSON.stringify(defaultCounts));
  return defaultCounts;
}

export function saveTenantStockCounts(businessId: string, sessions: StockCountSession[]) {
  localStorage.setItem(STOCK_COUNTS_KEY_PREFIX + businessId, JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'stock_counts', businessId } }));
}

export function createStockCountSession(
  businessId: string,
  outletId: string,
  sessionName: string,
  conductedBy: string
): StockCountSession {
  const inventory = getTenantInventoryEnhanced(businessId).filter(i => i.outlet_id === outletId);
  const outlets = getTenantOutlets(businessId);
  const outlet = outlets.find(o => o.id === outletId);

  const items: StockCountItem[] = inventory.map(item => ({
    id: `sci_${Date.now()}_${item.id}`,
    product_id: item.product_id,
    product_name: item.product_name,
    sku: item.sku,
    unit: item.unit,
    unit_cost: item.unit_cost,
    system_stock: item.current_stock,
    physical_count: item.current_stock, // Default to system until entered
    variance_quantity: 0,
    variance_cost: 0,
    variance_reason: 'Unknown',
  }));

  const newSession: StockCountSession = {
    id: `sc_${Date.now()}`,
    business_id: businessId,
    outlet_id: outletId,
    outlet_name: outlet?.name || 'Selected Outlet',
    session_name: sessionName,
    status: 'IN_PROGRESS',
    items,
    conducted_by: conductedBy,
    total_variance_cost: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const sessions = getTenantStockCounts(businessId);
  saveTenantStockCounts(businessId, [newSession, ...sessions]);
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_COUNT',
    entity_id: newSession.id,
    action: `Initiated Physical Stock Count Session "${sessionName}" for ${newSession.outlet_name}`,
    actor_name: conductedBy,
    outlet_id: outletId,
    outlet_name: newSession.outlet_name,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Started stock count for ${newSession.outlet_name} (${items.length} SKUs)`);
  return newSession;
}

export function submitStockCountSession(
  businessId: string,
  sessionId: string,
  items: StockCountItem[],
  notes?: string
): StockCountSession {
  const sessions = getTenantStockCounts(businessId);
  const target = sessions.find(s => s.id === sessionId);
  if (!target) throw new Error('Stock Count Session not found');

  const totalVarianceCost = items.reduce((acc, it) => acc + it.variance_cost, 0);

  const updated: StockCountSession = {
    ...target,
    items,
    status: 'PENDING_APPROVAL',
    total_variance_cost: totalVarianceCost,
    notes: notes || target.notes,
    updated_at: new Date().toISOString(),
  };

  saveTenantStockCounts(businessId, sessions.map(s => s.id === sessionId ? updated : s));
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_COUNT',
    entity_id: sessionId,
    action: `Submitted Physical Stock Count Audit for ${target.outlet_name} with ${items.filter(i => i.variance_quantity !== 0).length} Discrepancies`,
    actor_name: target.conducted_by,
    outlet_id: target.outlet_id,
    outlet_name: target.outlet_name,
  });
  return updated;
}

export function approveStockCountAdjustment(
  businessId: string,
  sessionId: string,
  approvedBy: string
): { session: StockCountSession; movements: InventoryMovement[] } {
  const sessions = getTenantStockCounts(businessId);
  const target = sessions.find(s => s.id === sessionId);
  if (!target) throw new Error('Stock Count Session not found');

  const inventory = getTenantInventoryEnhanced(businessId);
  const movements: InventoryMovement[] = [];

  target.items.forEach(countItem => {
    if (countItem.variance_quantity !== 0) {
      const invItem = inventory.find(i => i.outlet_id === target.outlet_id && (i.product_id === countItem.product_id || i.sku === countItem.sku));
      const prevStock = invItem ? invItem.current_stock : countItem.system_stock;
      const newStock = countItem.physical_count;

      if (invItem) {
        invItem.current_stock = newStock;
        invItem.status = newStock <= invItem.min_stock * 0.5 ? 'CRITICAL' :
                         newStock <= invItem.min_stock ? 'LOW STOCK' :
                         newStock >= invItem.max_stock ? 'OVERSTOCK' : 'HEALTHY';
      }

      const mov = addTenantMovement(businessId, {
        outlet_id: target.outlet_id,
        outlet_name: target.outlet_name,
        product_id: countItem.product_id,
        product_name: countItem.product_name,
        sku: countItem.sku,
        movement_type: 'STOCK_COUNT',
        quantity: countItem.variance_quantity,
        previous_stock: prevStock,
        new_stock: newStock,
        unit_cost: countItem.unit_cost,
        reference_id: target.id,
        created_by: approvedBy,
        notes: `Stock count reconciliation variance (${countItem.variance_quantity > 0 ? '+' : ''}${countItem.variance_quantity} ${countItem.unit}). Reason: ${countItem.variance_reason}. ${countItem.notes || ''}`,
        date: new Date().toISOString().split('T')[0],
      });
      movements.push(mov);

      // If variance is negative, log wastage
      if (countItem.variance_quantity < 0) {
        const wasteReason: WastageReason = countItem.variance_reason === 'Damage' ? 'Handling Damage' :
                                           countItem.variance_reason === 'Wastage' ? 'Kitchen Spoilage' : 'Other';
        recordWastageEvent(businessId, {
          outlet_id: target.outlet_id,
          outlet_name: target.outlet_name,
          product_id: countItem.product_id,
          product_name: countItem.product_name,
          sku: countItem.sku,
          unit: countItem.unit,
          quantity: Math.abs(countItem.variance_quantity),
          unit_cost: countItem.unit_cost,
          cost_impact: Math.abs(countItem.variance_cost),
          reason: wasteReason,
          reported_by: approvedBy,
          date: new Date().toISOString().split('T')[0],
          notes: `Reconciliation write-off from ${target.session_name}: ${countItem.variance_reason}`,
        });
      }
    }
  });

  saveTenantInventoryEnhanced(businessId, inventory);

  const updated: StockCountSession = {
    ...target,
    status: 'COMPLETED',
    approved_by: approvedBy,
    updated_at: new Date().toISOString(),
  };

  saveTenantStockCounts(businessId, sessions.map(s => s.id === sessionId ? updated : s));
  logInventoryAuditEvent(businessId, {
    entity_type: 'STOCK_COUNT',
    entity_id: target.id,
    action: `Approved Physical Stock Reconciliation for ${target.outlet_name} (Net Variance: ₹${target.total_variance_cost.toLocaleString()})`,
    actor_name: approvedBy,
    outlet_id: target.outlet_id,
    outlet_name: target.outlet_name,
  });

  logTenantActivity(businessId, 'Inventory Agent', `Approved stock count audit for ${target.outlet_name} (Reconciled ${target.items.length} SKUs)`);
  return { session: updated, movements };
}

// -------------------------------------------------------------
// WASTAGE & LOSS TRACKING
// -------------------------------------------------------------

export function getTenantWastage(businessId: string): WastageRecord[] {
  try {
    const raw = localStorage.getItem(WASTAGE_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultWastage: WastageRecord[] = [
    {
      id: 'wst_1',
      business_id: businessId,
      outlet_id: 'out_2',
      outlet_name: 'Biryani Express – Koramangala',
      product_id: 'prod_meat_01',
      product_name: 'Fresh Farm Chicken (Curry Cut)',
      sku: 'MEAT-CHK-02',
      unit: 'kg',
      quantity: 3.5,
      unit_cost: 240,
      cost_impact: 840,
      reason: 'Preparation Error',
      date: '2023-10-31',
      reported_by: 'Priya Reddy',
      notes: 'Trimming loss and marinade excess during lunch peak',
      created_at: '2023-10-31T15:30:00Z',
    },
    {
      id: 'wst_2',
      business_id: businessId,
      outlet_id: 'out_1',
      outlet_name: 'Biryani Express – Indiranagar',
      product_id: 'prod_dairy_01',
      product_name: 'Fresh Curd / Dahi (Nandini Pouch)',
      sku: 'DAIRY-CRD-01',
      unit: 'litres',
      quantity: 4,
      unit_cost: 52,
      cost_impact: 208,
      reason: 'Kitchen Spoilage',
      date: '2023-10-30',
      reported_by: 'Rahul Sharma',
      notes: 'Cold storage refrigerator temperature fluctuation overnight',
      created_at: '2023-10-30T09:00:00Z',
    },
  ];
  localStorage.setItem(WASTAGE_KEY_PREFIX + businessId, JSON.stringify(defaultWastage));
  return defaultWastage;
}

export function saveTenantWastage(businessId: string, records: WastageRecord[]) {
  localStorage.setItem(WASTAGE_KEY_PREFIX + businessId, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'wastage', businessId } }));
}

export function recordWastageEvent(
  businessId: string,
  payload: Omit<WastageRecord, 'id' | 'business_id' | 'created_at'>
): WastageRecord {
  const records = getTenantWastage(businessId);
  const newRecord: WastageRecord = {
    ...payload,
    id: `wst_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    business_id: businessId,
    created_at: new Date().toISOString(),
  };

  saveTenantWastage(businessId, [newRecord, ...records]);
  logInventoryAuditEvent(businessId, {
    entity_type: 'WASTAGE',
    entity_id: newRecord.id,
    action: `Logged Wastage: ${payload.quantity} ${payload.unit} of ${payload.product_name} at ${payload.outlet_name} (Cost: ₹${payload.cost_impact.toLocaleString()}, Reason: ${payload.reason})`,
    actor_name: payload.reported_by,
    outlet_id: payload.outlet_id,
    outlet_name: payload.outlet_name,
  });
  logTenantActivity(businessId, 'Inventory Agent', `Logged wastage at ${payload.outlet_name}: ₹${payload.cost_impact.toLocaleString()} (${payload.reason})`);
  return newRecord;
}

// -------------------------------------------------------------
// INVENTORY AUDIT LOGS
// -------------------------------------------------------------

export function getTenantInventoryAuditLogs(businessId: string): InventoryAuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function logInventoryAuditEvent(
  businessId: string,
  entry: Omit<InventoryAuditLogEntry, 'id' | 'business_id' | 'timestamp'>
): InventoryAuditLogEntry {
  const logs = getTenantInventoryAuditLogs(businessId);
  const newEntry: InventoryAuditLogEntry = {
    ...entry,
    id: `log_inv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    business_id: businessId,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(AUDIT_LOG_KEY_PREFIX + businessId, JSON.stringify([newEntry, ...logs.slice(0, 99)]));
  return newEntry;
}

// -------------------------------------------------------------
// REPLENISHMENT RECOMMENDATIONS (Smart Execution)
// -------------------------------------------------------------

export function getTenantRecommendationsEnhanced(businessId: string): ReplenishmentRecommendation[] {
  try {
    const raw = localStorage.getItem(REPLENISHMENT_RECS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveTenantRecommendationsEnhanced(businessId: string, recs: ReplenishmentRecommendation[]) {
  localStorage.setItem(REPLENISHMENT_RECS_KEY_PREFIX + businessId, JSON.stringify(recs));
  window.dispatchEvent(new CustomEvent('franchiseops_recs_updated', { detail: { businessId } }));
}

export function approveReplenishmentRecommendation(
  businessId: string, 
  recId: string,
  approvedBy: string = 'Vijay Kumar'
): { success: boolean; message: string } {
  const recs = getTenantRecommendationsEnhanced(businessId);
  const targetRec = recs.find(r => r.id === recId);
  if (!targetRec) return { success: false, message: 'Recommendation not found' };

  // Update rec status
  const updatedRecs = recs.map(r => r.id === recId ? { ...r, status: 'Approved' as const, updated_at: new Date().toISOString() } : r);
  saveTenantRecommendationsEnhanced(businessId, updatedRecs);

  if (targetRec.action_type === 'TRANSFER_FROM_OUTLET' && targetRec.source_outlet_id) {
    // Create and approve an inter-outlet transfer
    const transfer = requestStockTransfer(businessId, {
      source_outlet_id: targetRec.source_outlet_id,
      source_outlet_name: targetRec.source_outlet_name || 'Source Outlet',
      destination_outlet_id: targetRec.outlet_id,
      destination_outlet_name: targetRec.outlet_name,
      product_id: targetRec.product_id,
      product_name: targetRec.product_name,
      sku: targetRec.sku,
      unit: targetRec.unit,
      quantity: targetRec.recommended_quantity,
      unit_cost: targetRec.unit_cost,
      status: 'TRANSFER_APPROVAL',
      requested_by: `${approvedBy} (AI Replenishment Engine)`,
      approved_by: approvedBy,
      reason: `Automated rebalancing from excess inventory at ${targetRec.source_outlet_name}`,
    });

    logTenantActivity(
      businessId,
      'Inventory Agent',
      `Approved Transfer #${transfer.transfer_number}: ${targetRec.recommended_quantity} ${targetRec.unit} ${targetRec.product_name} (${targetRec.source_outlet_name} -> ${targetRec.outlet_name})`
    );

    return {
      success: true,
      message: `Inter-outlet Transfer #${transfer.transfer_number} approved! ${targetRec.recommended_quantity} ${targetRec.unit} will be transferred from ${targetRec.source_outlet_name} to ${targetRec.outlet_name}.`,
    };
  } else {
    // Create an approved Purchase Order
    const po = createPurchaseOrder(businessId, {
      supplier_name: targetRec.supplier,
      outlet_id: targetRec.outlet_id,
      outlet_name: targetRec.outlet_name,
      items: [
        {
          id: `poi_${Date.now()}`,
          product_id: targetRec.product_id,
          product_name: targetRec.product_name,
          sku: targetRec.sku,
          unit: targetRec.unit,
          quantity_ordered: targetRec.recommended_quantity,
          quantity_received: 0,
          quantity_damaged: 0,
          unit_cost: targetRec.unit_cost,
          total_cost: targetRec.recommended_quantity * targetRec.unit_cost,
        },
      ],
      total_amount: targetRec.recommended_quantity * targetRec.unit_cost,
      status: 'ORDERED',
      expected_delivery: new Date(Date.now() + targetRec.supplier_lead_time * 86400000).toISOString().split('T')[0],
      created_by: `${approvedBy} (AI Engine)`,
      approved_by: approvedBy,
      notes: `AI Replenishment Order: ${targetRec.reason}`,
    });

    logTenantActivity(
      businessId,
      'Inventory Agent',
      `Approved PO #${po.po_number} for ${targetRec.product_name} at ${targetRec.outlet_name} (+${targetRec.recommended_quantity} ${targetRec.unit})`
    );

    return {
      success: true,
      message: `Purchase Order #${po.po_number} for ${targetRec.product_name} (+${targetRec.recommended_quantity} ${targetRec.unit}, ₹${po.total_amount.toLocaleString()}) created & dispatched to ${targetRec.supplier}!`,
    };
  }
}

export function dismissReplenishmentRecommendation(businessId: string, recId: string): { success: boolean; message: string } {
  const recs = getTenantRecommendationsEnhanced(businessId);
  const targetRec = recs.find(r => r.id === recId);
  if (!targetRec) return { success: false, message: 'Recommendation not found' };

  const updatedRecs = recs.map(r => r.id === recId ? { ...r, status: 'Dismissed' as const, updated_at: new Date().toISOString() } : r);
  saveTenantRecommendationsEnhanced(businessId, updatedRecs);

  logTenantActivity(
    businessId,
    'Inventory Agent',
    `Dismissed replenishment recommendation for ${targetRec.product_name} at ${targetRec.outlet_name}`
  );

  return { success: true, message: `Recommendation for ${targetRec.product_name} dismissed.` };
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
// WORKFORCE & STAFF INTELLIGENCE (Scoped to Business)
// -------------------------------------------------------------

export function getTenantEmployees(businessId: string): Employee[] {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 15) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const outlets = getTenantOutlets(businessId);
  const seeded = INITIAL_EMPLOYEES.map(emp => {
    const matchedOutlet = outlets.find(o => o.id === emp.outletId || o.name.toLowerCase().includes(emp.outletName.toLowerCase().replace('biryani hub - ', '')));
    return {
      ...emp,
      businessId,
      outletId: matchedOutlet ? matchedOutlet.id : emp.outletId,
      outletName: matchedOutlet ? matchedOutlet.name : emp.outletName
    };
  });
  localStorage.setItem(EMPLOYEES_KEY_PREFIX + businessId, JSON.stringify(seeded));
  return seeded;
}

export function saveTenantEmployees(businessId: string, employees: Employee[]) {
  localStorage.setItem(EMPLOYEES_KEY_PREFIX + businessId, JSON.stringify(employees));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'employees', businessId } }));
}

export function addTenantEmployee(businessId: string, employee: Omit<Employee, 'employeeId' | 'businessId'>): Employee {
  const current = getTenantEmployees(businessId);
  const newEmp: Employee = {
    ...employee,
    employeeId: `emp_${Date.now()}`,
    businessId
  };
  saveTenantEmployees(businessId, [newEmp, ...current]);
  logTenantActivity(businessId, 'Staff Agent', `Added team member: ${newEmp.employeeName} (${newEmp.role}) at ${newEmp.outletName}`);
  return newEmp;
}

export function getTenantShifts(businessId: string): ShiftRecord[] {
  try {
    const raw = localStorage.getItem(SHIFTS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 8) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const outlets = getTenantOutlets(businessId);
  const seeded = INITIAL_SHIFTS.map(s => {
    const matchedOutlet = outlets.find(o => o.id === s.outletId || o.name.toLowerCase().includes(s.outletName.toLowerCase().replace('biryani hub - ', '')));
    return {
      ...s,
      businessId,
      outletId: matchedOutlet ? matchedOutlet.id : s.outletId,
      outletName: matchedOutlet ? matchedOutlet.name : s.outletName
    };
  });
  localStorage.setItem(SHIFTS_KEY_PREFIX + businessId, JSON.stringify(seeded));
  return seeded;
}

export function saveTenantShifts(businessId: string, shifts: ShiftRecord[]) {
  localStorage.setItem(SHIFTS_KEY_PREFIX + businessId, JSON.stringify(shifts));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'shifts', businessId } }));
}

export function getTenantStaffingRequirements(businessId: string): StaffingRequirement[] {
  try {
    const raw = localStorage.getItem(STAFFING_REQ_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  localStorage.setItem(STAFFING_REQ_KEY_PREFIX + businessId, JSON.stringify(INITIAL_STAFFING_REQUIREMENTS));
  return INITIAL_STAFFING_REQUIREMENTS;
}

export function getTenantWorkforceInsights(businessId: string): StaffAgentInsight[] {
  try {
    const raw = localStorage.getItem(WORKFORCE_INSIGHTS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveTenantWorkforceInsights(businessId: string, insights: StaffAgentInsight[]) {
  localStorage.setItem(WORKFORCE_INSIGHTS_KEY_PREFIX + businessId, JSON.stringify(insights));
  window.dispatchEvent(new CustomEvent('franchiseops_wf_insights_updated', { detail: { businessId } }));
}

// -------------------------------------------------------------
// ADVANCED MARKETING INTELLIGENCE (Scoped to Business)
// -------------------------------------------------------------

export function getTenantCampaigns(businessId: string): MarketingCampaign[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY_PREFIX + businessId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  const outlets = getTenantOutlets(businessId);
  const seeded = INITIAL_MARKETING_CAMPAIGNS.map(c => {
    const matchedOutlet = outlets.find(o => o.id === c.outletId) || (outlets.length > 0 ? outlets[0] : null);
    return {
      ...c,
      businessId,
      outletId: matchedOutlet ? matchedOutlet.id : c.outletId,
      outletName: matchedOutlet ? matchedOutlet.name : c.outletName
    };
  });

  localStorage.setItem(CAMPAIGNS_KEY_PREFIX + businessId, JSON.stringify(seeded));
  return seeded;
}

export function saveTenantCampaigns(businessId: string, campaigns: MarketingCampaign[]) {
  localStorage.setItem(CAMPAIGNS_KEY_PREFIX + businessId, JSON.stringify(campaigns));
  window.dispatchEvent(new CustomEvent('franchiseops_data_updated', { detail: { type: 'campaigns', businessId } }));
}

export function addTenantCampaign(businessId: string, campaign: Omit<MarketingCampaign, 'campaignId' | 'businessId'>): MarketingCampaign {
  const current = getTenantCampaigns(businessId);
  const newCampaign: MarketingCampaign = {
    ...campaign,
    campaignId: `mkt_${Date.now()}`,
    businessId
  };
  saveTenantCampaigns(businessId, [newCampaign, ...current]);
  logTenantActivity(businessId, 'Marketing Agent', `Deployed campaign '${newCampaign.campaignName}' for ${newCampaign.outletName} (${newCampaign.channel})`);
  return newCampaign;
}

export function getTenantMarketingInsights(businessId: string): MarketingAgentInsight[] {
  try {
    const raw = localStorage.getItem(MARKETING_INSIGHTS_KEY_PREFIX + businessId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveTenantMarketingInsights(businessId: string, insights: MarketingAgentInsight[]) {
  localStorage.setItem(MARKETING_INSIGHTS_KEY_PREFIX + businessId, JSON.stringify(insights));
  window.dispatchEvent(new CustomEvent('franchiseops_mkt_insights_updated', { detail: { businessId } }));
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
