-- PRO Platform Seed Data
-- Sample data for development and testing

-- ============================================================================
-- RESOURCES
-- ============================================================================

INSERT INTO resources (name, category, unit_of_measure, shelf_life_days, is_perishable, carbon_footprint_per_unit, description) VALUES
-- Food Resources
('Wheat Grain', 'food', 'metric_tons', 365, false, 0.42, 'Bulk wheat grain for flour production'),
('Rice (Long Grain)', 'food', 'metric_tons', 730, false, 0.35, 'Premium long-grain rice'),
('Powdered Milk', 'food', 'metric_tons', 540, false, 0.28, 'Fortified powdered milk'),
('Canned Vegetables', 'food', 'metric_tons', 1095, false, 0.15, 'Mixed canned vegetables'),
('Fresh Produce', 'food', 'metric_tons', 14, true, 0.22, 'Seasonal fresh produce'),

-- Medicine Resources
('Antibiotics (Generic)', 'medicine', 'units', 730, false, 0.01, 'Broad-spectrum antibiotics'),
('Insulin', 'medicine', 'units', 90, true, 0.02, 'Refrigerated insulin supplies'),
('Vaccines (Standard)', 'medicine', 'doses', 180, true, 0.005, 'Standard vaccination doses'),
('Medical PPE', 'medicine', 'units', NULL, false, 0.03, 'Personal protective equipment'),
('Emergency Medication Kit', 'medicine', 'kits', 365, false, 0.08, 'Pre-packaged emergency medical supplies'),

-- Energy Resources
('Solar Panels', 'energy', 'units', NULL, false, 2.50, '400W photovoltaic panels'),
('Diesel Fuel', 'energy', 'liters', NULL, false, 2.68, 'Emergency diesel fuel'),
('Battery Storage', 'energy', 'kwh', NULL, false, 0.12, 'Lithium battery storage units'),
('Portable Generators', 'energy', 'units', NULL, false, 1.85, 'Diesel portable generators'),

-- Water Resources
('Purified Water', 'water', 'liters', 365, false, 0.001, 'Bottled purified water'),
('Water Purification Tablets', 'water', 'units', 1825, false, 0.0001, 'Emergency water purification'),

-- Materials
('Construction Steel', 'materials', 'metric_tons', NULL, false, 1.85, 'Structural steel beams'),
('Emergency Shelter Kits', 'materials', 'units', NULL, false, 0.45, 'Rapid deployment shelter systems');

-- ============================================================================
-- DEMAND LOCATIONS (Global Cities)
-- ============================================================================

INSERT INTO demand_locations (name, region, country, location_lat, location_lng, population, priority_level, gdp_per_capita, healthcare_index, infrastructure_score, timezone) VALUES
-- Africa
('Lagos', 'West Africa', 'Nigeria', 6.5244, 3.3792, 15388000, 'high', 2229, 45.2, 0.58, 'Africa/Lagos'),
('Nairobi', 'East Africa', 'Kenya', -1.2921, 36.8219, 4397073, 'medium', 1838, 52.3, 0.65, 'Africa/Nairobi'),
('Cairo', 'North Africa', 'Egypt', 30.0444, 31.2357, 21750000, 'medium', 3020, 58.7, 0.72, 'Africa/Cairo'),

-- Asia
('Mumbai', 'South Asia', 'India', 19.0760, 72.8777, 20411274, 'high', 2104, 61.5, 0.68, 'Asia/Kolkata'),
('Jakarta', 'Southeast Asia', 'Indonesia', -6.2088, 106.8456, 10562088, 'medium', 4256, 55.8, 0.62, 'Asia/Jakarta'),
('Dhaka', 'South Asia', 'Bangladesh', 23.8103, 90.4125, 21741000, 'critical', 1968, 48.2, 0.52, 'Asia/Dhaka'),
('Manila', 'Southeast Asia', 'Philippines', 14.5995, 120.9842, 13923452, 'medium', 3485, 54.6, 0.59, 'Asia/Manila'),

-- South America
('São Paulo', 'South America', 'Brazil', -23.5505, -46.6333, 12325232, 'medium', 8717, 67.8, 0.75, 'America/Sao_Paulo'),
('Lima', 'South America', 'Peru', -12.0464, -77.0428, 10882757, 'medium', 6978, 59.4, 0.68, 'America/Lima'),
('Caracas', 'South America', 'Venezuela', 10.4806, -66.9036, 2082000, 'critical', 3374, 42.1, 0.45, 'America/Caracas'),

-- Middle East
('Beirut', 'Middle East', 'Lebanon', 33.8938, 35.5018, 2424000, 'critical', 4893, 51.2, 0.48, 'Asia/Beirut'),
('Sanaa', 'Middle East', 'Yemen', 15.3694, 44.1910, 2957000, 'critical', 824, 32.5, 0.35, 'Asia/Aden'),

-- Europe (for surplus sources)
('Rotterdam', 'Western Europe', 'Netherlands', 51.9244, 4.4777, 651157, 'low', 52448, 89.2, 0.95, 'Europe/Amsterdam'),
('Hamburg', 'Western Europe', 'Germany', 53.5511, 9.9937, 1841179, 'low', 48264, 91.5, 0.94, 'Europe/Berlin');

-- ============================================================================
-- PROVIDERS (Global Suppliers)
-- ============================================================================

INSERT INTO providers (name, location_lat, location_lng, country, region, capacity_per_day, reliability_score, is_verified, data_processing_consent, compliance_certifications) VALUES
-- Major Food Suppliers
('Global Grain Cooperative', 51.5074, -0.1278, 'United Kingdom', 'Europe', 50000, 0.95, true, true, '["ISO 22000", "HACCP", "BRC"]'),
('Pacific Rice Federation', 35.6762, 139.6503, 'Japan', 'Asia-Pacific', 35000, 0.92, true, true, '["JAS Organic", "ISO 22000"]'),
('Mediterranean Agricultural Network', 41.9028, 12.4964, 'Italy', 'Europe', 28000, 0.88, true, true, '["EU Organic", "GlobalG.A.P."]'),
('North American Grain Exchange', 41.8781, -87.6298, 'United States', 'North America', 75000, 0.96, true, true, '["USDA Organic", "SQF"]'),

-- Pharmaceutical Suppliers
('Swiss Pharma Alliance', 47.3769, 8.5417, 'Switzerland', 'Europe', 1000000, 0.99, true, true, '["GMP", "WHO Prequalification", "FDA"]'),
('Generic Medicine Coalition', 28.6139, 77.2090, 'India', 'Asia', 5000000, 0.91, true, true, '["WHO GMP", "FDA ANDA"]'),
('Nordic Healthcare Supplies', 59.3293, 18.0686, 'Sweden', 'Europe', 500000, 0.97, true, true, '["GMP", "ISO 13485"]'),

-- Energy Suppliers
('Scandinavian Solar Initiative', 60.1699, 24.9384, 'Finland', 'Europe', 5000, 0.94, true, true, '["IEC 61215", "ISO 14001"]'),
('Asia Battery Consortium', 37.5665, 126.9780, 'South Korea', 'Asia', 10000, 0.93, true, true, '["UL", "IEC 62133"]'),

-- Water & Materials
('European Water Alliance', 52.3676, 4.9041, 'Netherlands', 'Europe', 100000, 0.98, true, true, '["NSF", "ISO 22000"]'),
('Global Shelter Initiative', 52.5200, 13.4050, 'Germany', 'Europe', 2000, 0.90, true, true, '["ISO 9001", "Sphere Standards"]');

-- ============================================================================
-- INVENTORY (Current Stock)
-- ============================================================================

INSERT INTO inventory (provider_id, resource_id, quantity_available, unit_cost, currency, expiration_date, quality_grade, is_surplus)
SELECT 
    p.id,
    r.id,
    CASE 
        WHEN r.category = 'food' THEN floor(random() * 10000 + 5000)
        WHEN r.category = 'medicine' THEN floor(random() * 1000000 + 100000)
        WHEN r.category = 'energy' THEN floor(random() * 1000 + 500)
        ELSE floor(random() * 5000 + 1000)
    END,
    CASE 
        WHEN r.category = 'food' THEN random() * 200 + 100
        WHEN r.category = 'medicine' THEN random() * 50 + 5
        WHEN r.category = 'energy' THEN random() * 500 + 100
        ELSE random() * 100 + 50
    END,
    'USD',
    CASE WHEN r.is_perishable THEN CURRENT_DATE + (r.shelf_life_days * random())::integer ELSE NULL END,
    CASE floor(random() * 3)
        WHEN 0 THEN 'A'
        WHEN 1 THEN 'A+'
        ELSE 'B+'
    END,
    random() > 0.7
FROM providers p
CROSS JOIN resources r
WHERE 
    (p.name LIKE '%Grain%' AND r.category = 'food') OR
    (p.name LIKE '%Rice%' AND r.name LIKE '%Rice%') OR
    (p.name LIKE '%Pharma%' AND r.category = 'medicine') OR
    (p.name LIKE '%Medicine%' AND r.category = 'medicine') OR
    (p.name LIKE '%Solar%' AND r.category = 'energy') OR
    (p.name LIKE '%Battery%' AND r.category = 'energy') OR
    (p.name LIKE '%Water%' AND r.category = 'water') OR
    (p.name LIKE '%Shelter%' AND r.category = 'materials');

-- ============================================================================
-- SAMPLE DEMAND FORECASTS
-- ============================================================================

INSERT INTO demand_forecasts (location_id, resource_id, forecast_date, predicted_demand, confidence_lower, confidence_upper, anomaly_detected, anomaly_severity, external_factors, model_version)
SELECT 
    dl.id,
    r.id,
    CURRENT_DATE + (generate_series(1, 30)),
    CASE 
        WHEN r.category = 'food' THEN (dl.population / 100000.0) * (random() * 50 + 100)
        WHEN r.category = 'medicine' THEN (dl.population / 100000.0) * (random() * 1000 + 500)
        ELSE (dl.population / 100000.0) * (random() * 10 + 5)
    END,
    CASE 
        WHEN r.category = 'food' THEN (dl.population / 100000.0) * (random() * 40 + 80)
        ELSE (dl.population / 100000.0) * (random() * 800 + 400)
    END,
    CASE 
        WHEN r.category = 'food' THEN (dl.population / 100000.0) * (random() * 60 + 120)
        ELSE (dl.population / 100000.0) * (random() * 1200 + 600)
    END,
    CASE WHEN random() > 0.92 THEN true ELSE false END,
    CASE 
        WHEN random() > 0.98 THEN 'critical'::anomaly_severity
        WHEN random() > 0.95 THEN 'high'::anomaly_severity
        WHEN random() > 0.92 THEN 'medium'::anomaly_severity
        ELSE 'none'::anomaly_severity
    END,
    jsonb_build_object(
        'weather_index', random() * 100,
        'economic_index', random() * 100,
        'conflict_risk', random() * 100,
        'season', CASE floor(random() * 4) WHEN 0 THEN 'spring' WHEN 1 THEN 'summer' WHEN 2 THEN 'fall' ELSE 'winter' END
    ),
    'prophet-v2.1'
FROM demand_locations dl
CROSS JOIN resources r
WHERE dl.priority_level IN ('high', 'critical')
AND r.category IN ('food', 'medicine')
LIMIT 200;

-- ============================================================================
-- SAMPLE AI TRANSACTIONS (Pending Approvals)
-- ============================================================================

INSERT INTO ai_transactions (
    source_provider_id, destination_location_id, resource_id,
    quantity, negotiated_price, shipping_cost, estimated_delivery_date,
    carbon_offset, success_probability, lives_impacted, economic_value,
    ai_reasoning, route_data, status
)
SELECT 
    (SELECT id FROM providers WHERE name = 'Global Grain Cooperative'),
    (SELECT id FROM demand_locations WHERE name = 'Dhaka'),
    (SELECT id FROM resources WHERE name = 'Wheat Grain'),
    12500.00,
    287500.00,
    45000.00,
    NOW() + interval '14 days',
    5250.00,
    0.89,
    3200000,
    8750000.00,
    'Analysis indicates a 14-day food security gap in Dhaka region due to delayed monsoon affecting local harvest. Global Grain Cooperative has verified surplus with Grade A+ quality. Shipping via Rotterdam-Singapore-Chittagong route optimized for cost and carbon efficiency. Local distribution network confirmed operational.',
    '{"waypoints": ["Rotterdam", "Singapore", "Chittagong"], "transport_modes": ["sea", "sea", "rail"], "estimated_co2_kg": 5250}'::jsonb,
    'pending'
UNION ALL
SELECT 
    (SELECT id FROM providers WHERE name = 'Swiss Pharma Alliance'),
    (SELECT id FROM demand_locations WHERE name = 'Sanaa'),
    (SELECT id FROM resources WHERE name = 'Vaccines (Standard)'),
    500000,
    2500000.00,
    125000.00,
    NOW() + interval '7 days',
    180.00,
    0.94,
    500000,
    12500000.00,
    'Critical vaccination campaign required in Sanaa. WHO has certified the batch. Air freight via neutral corridors confirmed. Cold chain integrity guaranteed with redundant monitoring. Local health ministry coordination complete.',
    '{"waypoints": ["Geneva", "Amman", "Sanaa"], "transport_modes": ["air", "air"], "cold_chain": true, "temp_range_c": [2, 8]}'::jsonb,
    'pending'
UNION ALL
SELECT 
    (SELECT id FROM providers WHERE name = 'Asia Battery Consortium'),
    (SELECT id FROM demand_locations WHERE name = 'Beirut'),
    (SELECT id FROM resources WHERE name = 'Battery Storage'),
    2500,
    875000.00,
    95000.00,
    NOW() + interval '21 days',
    320.00,
    0.86,
    1200000,
    4500000.00,
    'Beirut grid instability creating healthcare and infrastructure risks. Battery storage will provide 72-hour emergency backup for 3 major hospitals and critical infrastructure. Supplier reliability confirmed. Local technical teams trained.',
    '{"waypoints": ["Busan", "Dubai", "Beirut"], "transport_modes": ["sea", "road"], "handling": "hazmat_class_9"}'::jsonb,
    'pending';
