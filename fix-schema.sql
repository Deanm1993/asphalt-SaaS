-- Viable SaaS Platform - Fixed Database Schema
-- For Australian Asphalt Contractors
-- This script fixes the foreign key constraint issue

-- Start a transaction
BEGIN;

-- First, ensure the auth.users record exists before it's referenced
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@viable-saas.com.au',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- =================================================================
-- SCHEMA SETUP
-- =================================================================

-- Create schema for application tables
CREATE SCHEMA IF NOT EXISTS app;

-- =================================================================
-- ENUMS
-- =================================================================

-- Job types for asphalt work
CREATE TYPE app.job_type AS ENUM (
  'mill_and_fill',
  'resheet',
  'overlay',
  'patching',
  'full_reconstruction'
);

-- Job status tracking
CREATE TYPE app.job_status AS ENUM (
  'draft',
  'quoted',
  'approved',
  'scheduled',
  'in_progress',
  'completed',
  'invoiced',
  'cancelled'
);

-- Asphalt mix types common in Australia
CREATE TYPE app.asphalt_mix_type AS ENUM (
  'ac10', -- 10mm aggregate for wearing course
  'ac14', -- 14mm aggregate for intermediate course
  'ac20', -- 20mm aggregate for base course
  'sma',  -- Stone Mastic Asphalt for high-traffic areas
  'open_graded', -- Porous asphalt
  'warm_mix', -- Lower temperature mix
  'cold_mix', -- Emergency/temporary repairs
  'recycled', -- Contains RAP (Recycled Asphalt Pavement)
  'custom'  -- Custom specification
);

-- Australian specification standards
CREATE TYPE app.specification_standard AS ENUM (
  'rms_r116', -- NSW Roads and Maritime Services
  'rms_r117',
  'rms_r118',
  'vicroads_section_407', -- VicRoads
  'vicroads_section_408',
  'mrwa_specification_504', -- Main Roads Western Australia
  'tmr_mrts30', -- Queensland Transport and Main Roads
  'dpti_part_228', -- SA Department of Planning, Transport and Infrastructure
  'local_council', -- Local council specification
  'custom' -- Custom client specification
);

-- Truck types for access restrictions
CREATE TYPE app.truck_type AS ENUM (
  'truck_and_dog', -- Common in Australia, truck with dog trailer
  'semi_trailer',
  'rigid_truck',
  'body_truck', -- Small truck for tight access
  'any'
);

-- User roles
CREATE TYPE app.user_role AS ENUM (
  'owner',      -- Business owner
  'admin',      -- Office admin
  'estimator',  -- Creates quotes
  'supervisor', -- Field supervisor
  'operator',   -- Machine operator
  'crew',       -- General crew member
  'readonly'    -- Client or view-only access
);

-- =================================================================
-- MULTI-TENANT TABLES
-- =================================================================

-- Tenants (Companies)
CREATE TABLE app.tenants (
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
  
  -- Validate Australian states
  CONSTRAINT valid_state CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT')),
  
  -- Validate ABN format (XX XXX XXX XXX)
  CONSTRAINT valid_abn CHECK (abn ~ '^[0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}$')
);

-- User profiles (extends Supabase Auth)
CREATE TABLE app.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES app.tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role app.user_role NOT NULL DEFAULT 'crew',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each user must belong to a tenant
  CONSTRAINT user_tenant_required CHECK (tenant_id IS NOT NULL)
);

-- =================================================================
-- CUSTOMER MANAGEMENT
-- =================================================================

-- Customers (Clients)
CREATE TABLE app.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  business_name VARCHAR(100) NOT NULL,
  trading_name VARCHAR(100),
  abn VARCHAR(14), -- Australian Business Number
  acn VARCHAR(9),  -- Australian Company Number
  website VARCHAR(100),
  industry VARCHAR(50),
  address_line1 VARCHAR(100),
  address_line2 VARCHAR(100),
  suburb VARCHAR(50),
  state VARCHAR(3),
  postcode VARCHAR(4),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app.users(id),
  
  -- Validate ABN format if provided
  CONSTRAINT valid_customer_abn CHECK (abn IS NULL OR abn ~ '^[0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}$'),
  
  -- Validate Australian states if provided
  CONSTRAINT valid_customer_state CHECK (state IS NULL OR state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'))
);

-- Customer Contacts
CREATE TABLE app.customer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES app.customers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  position VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- JOB SCOPING MODULE
-- =================================================================

-- Job Sites (Locations)
CREATE TABLE app.job_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES app.customers(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  address_line1 VARCHAR(100) NOT NULL,
  address_line2 VARCHAR(100),
  suburb VARCHAR(50) NOT NULL,
  state VARCHAR(3) NOT NULL,
  postcode VARCHAR(4) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  site_contact_name VARCHAR(100),
  site_contact_phone VARCHAR(20),
  access_notes TEXT,
  hazard_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validate Australian states
  CONSTRAINT valid_site_state CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'))
);

-- Jobs (Core job record)
CREATE TABLE app.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  job_number VARCHAR(20) NOT NULL,
  customer_id UUID REFERENCES app.customers(id) ON DELETE SET NULL,
  site_id UUID REFERENCES app.job_sites(id) ON DELETE SET NULL,
  job_type app.job_type NOT NULL,
  job_status app.job_status NOT NULL DEFAULT 'draft',
  title VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Site requirements
  site_area_sqm DECIMAL(10, 2), -- Total area in square meters
  total_tonnage DECIMAL(10, 2), -- Calculated tonnage
  waste_factor DECIMAL(5, 2) DEFAULT 5.0, -- Default 5% waste
  
  -- Australian specific fields
  purchase_order_number VARCHAR(50),
  quote_number VARCHAR(50),
  quote_date DATE,
  quote_expiry_date DATE,
  quote_total_ex_gst DECIMAL(10, 2),
  quote_gst_amount DECIMAL(10, 2),
  quote_total_inc_gst DECIMAL(10, 2),
  
  -- Scheduling
  estimated_duration_hours DECIMAL(5, 2),
  is_night_shift BOOLEAN DEFAULT false,
  
  -- Access restrictions
  truck_access app.truck_type DEFAULT 'any',
  
  -- Weather constraints
  min_temperature_c DECIMAL(4, 1) DEFAULT 10.0, -- Minimum temperature in Celsius
  
  -- Timestamps and metadata
  quoted_by UUID REFERENCES app.users(id),
  approved_by_customer_name VARCHAR(100),
  approved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app.users(id),
  
  -- Ensure job_number is unique within a tenant
  CONSTRAINT unique_job_number_per_tenant UNIQUE (tenant_id, job_number)
);

-- Job Items (Individual areas/sections within a job)
CREATE TABLE app.job_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  area_sqm DECIMAL(10, 2) NOT NULL, -- Area in square meters
  depth_mm DECIMAL(6, 2) NOT NULL,  -- Depth in millimeters
  asphalt_mix_type app.asphalt_mix_type NOT NULL,
  specification app.specification_standard DEFAULT 'custom',
  custom_specification TEXT,
  
  -- Calculated fields
  tonnage DECIMAL(10, 2), -- Calculated: area × depth × density ÷ 1000 × (1 + waste_factor/100)
  
  -- Australian pricing
  unit_price_per_tonne DECIMAL(10, 2),
  total_price_ex_gst DECIMAL(10, 2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Hazards Checklist
CREATE TABLE app.job_hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  has_overhead_powerlines BOOLEAN DEFAULT false,
  has_underground_services BOOLEAN DEFAULT false,
  has_confined_spaces BOOLEAN DEFAULT false,
  has_traffic_management BOOLEAN DEFAULT false,
  has_pedestrian_management BOOLEAN DEFAULT false,
  has_noise_restrictions BOOLEAN DEFAULT false,
  has_environmental_concerns BOOLEAN DEFAULT false,
  has_contaminated_materials BOOLEAN DEFAULT false,
  has_tight_access BOOLEAN DEFAULT false,
  has_structural_issues BOOLEAN DEFAULT false,
  other_hazards TEXT,
  mitigation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment Required for Job
CREATE TABLE app.job_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  needs_paver BOOLEAN DEFAULT false,
  needs_roller_steel BOOLEAN DEFAULT false,
  needs_roller_pneumatic BOOLEAN DEFAULT false,
  needs_bobcat BOOLEAN DEFAULT false,
  needs_excavator BOOLEAN DEFAULT false,
  needs_milling_machine BOOLEAN DEFAULT false,
  needs_sweeper BOOLEAN DEFAULT false,
  needs_water_cart BOOLEAN DEFAULT false,
  needs_trucks INT DEFAULT 0, -- Number of trucks needed
  needs_traffic_control BOOLEAN DEFAULT false,
  needs_line_marking BOOLEAN DEFAULT false,
  other_equipment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials and Suppliers
CREATE TABLE app.job_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  asphalt_supplier VARCHAR(100),
  asphalt_plant_location VARCHAR(100),
  distance_to_site_km DECIMAL(6, 2),
  tip_site_name VARCHAR(100),
  tip_site_location VARCHAR(100),
  distance_to_tip_km DECIMAL(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Photos and Attachments
CREATE TABLE app.job_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- e.g., image/jpeg, application/pdf
  file_size INT NOT NULL, -- Size in bytes
  file_path TEXT NOT NULL, -- Storage path
  description TEXT,
  is_before_photo BOOLEAN DEFAULT false,
  is_after_photo BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES app.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Geometry (GeoJSON for map visualization)
CREATE TABLE app.job_geometry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  geom GEOMETRY(GEOMETRY, 4326), -- PostGIS geometry
  area_calculated_sqm DECIMAL(10, 2), -- Area calculated from geometry
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- SCHEDULING & CALENDAR
-- =================================================================

-- Crews (Teams)
CREATE TABLE app.crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  supervisor_id UUID REFERENCES app.users(id),
  color VARCHAR(7) DEFAULT '#3498DB', -- For calendar display
  max_daily_tonnage DECIMAL(8, 2), -- Maximum tonnage capacity per day
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crew Members
CREATE TABLE app.crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID NOT NULL REFERENCES app.crews(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  is_supervisor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule Entries
CREATE TABLE app.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES app.crews(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  notes TEXT,
  color VARCHAR(7), -- Override crew color if needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app.users(id)
);

-- Weather Forecasts (cached from BOM)
CREATE TABLE app.weather_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  site_id UUID REFERENCES app.job_sites(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  min_temp_c DECIMAL(4, 1),
  max_temp_c DECIMAL(4, 1),
  chance_of_rain INT, -- Percentage
  rainfall_mm DECIMAL(5, 1),
  weather_condition VARCHAR(50), -- e.g., Sunny, Partly cloudy, Showers
  wind_speed_kmh INT,
  wind_direction VARCHAR(3), -- N, NE, E, SE, S, SW, W, NW
  is_suitable_for_paving BOOLEAN, -- Calculated based on weather conditions
  forecast_retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- COMPLIANCE & DOCUMENTATION
-- =================================================================

-- Safety Documents
CREATE TABLE app.safety_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  job_id UUID REFERENCES app.jobs(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- SWMS, JSA, Toolbox Talk, etc.
  title VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  version VARCHAR(10) NOT NULL,
  approved_by UUID REFERENCES app.users(id),
  approved_at TIMESTAMPTZ,
  expiry_date DATE,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app.users(id)
);

-- Quality Assurance Records
CREATE TABLE app.quality_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  test_type VARCHAR(50) NOT NULL, -- Compaction, Temperature, Thickness, etc.
  location_description TEXT,
  test_result VARCHAR(50),
  is_compliant BOOLEAN,
  notes TEXT,
  tested_by UUID REFERENCES app.users(id),
  test_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chain of Responsibility (CoR) Records
CREATE TABLE app.cor_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
  driver_name VARCHAR(100) NOT NULL,
  vehicle_registration VARCHAR(10) NOT NULL,
  load_weight_tonnes DECIMAL(6, 2) NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  is_overloaded BOOLEAN DEFAULT false,
  is_fatigue_compliant BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app.users(id)
);

-- =================================================================
-- FUNCTIONS & TRIGGERS
-- =================================================================

-- Function to calculate tonnage for job items
CREATE OR REPLACE FUNCTION app.calculate_tonnage()
RETURNS TRIGGER AS $$
DECLARE
  density DECIMAL := 2.4; -- Standard asphalt density
  waste_factor DECIMAL;
BEGIN
  -- Get waste factor from parent job
  SELECT j.waste_factor INTO waste_factor
  FROM app.jobs j
  WHERE j.id = NEW.job_id;
  
  -- Default to 5% if not set
  IF waste_factor IS NULL THEN
    waste_factor := 5.0;
  END IF;
  
  -- Calculate tonnage: area (m²) × depth (mm) × density ÷ 1000 × (1 + waste_factor/100)
  NEW.tonnage := NEW.area_sqm * NEW.depth_mm * density / 1000 * (1 + waste_factor/100);
  
  -- Calculate price if unit price is set
  IF NEW.unit_price_per_tonne IS NOT NULL THEN
    NEW.total_price_ex_gst := NEW.tonnage * NEW.unit_price_per_tonne;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate tonnage on job item insert/update
CREATE TRIGGER calculate_job_item_tonnage
BEFORE INSERT OR UPDATE OF area_sqm, depth_mm, unit_price_per_tonne
ON app.job_items
FOR EACH ROW
EXECUTE FUNCTION app.calculate_tonnage();

-- Function to update job total tonnage
CREATE OR REPLACE FUNCTION app.update_job_total_tonnage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent job's total tonnage
  UPDATE app.jobs
  SET 
    total_tonnage = (
      SELECT COALESCE(SUM(tonnage), 0)
      FROM app.job_items
      WHERE job_id = NEW.job_id
    ),
    updated_at = NOW()
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update job total tonnage when job items change
CREATE TRIGGER update_job_tonnage
AFTER INSERT OR UPDATE OR DELETE
ON app.job_items
FOR EACH ROW
EXECUTE FUNCTION app.update_job_total_tonnage();

-- Function to update job quote totals with GST
CREATE OR REPLACE FUNCTION app.update_job_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  gst_rate DECIMAL := 0.1; -- 10% GST in Australia
BEGIN
  -- Calculate GST amount and total
  NEW.quote_gst_amount := NEW.quote_total_ex_gst * gst_rate;
  NEW.quote_total_inc_gst := NEW.quote_total_ex_gst + NEW.quote_gst_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quote totals with GST
CREATE TRIGGER calculate_quote_gst
BEFORE INSERT OR UPDATE OF quote_total_ex_gst
ON app.jobs
FOR EACH ROW
EXECUTE FUNCTION app.update_job_quote_totals();

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE app.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_geometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.safety_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.quality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.cor_records ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user's tenant_id
CREATE OR REPLACE FUNCTION app.get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT u.tenant_id INTO tenant_id
  FROM app.users u
  WHERE u.id = auth.uid();
  
  RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant isolation policy (applied to all tenant-specific tables)
-- Users can only see data from their own tenant
CREATE POLICY tenant_isolation_policy ON app.users
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.customers
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.customer_contacts
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_sites
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.jobs
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_items
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_hazards
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_equipment
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_materials
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_attachments
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.job_geometry
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.crews
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.crew_members
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.schedules
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.weather_forecasts
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.safety_documents
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.quality_records
  USING (tenant_id = app.get_current_tenant_id());

CREATE POLICY tenant_isolation_policy ON app.cor_records
  USING (tenant_id = app.get_current_tenant_id());

-- Special policy for tenants table (only super admins can see all tenants)
CREATE POLICY tenant_self_view_policy ON app.tenants
  USING (id = app.get_current_tenant_id() OR auth.jwt() ->> 'role' = 'service_role');

-- =================================================================
-- INDEXES
-- =================================================================

-- Tenant ID indexes (for RLS filtering)
CREATE INDEX idx_users_tenant_id ON app.users(tenant_id);
CREATE INDEX idx_customers_tenant_id ON app.customers(tenant_id);
CREATE INDEX idx_jobs_tenant_id ON app.jobs(tenant_id);
CREATE INDEX idx_job_items_tenant_id ON app.job_items(tenant_id);
CREATE INDEX idx_schedules_tenant_id ON app.schedules(tenant_id);

-- Job lookup indexes
CREATE INDEX idx_jobs_customer_id ON app.jobs(customer_id);
CREATE INDEX idx_jobs_site_id ON app.jobs(site_id);
CREATE INDEX idx_jobs_job_status ON app.jobs(job_status);
CREATE INDEX idx_jobs_job_number ON app.jobs(job_number);

-- Schedule lookup indexes
CREATE INDEX idx_schedules_job_id ON app.schedules(job_id);
CREATE INDEX idx_schedules_crew_id ON app.schedules(crew_id);
CREATE INDEX idx_schedules_date_range ON app.schedules(start_time, end_time);

-- Spatial index for job geometry
CREATE INDEX idx_job_geometry_geom ON app.job_geometry USING GIST(geom);

-- Customer search indexes
CREATE INDEX idx_customers_business_name_trgm ON app.customers USING GIN (business_name gin_trgm_ops);
CREATE INDEX idx_customers_abn ON app.customers(abn);

-- =================================================================
-- INITIAL DATA
-- =================================================================

-- Default tenant (for development)
INSERT INTO app.tenants (
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
  'Viable Demo Company', 
  'viable-demo', 
  '12 345 678 901', 
  '123 Main Street', 
  'Sydney', 
  'NSW', 
  '2000', 
  '0412 345 678', 
  'demo@viable-saas.com.au'
);

-- Default admin user (will be linked to auth.users by the application)
INSERT INTO app.users (
  id, 
  tenant_id, 
  first_name, 
  last_name, 
  email, 
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001', 
  '00000000-0000-0000-0000-000000000001', 
  'Admin', 
  'User', 
  'admin@viable-saas.com.au', 
  'owner'
);

-- Default crew
INSERT INTO app.crews (
  id,
  tenant_id,
  name,
  color
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Main Crew',
  '#3498DB'
);

-- Commit the transaction
COMMIT;
