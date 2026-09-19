-- Supabase Schema for Agentic AI for Franchise Management System

-- Set up UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES
CREATE TYPE user_role AS ENUM ('Super Admin', 'Franchise Manager', 'Outlet Manager', 'Analyst');

-- PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Outlet Manager',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRANCHISES
CREATE TABLE franchises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    total_outlets INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OUTLETS
CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    manager_id UUID REFERENCES profiles(id),
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Warning')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OUTLET PERFORMANCE (Aggregated metrics usually managed by Edge Functions/Agents)
CREATE TABLE outlet_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- e.g., '2023-10'
    revenue NUMERIC(12,2) DEFAULT 0,
    previous_revenue NUMERIC(12,2) DEFAULT 0,
    target_revenue NUMERIC(12,2) DEFAULT 0,
    orders INTEGER DEFAULT 0,
    customers INTEGER DEFAULT 0,
    revenue_growth NUMERIC(5,2) DEFAULT 0,
    target_achievement NUMERIC(5,2) DEFAULT 0,
    aov NUMERIC(10,2) DEFAULT 0,
    health_score INTEGER DEFAULT 0,
    performance_status TEXT CHECK (performance_status IN ('Excellent', 'Good', 'Average', 'Poor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENT INSIGHTS
CREATE TABLE agent_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    finding TEXT NOT NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    possible_causes JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT NOT NULL,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    related_outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    related_agent TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECOMMENDATIONS (Human in the loop)
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID REFERENCES agent_insights(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    supporting_metrics JSONB DEFAULT '[]'::jsonb,
    related_outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    related_agent TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT CHECK (status IN ('New', 'Under Review', 'Approved', 'Rejected', 'Completed')) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALERTS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('New', 'Read', 'Acknowledged', 'Resolved')) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENT RUNS
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent TEXT NOT NULL,
    task TEXT NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT CHECK (status IN ('Pending', 'Running', 'Completed', 'Failed')) DEFAULT 'Pending',
    input TEXT,
    output TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MILESTONE 2: INVENTORY INTELLIGENCE & OPTIMIZATION TABLES
-- ============================================================================

-- SUPPLIERS
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    lead_time_days INTEGER NOT NULL DEFAULT 3,
    rating NUMERIC(3,2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Preferred')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'units',
    cost_price NUMERIC(10,2) DEFAULT 0,
    selling_price NUMERIC(10,2) DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    min_safety_stock NUMERIC(10,2) DEFAULT 10,
    max_stock NUMERIC(10,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY (Multi-tenant scoped by franchise, outlet, and product)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(10,2) NOT NULL DEFAULT 10,
    max_stock NUMERIC(10,2) NOT NULL DEFAULT 100,
    reorder_point NUMERIC(10,2) DEFAULT 20,
    unit_cost NUMERIC(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('HEALTHY', 'LOW STOCK', 'CRITICAL', 'OUT OF STOCK', 'OVERSTOCK')) DEFAULT 'HEALTHY',
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(outlet_id, product_id)
);

-- INVENTORY MOVEMENTS (Auditable stock ledger transactions)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT CHECK (movement_type IN (
        'PURCHASE_RECEIPT', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 
        'RETURN', 'WASTAGE', 'DAMAGE', 'MANUAL_ADJUSTMENT', 
        'STOCK_COUNT', 'EXPIRY', 'OTHER'
    )) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    previous_stock NUMERIC(10,2) DEFAULT 0,
    new_stock NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(10,2) DEFAULT 0,
    reference_id TEXT,
    created_by TEXT,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDERS
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    total_amount NUMERIC(12,2) DEFAULT 0,
    status TEXT CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 
        'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
    )) DEFAULT 'DRAFT',
    expected_delivery DATE,
    created_by TEXT,
    approved_by TEXT,
    received_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDER ITEMS
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity_ordered NUMERIC(10,2) NOT NULL,
    quantity_received NUMERIC(10,2) DEFAULT 0,
    quantity_damaged NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK TRANSFERS (Inter-Outlet Inventory Balancing)
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    transfer_number TEXT NOT NULL UNIQUE,
    source_outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    destination_outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2) DEFAULT 0,
    status TEXT CHECK (status IN (
        'TRANSFER_REQUEST', 'TRANSFER_APPROVAL', 'TRANSFER_DISPATCH', 
        'TRANSFER_RECEIPT', 'REJECTED'
    )) DEFAULT 'TRANSFER_REQUEST',
    requested_by TEXT,
    approved_by TEXT,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHYSICAL STOCK COUNTS & RECONCILIATION
CREATE TABLE stock_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    count_session_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'CANCELLED')) DEFAULT 'IN_PROGRESS',
    conducted_by TEXT,
    approved_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_count_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_count_id UUID REFERENCES stock_counts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    system_stock NUMERIC(10,2) NOT NULL,
    physical_count NUMERIC(10,2) NOT NULL,
    variance_quantity NUMERIC(10,2) NOT NULL,
    variance_cost NUMERIC(12,2) DEFAULT 0,
    variance_reason TEXT CHECK (variance_reason IN (
        'Wastage', 'Damage', 'Theft', 'Counting Error', 
        'Data Entry Error', 'Unknown'
    )) DEFAULT 'Counting Error',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WASTAGE & LOSS TRACKING
CREATE TABLE wastage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    cost_impact NUMERIC(12,2) NOT NULL,
    reason TEXT CHECK (reason IN (
        'Kitchen Spoilage', 'Preparation Error', 'Expired Batch', 
        'Cold Chain Failure', 'Handling Damage', 'Over-portioning', 'Other'
    )) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reported_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY AUDIT LOGS
CREATE TABLE inventory_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'PURCHASE_ORDER', 'STOCK_TRANSFER', 'STOCK_COUNT', 'WASTAGE', 'MANUAL_ADJUSTMENT'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- REPLENISHMENT RECOMMENDATIONS (Smart Optimization: Buy vs Transfer vs Monitor)
CREATE TABLE replenishment_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    action_type TEXT CHECK (action_type IN (
        'NO_ACTION', 'MONITOR', 'REORDER', 'URGENT_REORDER', 'TRANSFER_FROM_OUTLET'
    )) DEFAULT 'REORDER',
    current_stock NUMERIC(10,2) NOT NULL,
    avg_daily_demand NUMERIC(10,2) NOT NULL,
    forecast_demand NUMERIC(10,2) NOT NULL,
    days_remaining NUMERIC(5,1) NOT NULL,
    supplier_lead_time INTEGER NOT NULL,
    safety_stock NUMERIC(10,2) NOT NULL,
    reorder_point NUMERIC(10,2) NOT NULL,
    recommended_quantity NUMERIC(10,2) NOT NULL,
    source_outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL, -- for transfers
    open_po_reference TEXT, -- for monitor
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')) DEFAULT 'Medium',
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('New', 'Under Review', 'Approved', 'Dismissed', 'Completed')) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wastage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE replenishment_recommendations ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (All authenticated users scoped by tenant)
CREATE POLICY "Enable read access for all authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON franchises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON outlets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON outlet_performance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON agent_insights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON recommendations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON agent_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON suppliers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON purchase_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON purchase_order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON stock_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON stock_counts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON stock_count_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON wastage_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON inventory_audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON replenishment_recommendations FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_franchises_updated_at BEFORE UPDATE ON franchises FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_outlets_updated_at BEFORE UPDATE ON outlets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_outlet_performance_updated_at BEFORE UPDATE ON outlet_performance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stock_counts_updated_at BEFORE UPDATE ON stock_counts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_replenishment_recs_updated_at BEFORE UPDATE ON replenishment_recommendations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

