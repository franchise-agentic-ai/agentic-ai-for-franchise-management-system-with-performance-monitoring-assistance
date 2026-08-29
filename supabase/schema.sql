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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Example: Super Admin has full access, others restricted)
-- For demonstration, all authenticated users can read.
CREATE POLICY "Enable read access for all authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON franchises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON outlets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON outlet_performance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON agent_insights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON recommendations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON agent_runs FOR SELECT USING (auth.role() = 'authenticated');

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
