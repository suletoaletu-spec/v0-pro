-- PRO Platform Database Schema
-- Version: 1.0.0
-- Privacy by Design Compliant

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM Types
CREATE TYPE resource_category AS ENUM ('food', 'medicine', 'energy', 'water', 'materials');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'failed');
CREATE TYPE agent_type AS ENUM ('hunter', 'negotiator', 'strategist');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE anomaly_severity AS ENUM ('none', 'low', 'medium', 'high', 'critical');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Resources: Types of resources being tracked (Food, Medicine, Energy, etc.)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category resource_category NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    shelf_life_days INTEGER,
    is_perishable BOOLEAN DEFAULT false,
    carbon_footprint_per_unit DECIMAL(10, 4),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_name ON resources(name);

-- Providers: Organizations that supply resources
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email_hash VARCHAR(64), -- Hashed for privacy
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    capacity_per_day DECIMAL(15, 2),
    reliability_score DECIMAL(3, 2) DEFAULT 1.00,
    compliance_certifications JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    data_processing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_country ON providers(country);
CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_providers_location ON providers USING GIST (
    point(location_lat, location_lng)
);

-- Demand Locations: Areas with resource needs
CREATE TABLE demand_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    population BIGINT,
    priority_level priority_level DEFAULT 'medium',
    gdp_per_capita DECIMAL(15, 2),
    healthcare_index DECIMAL(5, 2),
    infrastructure_score DECIMAL(3, 2),
    timezone VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_demand_locations_country ON demand_locations(country);
CREATE INDEX idx_demand_locations_priority ON demand_locations(priority_level);
CREATE INDEX idx_demand_locations_geo ON demand_locations USING GIST (
    point(location_lat, location_lng)
);

-- Inventory: Current stock levels at providers
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    quantity_available DECIMAL(15, 2) NOT NULL,
    unit_cost DECIMAL(15, 4),
    currency VARCHAR(3) DEFAULT 'USD',
    expiration_date DATE,
    quality_grade VARCHAR(10),
    storage_conditions JSONB DEFAULT '{}',
    is_surplus BOOLEAN DEFAULT false,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_quantity CHECK (quantity_available >= 0)
);

CREATE INDEX idx_inventory_provider ON inventory(provider_id);
CREATE INDEX idx_inventory_resource ON inventory(resource_id);
CREATE INDEX idx_inventory_surplus ON inventory(is_surplus) WHERE is_surplus = true;
CREATE INDEX idx_inventory_expiration ON inventory(expiration_date);

-- ============================================================================
-- AI & FORECASTING TABLES
-- ============================================================================

-- Demand Forecasts: AI-generated predictions
CREATE TABLE demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES demand_locations(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(15, 2) NOT NULL,
    confidence_lower DECIMAL(15, 2),
    confidence_upper DECIMAL(15, 2),
    confidence_level DECIMAL(3, 2) DEFAULT 0.95,
    anomaly_detected BOOLEAN DEFAULT false,
    anomaly_severity anomaly_severity DEFAULT 'none',
    anomaly_description TEXT,
    external_factors JSONB DEFAULT '{}',
    model_version VARCHAR(50),
    model_accuracy DECIMAL(5, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecasts_location ON demand_forecasts(location_id);
CREATE INDEX idx_forecasts_resource ON demand_forecasts(resource_id);
CREATE INDEX idx_forecasts_date ON demand_forecasts(forecast_date);
CREATE INDEX idx_forecasts_anomaly ON demand_forecasts(anomaly_detected) WHERE anomaly_detected = true;

-- AI Transactions: Resource movements negotiated by AI agents
CREATE TABLE ai_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
    source_provider_id UUID NOT NULL REFERENCES providers(id),
    destination_location_id UUID NOT NULL REFERENCES demand_locations(id),
    resource_id UUID NOT NULL REFERENCES resources(id),
    quantity DECIMAL(15, 2) NOT NULL,
    negotiated_price DECIMAL(15, 4),
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_cost DECIMAL(15, 4),
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    carbon_offset DECIMAL(10, 2),
    success_probability DECIMAL(5, 4),
    lives_impacted INTEGER,
    economic_value DECIMAL(15, 2),
    ai_reasoning TEXT,
    route_data JSONB DEFAULT '{}',
    status transaction_status DEFAULT 'pending',
    authorized_by UUID,
    authorized_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT valid_probability CHECK (success_probability >= 0 AND success_probability <= 1)
);

CREATE INDEX idx_transactions_status ON ai_transactions(status);
CREATE INDEX idx_transactions_source ON ai_transactions(source_provider_id);
CREATE INDEX idx_transactions_destination ON ai_transactions(destination_location_id);
CREATE INDEX idx_transactions_resource ON ai_transactions(resource_id);
CREATE INDEX idx_transactions_pending ON ai_transactions(status) WHERE status = 'pending';

-- AI Agent Logs: Track agent activities and decisions
CREATE TABLE ai_agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES ai_transactions(id) ON DELETE SET NULL,
    agent_type agent_type NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER,
    tokens_used INTEGER,
    memory_state JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_transaction ON ai_agent_logs(transaction_id);
CREATE INDEX idx_agent_logs_type ON ai_agent_logs(agent_type);
CREATE INDEX idx_agent_logs_created ON ai_agent_logs(created_at);

-- ============================================================================
-- PRIVACY & COMPLIANCE TABLES
-- ============================================================================

-- Data Consent: Track GDPR/CCPA compliance
CREATE TABLE data_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    jurisdiction VARCHAR(50),
    legal_basis VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_provider ON data_consent(provider_id);
CREATE INDEX idx_consent_active ON data_consent(revoked_at) WHERE revoked_at IS NULL;

-- Audit Trail: Immutable log for compliance
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID,
    actor_type VARCHAR(50),
    previous_state JSONB,
    new_state JSONB,
    ip_address_hash VARCHAR(64), -- Anonymized
    user_agent_hash VARCHAR(64), -- Anonymized
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_trail(actor_id);
CREATE INDEX idx_audit_created ON audit_trail(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_locations_updated_at
    BEFORE UPDATE ON demand_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON ai_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger for transactions
CREATE OR REPLACE FUNCTION audit_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (entity_type, entity_id, action, previous_state, new_state)
        VALUES ('ai_transactions', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (entity_type, entity_id, action, new_state)
        VALUES ('ai_transactions', NEW.id, 'INSERT', to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE ON ai_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_transaction_changes();

-- ============================================================================
-- ROW LEVEL SECURITY (Privacy by Design)
-- ============================================================================

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_consent ENABLE ROW LEVEL SECURITY;

-- Create policies (to be customized based on authentication system)
-- Example: Providers can only see their own data
-- CREATE POLICY provider_isolation ON providers
--     FOR ALL
--     USING (id = current_setting('app.current_provider_id')::uuid);

COMMENT ON TABLE resources IS 'Types of resources tracked by PRO (food, medicine, energy, etc.)';
COMMENT ON TABLE providers IS 'Organizations supplying resources to the network';
COMMENT ON TABLE demand_locations IS 'Geographic areas with resource demands';
COMMENT ON TABLE inventory IS 'Current stock levels at provider locations';
COMMENT ON TABLE demand_forecasts IS 'AI-generated demand predictions with anomaly detection';
COMMENT ON TABLE ai_transactions IS 'Resource movements negotiated by AI agents';
COMMENT ON TABLE ai_agent_logs IS 'Activity logs for Hunter, Negotiator, and Strategist agents';
COMMENT ON TABLE data_consent IS 'GDPR/CCPA consent tracking';
COMMENT ON TABLE audit_trail IS 'Immutable audit log for compliance';
