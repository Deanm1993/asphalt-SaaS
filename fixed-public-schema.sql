-- Simple and reliable public schema for Supabase
-- Drop and recreate to ensure clean state

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects if they exist (order matters due to dependencies)
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enum type
CREATE TYPE user_role AS ENUM (
    'owner',      -- Business owner
    'admin',      -- Office admin
    'estimator',  -- Creates quotes
    'supervisor', -- Field supervisor
    'operator',   -- Machine operator
    'crew',       -- General crew member
    'readonly'    -- Client or view-only access
);

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  abn VARCHAR(14) NOT NULL, -- Australian Business Number (formatted as XX XXX XXX XXX)
  acn VARCHAR(9), -- Australian Company Number (if applicable)
  gst_registered BOOLEAN NOT NULL DEFAULT true, -- GST registration status
  address_line1 VARCHAR(100) NOT NULL,
  address_line2 VARCHAR(100),
  suburb VARCHAR(50) NOT NULL,
  state VARCHAR(3) NOT NULL, -- NSW, VIC, QLD, etc.
  postcode VARCHAR(4) NOT NULL, -- Australian 4-digit postcodes
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(100),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#2D3142', -- For branding
  active BOOLEAN NOT NULL DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'basic', -- basic, standard, premium
  subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, past_due, cancelled
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_state CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT')),
  CONSTRAINT valid_abn CHECK (abn ~ '^[0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}$')
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'crew',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create crews table
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  supervisor_id UUID REFERENCES users(id),
  color VARCHAR(7) DEFAULT '#3498DB', -- For calendar display
  max_daily_tonnage DECIMAL(8, 2), -- Maximum tonnage capacity per day
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

-- Create function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT u.tenant_id INTO tenant_id
  FROM users u
  WHERE u.id = auth.uid();
  
  RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS Policies
CREATE POLICY tenant_isolation_policy ON users
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON crews
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Special policy for tenants table
CREATE POLICY tenant_self_view_policy ON tenants
  FOR ALL USING (id = get_current_tenant_id() OR auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_crews_tenant_id ON crews(tenant_id);

-- Insert demo tenant
INSERT INTO tenants (
  id, 
  name, 
  slug, 
  abn, 
  address_line1, 
  suburb, 
  state, 
  postcode, 
  phone, 
  email
) VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'Demo Company', 
  'demo-company', 
  '12 345 678 901', 
  '123 Main Street', 
  'Sydney', 
  'NSW', 
  '2000', 
  '0412 345 678', 
  'demo@viable-saas.com.au'
);