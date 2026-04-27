# PRO Platform - Entity Relationship Diagram

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PREDICTIVE RESOURCE ORCHESTRATOR                           │
│                              Entity Relationship Diagram                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    RESOURCES     │       │    PROVIDERS     │       │  DEMAND_LOCATIONS│
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ name             │       │ name             │       │ name             │
│ category         │◄──────│ resource_id (FK) │       │ region           │
│ unit_of_measure  │       │ location_lat     │       │ country          │
│ shelf_life_days  │       │ location_lng     │       │ location_lat     │
│ is_perishable    │       │ country          │       │ location_lng     │
│ carbon_footprint │       │ region           │       │ population       │
│ created_at       │       │ capacity_per_day │       │ priority_level   │
│ updated_at       │       │ reliability_score│       │ gdp_per_capita   │
└──────────────────┘       │ compliance_cert  │       │ healthcare_index │
         │                 │ is_active        │       │ created_at       │
         │                 │ created_at       │       │ updated_at       │
         │                 │ updated_at       │       └──────────────────┘
         │                 └──────────────────┘                │
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              INVENTORY                                    │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ provider_id (FK) ─────────────────────────────────────────────► PROVIDERS │
│ resource_id (FK) ─────────────────────────────────────────────► RESOURCES │
│ quantity_available                                                        │
│ unit_cost                                                                 │
│ expiration_date                                                           │
│ quality_grade                                                             │
│ storage_conditions                                                        │
│ last_updated                                                              │
│ is_surplus                                                                │
└──────────────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           DEMAND_FORECASTS                                │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ location_id (FK) ──────────────────────────────────────► DEMAND_LOCATIONS │
│ resource_id (FK) ─────────────────────────────────────────────► RESOURCES │
│ forecast_date                                                             │
│ predicted_demand                                                          │
│ confidence_interval                                                       │
│ anomaly_detected                                                          │
│ anomaly_severity                                                          │
│ external_factors (JSONB)                                                  │
│ model_version                                                             │
│ created_at                                                                │
└──────────────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           AI_TRANSACTIONS                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ transaction_uuid (UNIQUE)                                                 │
│ source_provider_id (FK) ──────────────────────────────────────► PROVIDERS │
│ destination_location_id (FK) ─────────────────────────► DEMAND_LOCATIONS  │
│ resource_id (FK) ─────────────────────────────────────────────► RESOURCES │
│ quantity                                                                  │
│ negotiated_price                                                          │
│ shipping_cost                                                             │
│ estimated_delivery_date                                                   │
│ carbon_offset                                                             │
│ success_probability                                                       │
│ lives_impacted                                                            │
│ economic_value                                                            │
│ ai_reasoning (TEXT)                                                       │
│ route_data (JSONB)                                                        │
│ status (ENUM: pending/approved/rejected/in_transit/completed/failed)      │
│ authorized_by                                                             │
│ authorized_at                                                             │
│ created_at                                                                │
│ updated_at                                                                │
└──────────────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           AI_AGENT_LOGS                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ transaction_id (FK) ───────────────────────────────────► AI_TRANSACTIONS  │
│ agent_type (ENUM: hunter/negotiator/strategist)                           │
│ action_type                                                               │
│ input_data (JSONB)                                                        │
│ output_data (JSONB)                                                       │
│ execution_time_ms                                                         │
│ memory_state (JSONB)                                                      │
│ created_at                                                                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           AUDIT_TRAIL                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ entity_type                                                               │
│ entity_id                                                                 │
│ action                                                                    │
│ actor_id                                                                  │
│ actor_type                                                                │
│ previous_state (JSONB)                                                    │
│ new_state (JSONB)                                                         │
│ ip_address (anonymized for GDPR)                                          │
│ created_at                                                                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA_CONSENT                                    │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                   │
│ provider_id (FK) ─────────────────────────────────────────────► PROVIDERS │
│ consent_type                                                              │
│ granted_at                                                                │
│ expires_at                                                                │
│ revoked_at                                                                │
│ jurisdiction                                                              │
│ purpose                                                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Privacy by Design Considerations

1. **Data Minimization**: Only collect necessary data for resource orchestration
2. **Purpose Limitation**: Clear consent tracking via DATA_CONSENT table
3. **Audit Trail**: Complete traceability with anonymized PII
4. **Data Retention**: Configurable retention policies per jurisdiction
5. **Right to Erasure**: Soft-delete support with cascading anonymization
6. **Encryption**: All sensitive fields encrypted at rest (AES-256)
