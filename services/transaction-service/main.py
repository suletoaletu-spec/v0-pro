"""
PRO Platform - Transaction Service
Manages AI-negotiated resource transactions and human-in-the-loop authorization
"""

from fastapi import FastAPI, HTTPException, Query
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
import os
import logging
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
import json

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("transaction-service")

# Database pool
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool, redis_client
    
    # Startup
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    logger.info("Transaction Service started")
    
    yield
    
    # Shutdown
    await db_pool.close()
    await redis_client.close()
    logger.info("Transaction Service stopped")


app = FastAPI(
    title="PRO Transaction Service",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================================
# MODELS
# ============================================================================

class TransactionResponse(BaseModel):
    id: str
    transaction_uuid: str
    source_provider_name: str
    destination_name: str
    resource_name: str
    quantity: float
    negotiated_price: Optional[float]
    shipping_cost: Optional[float]
    estimated_delivery_date: Optional[datetime]
    carbon_offset: Optional[float]
    success_probability: Optional[float]
    lives_impacted: Optional[int]
    economic_value: Optional[float]
    ai_reasoning: Optional[str]
    route_data: Optional[dict]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuthorizationRequest(BaseModel):
    action: str  # "approve" or "reject"
    reason: Optional[str] = None
    authorized_by: str


class MetricsResponse(BaseModel):
    total_surplus_tons: float
    shortages_prevented: int
    carbon_saved_tons: float
    total_lives_impacted: int
    total_economic_value: float
    pending_count: int


# ============================================================================
# HEALTH
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "transaction-service"}


# ============================================================================
# TRANSACTIONS
# ============================================================================

@app.get("/transactions")
async def get_transactions(status: Optional[str] = None, limit: int = Query(100, le=500)):
    """Get transactions with optional status filter"""
    async with db_pool.acquire() as conn:
        if status:
            query = """
                SELECT 
                    t.id, t.transaction_uuid, 
                    p.name as source_provider_name,
                    dl.name as destination_name,
                    r.name as resource_name,
                    t.quantity, t.negotiated_price, t.shipping_cost,
                    t.estimated_delivery_date, t.carbon_offset,
                    t.success_probability, t.lives_impacted, t.economic_value,
                    t.ai_reasoning, t.route_data, t.status, t.created_at
                FROM ai_transactions t
                JOIN providers p ON t.source_provider_id = p.id
                JOIN demand_locations dl ON t.destination_location_id = dl.id
                JOIN resources r ON t.resource_id = r.id
                WHERE t.status = $1
                ORDER BY t.created_at DESC
                LIMIT $2
            """
            rows = await conn.fetch(query, status, limit)
        else:
            query = """
                SELECT 
                    t.id, t.transaction_uuid,
                    p.name as source_provider_name,
                    dl.name as destination_name,
                    r.name as resource_name,
                    t.quantity, t.negotiated_price, t.shipping_cost,
                    t.estimated_delivery_date, t.carbon_offset,
                    t.success_probability, t.lives_impacted, t.economic_value,
                    t.ai_reasoning, t.route_data, t.status, t.created_at
                FROM ai_transactions t
                JOIN providers p ON t.source_provider_id = p.id
                JOIN demand_locations dl ON t.destination_location_id = dl.id
                JOIN resources r ON t.resource_id = r.id
                ORDER BY t.created_at DESC
                LIMIT $1
            """
            rows = await conn.fetch(query, limit)
        
        return [dict(row) for row in rows]


@app.get("/transactions/pending")
async def get_pending_transactions():
    """Get pending transactions awaiting human authorization"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT 
                t.id, t.transaction_uuid,
                p.name as source_provider_name,
                p.country as source_country,
                p.location_lat as source_lat,
                p.location_lng as source_lng,
                dl.name as destination_name,
                dl.country as destination_country,
                dl.location_lat as dest_lat,
                dl.location_lng as dest_lng,
                dl.priority_level,
                r.name as resource_name,
                r.category as resource_category,
                t.quantity, t.negotiated_price, t.currency, t.shipping_cost,
                t.estimated_delivery_date, t.carbon_offset,
                t.success_probability, t.lives_impacted, t.economic_value,
                t.ai_reasoning, t.route_data, t.status, t.created_at
            FROM ai_transactions t
            JOIN providers p ON t.source_provider_id = p.id
            JOIN demand_locations dl ON t.destination_location_id = dl.id
            JOIN resources r ON t.resource_id = r.id
            WHERE t.status = 'pending'
            ORDER BY 
                CASE dl.priority_level 
                    WHEN 'critical' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    ELSE 4 
                END,
                t.created_at ASC
        """
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]


@app.get("/transactions/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Get specific transaction details"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT 
                t.*,
                p.name as source_provider_name,
                p.country as source_country,
                p.location_lat as source_lat,
                p.location_lng as source_lng,
                dl.name as destination_name,
                dl.country as destination_country,
                dl.location_lat as dest_lat,
                dl.location_lng as dest_lng,
                dl.priority_level,
                r.name as resource_name,
                r.category as resource_category
            FROM ai_transactions t
            JOIN providers p ON t.source_provider_id = p.id
            JOIN demand_locations dl ON t.destination_location_id = dl.id
            JOIN resources r ON t.resource_id = r.id
            WHERE t.id = $1 OR t.transaction_uuid = $1
        """
        row = await conn.fetchrow(query, transaction_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return dict(row)


@app.post("/transactions/{transaction_id}/authorize")
async def authorize_transaction(transaction_id: str, auth_request: AuthorizationRequest):
    """Authorize or reject a pending transaction (Human-in-the-Loop)"""
    if auth_request.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    async with db_pool.acquire() as conn:
        # Verify transaction exists and is pending
        check_query = "SELECT id, status FROM ai_transactions WHERE id = $1 OR transaction_uuid = $1"
        row = await conn.fetchrow(check_query, transaction_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if row["status"] != "pending":
            raise HTTPException(
                status_code=400, 
                detail=f"Transaction is already {row['status']}"
            )
        
        # Update transaction status
        new_status = "approved" if auth_request.action == "approve" else "rejected"
        
        update_query = """
            UPDATE ai_transactions 
            SET 
                status = $1,
                authorized_by = $2,
                authorized_at = NOW(),
                rejection_reason = $3
            WHERE id = $4
            RETURNING *
        """
        
        updated_row = await conn.fetchrow(
            update_query,
            new_status,
            auth_request.authorized_by,
            auth_request.reason if auth_request.action == "reject" else None,
            row["id"],
        )
        
        # Publish event to Redis for real-time updates
        await redis_client.publish(
            "transaction:authorized",
            json.dumps({
                "transaction_id": str(row["id"]),
                "status": new_status,
                "authorized_by": auth_request.authorized_by,
                "timestamp": datetime.utcnow().isoformat(),
            }),
        )
        
        logger.info(f"Transaction {transaction_id} {new_status} by {auth_request.authorized_by}")
        
        return {
            "status": "success",
            "transaction_id": str(row["id"]),
            "new_status": new_status,
            "authorized_at": datetime.utcnow().isoformat(),
        }


@app.get("/metrics")
async def get_metrics() -> MetricsResponse:
    """Get aggregated transaction metrics"""
    async with db_pool.acquire() as conn:
        # Get various metrics
        metrics_query = """
            SELECT 
                COALESCE(SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END), 0) as total_surplus_tons,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as shortages_prevented,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN carbon_offset ELSE 0 END), 0) as carbon_saved_tons,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN lives_impacted ELSE 0 END), 0) as total_lives_impacted,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN economic_value ELSE 0 END), 0) as total_economic_value,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
            FROM ai_transactions
        """
        
        row = await conn.fetchrow(metrics_query)
        
        return MetricsResponse(
            total_surplus_tons=float(row["total_surplus_tons"]),
            shortages_prevented=int(row["shortages_prevented"]),
            carbon_saved_tons=float(row["carbon_saved_tons"]),
            total_lives_impacted=int(row["total_lives_impacted"]),
            total_economic_value=float(row["total_economic_value"]),
            pending_count=int(row["pending_count"]),
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
