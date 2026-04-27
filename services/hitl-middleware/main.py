"""
PRO Platform - Human-in-the-Loop (HITL) Middleware Service
Manages approval workflows with WebSockets, notifications, and emergency escalation

Features:
- WebSocket connections for real-time state updates
- Webhook notifications via Pushover/Firebase
- Digital signature verification for authorization
- Emergency escalation after timeout (4 hours)
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
import os
import logging
import json
import hmac
import hashlib
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Set
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
import httpx
from enum import Enum

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
PUSHOVER_USER_KEY = os.getenv("PUSHOVER_USER_KEY")
PUSHOVER_API_TOKEN = os.getenv("PUSHOVER_API_TOKEN")
FIREBASE_SERVER_KEY = os.getenv("FIREBASE_SERVER_KEY")
FIREBASE_DEVICE_TOKEN = os.getenv("FIREBASE_DEVICE_TOKEN")
DIGITAL_SIGNATURE_SECRET = os.getenv("DIGITAL_SIGNATURE_SECRET", "pro-secret-key-change-in-production")
AUTHORIZATION_TIMEOUT_HOURS = int(os.getenv("AUTHORIZATION_TIMEOUT_HOURS", "4"))
BACKUP_CONTACTS_EMAIL = os.getenv("BACKUP_CONTACTS_EMAIL", "backup@pro-platform.org")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hitl-middleware")

# Database pool and Redis
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None

# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, channel: str = "global"):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        logger.info(f"WebSocket connected to channel: {channel}")
    
    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.user_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")
    
    def disconnect(self, websocket: WebSocket, channel: str = "global"):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
    
    def disconnect_user(self, user_id: str):
        if user_id in self.user_connections:
            del self.user_connections[user_id]
    
    async def broadcast(self, message: dict, channel: str = "global"):
        if channel in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.add(connection)
            # Clean up dead connections
            self.active_connections[channel] -= dead_connections
    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_json(message)
            except Exception:
                self.disconnect_user(user_id)

manager = ConnectionManager()


# ============================================================================
# MODELS
# ============================================================================

class ApprovalStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    ESCALATED = "ESCALATED"
    EXPIRED = "EXPIRED"


class ActionPlan(BaseModel):
    """Action plan created by the Strategist Agent"""
    plan_id: str = Field(default_factory=lambda: str(uuid4()))
    transaction_uuid: str
    summary: str
    resource_type: str
    quantity: float
    source_location: str
    destination_location: str
    ai_reasoning: str
    success_probability: float
    estimated_cost: float
    lives_impacted: int
    carbon_offset: float
    route_data: dict
    risk_assessment: str
    alternative_scenarios: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    status: ApprovalStatus = ApprovalStatus.PENDING_APPROVAL


class AuthorizationPayload(BaseModel):
    """Payload for authorizing an action plan"""
    plan_id: str
    action: str  # "approve" or "reject"
    signature: str  # Digital signature for verification
    timestamp: str  # ISO format timestamp
    reason: Optional[str] = None


class EmergencyBriefing(BaseModel):
    """Emergency briefing sent when timeout occurs"""
    plan_id: str
    urgency_level: str
    summary: str
    time_elapsed_hours: float
    impact_if_delayed: str
    recommended_action: str
    backup_contacts: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationPayload(BaseModel):
    """Webhook notification payload"""
    title: str
    message: str
    priority: int = 1  # 0=lowest, 2=emergency
    url: Optional[str] = None
    sound: Optional[str] = None


# ============================================================================
# LIFECYCLE
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool, redis_client
    
    # Startup
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    
    # Start background task for timeout monitoring
    asyncio.create_task(monitor_pending_approvals())
    
    logger.info("HITL Middleware Service started")
    
    yield
    
    # Shutdown
    await db_pool.close()
    await redis_client.close()
    logger.info("HITL Middleware Service stopped")


app = FastAPI(
    title="PRO HITL Middleware",
    description="Human-in-the-Loop authorization middleware with WebSockets and notifications",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DIGITAL SIGNATURE VERIFICATION
# ============================================================================

def generate_signature(plan_id: str, action: str, timestamp: str) -> str:
    """Generate a digital signature for authorization"""
    message = f"{plan_id}:{action}:{timestamp}"
    signature = hmac.new(
        DIGITAL_SIGNATURE_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature


def verify_signature(payload: AuthorizationPayload) -> bool:
    """Verify the digital signature"""
    expected_signature = generate_signature(
        payload.plan_id,
        payload.action,
        payload.timestamp
    )
    return hmac.compare_digest(payload.signature, expected_signature)


# ============================================================================
# NOTIFICATION SERVICES
# ============================================================================

async def send_pushover_notification(notification: NotificationPayload):
    """Send notification via Pushover"""
    if not PUSHOVER_USER_KEY or not PUSHOVER_API_TOKEN:
        logger.warning("Pushover credentials not configured")
        return False
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.pushover.net/1/messages.json",
                data={
                    "token": PUSHOVER_API_TOKEN,
                    "user": PUSHOVER_USER_KEY,
                    "title": notification.title,
                    "message": notification.message,
                    "priority": notification.priority,
                    "url": notification.url or "",
                    "sound": notification.sound or "pushover",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            logger.info(f"Pushover notification sent: {notification.title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send Pushover notification: {e}")
            return False


async def send_firebase_notification(notification: NotificationPayload):
    """Send notification via Firebase Cloud Messaging"""
    if not FIREBASE_SERVER_KEY or not FIREBASE_DEVICE_TOKEN:
        logger.warning("Firebase credentials not configured")
        return False
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://fcm.googleapis.com/fcm/send",
                headers={
                    "Authorization": f"key={FIREBASE_SERVER_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "to": FIREBASE_DEVICE_TOKEN,
                    "notification": {
                        "title": notification.title,
                        "body": notification.message,
                        "click_action": notification.url,
                    },
                    "priority": "high" if notification.priority >= 1 else "normal",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            logger.info(f"Firebase notification sent: {notification.title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send Firebase notification: {e}")
            return False


async def send_notification(notification: NotificationPayload):
    """Send notification via all configured channels"""
    results = await asyncio.gather(
        send_pushover_notification(notification),
        send_firebase_notification(notification),
        return_exceptions=True,
    )
    return any(r is True for r in results)


# ============================================================================
# EMERGENCY ESCALATION
# ============================================================================

async def generate_emergency_briefing(plan_id: str) -> EmergencyBriefing:
    """Generate an emergency briefing when approval times out"""
    
    # Fetch plan details from Redis
    plan_data = await redis_client.hgetall(f"plan:{plan_id}")
    
    if not plan_data:
        raise ValueError(f"Plan {plan_id} not found")
    
    plan = ActionPlan(**json.loads(plan_data.get("data", "{}")))
    created_at = datetime.fromisoformat(plan_data.get("created_at", datetime.utcnow().isoformat()))
    time_elapsed = (datetime.utcnow() - created_at).total_seconds() / 3600
    
    # Calculate impact if delayed
    impact_multiplier = 1 + (time_elapsed / 24)  # Impact increases by ~4% per hour
    delayed_lives_at_risk = int(plan.lives_impacted * impact_multiplier * 0.1)
    
    briefing = EmergencyBriefing(
        plan_id=plan_id,
        urgency_level="CRITICAL" if plan.success_probability > 0.8 else "HIGH",
        summary=f"UNREVIEWED ACTION PLAN: {plan.summary}",
        time_elapsed_hours=round(time_elapsed, 2),
        impact_if_delayed=f"Estimated {delayed_lives_at_risk:,} additional people affected by each hour of delay. "
                          f"Cost efficiency decreasing by ${int(plan.estimated_cost * 0.02):,}/hour.",
        recommended_action=f"Immediate review required. AI confidence: {plan.success_probability*100:.1f}%. "
                          f"Auto-approval threshold not met.",
        backup_contacts=[BACKUP_CONTACTS_EMAIL],
    )
    
    return briefing


async def escalate_to_backup_contacts(plan_id: str, briefing: EmergencyBriefing):
    """Send emergency notification to backup contacts"""
    
    # Update plan status
    await redis_client.hset(f"plan:{plan_id}", "status", ApprovalStatus.ESCALATED.value)
    
    # Send high-priority notification
    notification = NotificationPayload(
        title=f"URGENT: PRO Action Plan Requires Immediate Review",
        message=f"{briefing.summary}\n\n"
                f"Time Elapsed: {briefing.time_elapsed_hours:.1f} hours\n"
                f"Impact: {briefing.impact_if_delayed}\n\n"
                f"Action: {briefing.recommended_action}",
        priority=2,  # Emergency priority
        url=f"https://pro.platform.com/authorize/{plan_id}",
        sound="siren",
    )
    
    await send_notification(notification)
    
    # Broadcast to all connected WebSocket clients
    await manager.broadcast({
        "type": "EMERGENCY_ESCALATION",
        "plan_id": plan_id,
        "briefing": briefing.dict(),
        "timestamp": datetime.utcnow().isoformat(),
    })
    
    logger.warning(f"Emergency escalation triggered for plan {plan_id}")
    
    return briefing


# ============================================================================
# BACKGROUND TASKS
# ============================================================================

async def monitor_pending_approvals():
    """Background task to monitor pending approvals and trigger escalation"""
    while True:
        try:
            # Get all pending plans from Redis
            pattern = "plan:*"
            cursor = 0
            
            while True:
                cursor, keys = await redis_client.scan(cursor, match=pattern, count=100)
                
                for key in keys:
                    plan_data = await redis_client.hgetall(key)
                    
                    if plan_data.get("status") == ApprovalStatus.PENDING_APPROVAL.value:
                        created_at = datetime.fromisoformat(
                            plan_data.get("created_at", datetime.utcnow().isoformat())
                        )
                        elapsed_hours = (datetime.utcnow() - created_at).total_seconds() / 3600
                        
                        # Check if timeout threshold reached
                        if elapsed_hours >= AUTHORIZATION_TIMEOUT_HOURS:
                            plan_id = key.replace("plan:", "")
                            logger.warning(f"Plan {plan_id} exceeded {AUTHORIZATION_TIMEOUT_HOURS}h timeout")
                            
                            # Generate and send emergency briefing
                            briefing = await generate_emergency_briefing(plan_id)
                            await escalate_to_backup_contacts(plan_id, briefing)
                            
                            # Store briefing in database
                            async with db_pool.acquire() as conn:
                                await conn.execute("""
                                    INSERT INTO emergency_briefings 
                                    (plan_id, urgency_level, summary, time_elapsed_hours, 
                                     impact_if_delayed, recommended_action, created_at)
                                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                                """, plan_id, briefing.urgency_level, briefing.summary,
                                    briefing.time_elapsed_hours, briefing.impact_if_delayed,
                                    briefing.recommended_action)
                
                if cursor == 0:
                    break
            
            # Check every 5 minutes
            await asyncio.sleep(300)
            
        except Exception as e:
            logger.error(f"Error in approval monitor: {e}")
            await asyncio.sleep(60)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "hitl-middleware",
        "websocket_connections": sum(len(c) for c in manager.active_connections.values()),
    }


@app.post("/api/v1/plans/submit")
async def submit_action_plan(plan: ActionPlan, background_tasks: BackgroundTasks):
    """
    Submit an action plan from the Strategist Agent
    Sets status to PENDING_APPROVAL and notifies authorized users
    """
    # Set expiration time
    plan.expires_at = datetime.utcnow() + timedelta(hours=AUTHORIZATION_TIMEOUT_HOURS)
    plan.status = ApprovalStatus.PENDING_APPROVAL
    
    # Store in Redis for fast access
    await redis_client.hset(f"plan:{plan.plan_id}", mapping={
        "data": plan.json(),
        "status": plan.status.value,
        "created_at": plan.created_at.isoformat(),
        "expires_at": plan.expires_at.isoformat(),
    })
    await redis_client.expire(f"plan:{plan.plan_id}", 86400)  # 24 hour TTL
    
    # Store in database for persistence
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO action_plans 
            (plan_id, transaction_uuid, summary, resource_type, quantity,
             source_location, destination_location, ai_reasoning, 
             success_probability, estimated_cost, lives_impacted, carbon_offset,
             route_data, risk_assessment, status, created_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        """, plan.plan_id, plan.transaction_uuid, plan.summary, plan.resource_type,
            plan.quantity, plan.source_location, plan.destination_location,
            plan.ai_reasoning, plan.success_probability, plan.estimated_cost,
            plan.lives_impacted, plan.carbon_offset, json.dumps(plan.route_data),
            plan.risk_assessment, plan.status.value, plan.created_at, plan.expires_at)
    
    # Send notification to authorized user
    notification = NotificationPayload(
        title="PRO: New Action Plan Requires Approval",
        message=f"{plan.summary}\n\n"
                f"Resource: {plan.quantity:,.0f} tons of {plan.resource_type}\n"
                f"Route: {plan.source_location} → {plan.destination_location}\n"
                f"Lives Impacted: {plan.lives_impacted:,}\n"
                f"Success Probability: {plan.success_probability*100:.1f}%\n\n"
                f"Expires in {AUTHORIZATION_TIMEOUT_HOURS} hours.",
        priority=1,
        url=f"https://pro.platform.com/authorize/{plan.plan_id}",
    )
    
    background_tasks.add_task(send_notification, notification)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "NEW_PLAN",
        "plan": plan.dict(),
        "timestamp": datetime.utcnow().isoformat(),
    })
    
    logger.info(f"Action plan {plan.plan_id} submitted for approval")
    
    return {
        "status": "submitted",
        "plan_id": plan.plan_id,
        "expires_at": plan.expires_at.isoformat(),
        "authorization_url": f"/api/v1/authorize/{plan.plan_id}",
    }


@app.get("/api/v1/plans/pending")
async def get_pending_plans():
    """Get all pending action plans"""
    plans = []
    
    cursor = 0
    while True:
        cursor, keys = await redis_client.scan(cursor, match="plan:*", count=100)
        
        for key in keys:
            plan_data = await redis_client.hgetall(key)
            if plan_data.get("status") == ApprovalStatus.PENDING_APPROVAL.value:
                plans.append({
                    "plan_id": key.replace("plan:", ""),
                    **json.loads(plan_data.get("data", "{}")),
                    "status": plan_data.get("status"),
                    "created_at": plan_data.get("created_at"),
                    "expires_at": plan_data.get("expires_at"),
                })
        
        if cursor == 0:
            break
    
    # Sort by creation time (oldest first - most urgent)
    plans.sort(key=lambda p: p.get("created_at", ""))
    
    return {"plans": plans, "count": len(plans)}


@app.get("/api/v1/plans/{plan_id}")
async def get_plan(plan_id: str):
    """Get a specific action plan"""
    plan_data = await redis_client.hgetall(f"plan:{plan_id}")
    
    if not plan_data:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {
        "plan_id": plan_id,
        **json.loads(plan_data.get("data", "{}")),
        "status": plan_data.get("status"),
        "created_at": plan_data.get("created_at"),
        "expires_at": plan_data.get("expires_at"),
    }


@app.post("/api/v1/authorize")
async def authorize_plan(payload: AuthorizationPayload, background_tasks: BackgroundTasks):
    """
    Protected endpoint to authorize an action plan
    Requires valid digital signature to change status to EXECUTING
    """
    # Verify digital signature
    if not verify_signature(payload):
        logger.warning(f"Invalid signature for plan {payload.plan_id}")
        raise HTTPException(
            status_code=401,
            detail="Invalid digital signature. Authorization denied."
        )
    
    # Verify timestamp is recent (within 5 minutes)
    try:
        payload_time = datetime.fromisoformat(payload.timestamp)
        if abs((datetime.utcnow() - payload_time).total_seconds()) > 300:
            raise HTTPException(
                status_code=401,
                detail="Timestamp expired. Please generate a new authorization request."
            )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    # Get plan from Redis
    plan_data = await redis_client.hgetall(f"plan:{payload.plan_id}")
    
    if not plan_data:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    current_status = plan_data.get("status")
    if current_status != ApprovalStatus.PENDING_APPROVAL.value:
        raise HTTPException(
            status_code=400,
            detail=f"Plan cannot be authorized. Current status: {current_status}"
        )
    
    # Update status based on action
    if payload.action == "approve":
        new_status = ApprovalStatus.EXECUTING
    elif payload.action == "reject":
        new_status = ApprovalStatus.REJECTED
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    # Update Redis
    await redis_client.hset(f"plan:{payload.plan_id}", mapping={
        "status": new_status.value,
        "authorized_at": datetime.utcnow().isoformat(),
        "authorization_reason": payload.reason or "",
    })
    
    # Update database
    async with db_pool.acquire() as conn:
        await conn.execute("""
            UPDATE action_plans 
            SET status = $1, authorized_at = NOW(), authorization_reason = $2
            WHERE plan_id = $3
        """, new_status.value, payload.reason, payload.plan_id)
        
        # Also update the related transaction
        plan = json.loads(plan_data.get("data", "{}"))
        if plan.get("transaction_uuid"):
            tx_status = "approved" if payload.action == "approve" else "rejected"
            await conn.execute("""
                UPDATE ai_transactions 
                SET status = $1, authorized_at = NOW(), authorized_by = 'HITL'
                WHERE transaction_uuid = $2
            """, tx_status, plan["transaction_uuid"])
    
    # Broadcast status change
    await manager.broadcast({
        "type": "PLAN_STATUS_CHANGED",
        "plan_id": payload.plan_id,
        "old_status": current_status,
        "new_status": new_status.value,
        "action": payload.action,
        "timestamp": datetime.utcnow().isoformat(),
    })
    
    # If approved, trigger execution notification
    if payload.action == "approve":
        background_tasks.add_task(
            send_notification,
            NotificationPayload(
                title="PRO: Action Plan Authorized - Execution Started",
                message=f"Plan {payload.plan_id} has been authorized and execution has begun.",
                priority=0,
            )
        )
    
    logger.info(f"Plan {payload.plan_id} {payload.action}d via digital signature")
    
    return {
        "status": "success",
        "plan_id": payload.plan_id,
        "action": payload.action,
        "new_status": new_status.value,
        "authorized_at": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/signature/generate")
async def generate_auth_signature(
    plan_id: str,
    action: str,
    x_auth_token: str = Header(..., alias="X-Auth-Token"),
):
    """
    Generate a digital signature for authorization
    Requires valid auth token (simulating mobile app authentication)
    """
    # In production, validate the auth token against your auth system
    if not x_auth_token or len(x_auth_token) < 10:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    timestamp = datetime.utcnow().isoformat()
    signature = generate_signature(plan_id, action, timestamp)
    
    return {
        "plan_id": plan_id,
        "action": action,
        "timestamp": timestamp,
        "signature": signature,
        "expires_in_seconds": 300,
    }


# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@app.websocket("/ws/plans")
async def websocket_plans(websocket: WebSocket):
    """WebSocket endpoint for real-time plan updates"""
    await manager.connect(websocket, "plans")
    
    try:
        # Send current pending plans on connect
        pending = await get_pending_plans()
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "plans": pending["plans"],
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                if message.get("type") == "PING":
                    await websocket.send_json({"type": "PONG"})
                
                elif message.get("type") == "SUBSCRIBE":
                    # Subscribe to specific plan updates
                    plan_id = message.get("plan_id")
                    if plan_id:
                        await manager.connect(websocket, f"plan:{plan_id}")
                        await websocket.send_json({
                            "type": "SUBSCRIBED",
                            "plan_id": plan_id,
                        })
                
            except json.JSONDecodeError:
                pass
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, "plans")
        logger.info("WebSocket client disconnected from plans channel")


@app.websocket("/ws/user/{user_id}")
async def websocket_user(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for user-specific notifications"""
    await manager.connect_user(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                if message.get("type") == "PING":
                    await websocket.send_json({"type": "PONG"})
                
            except json.JSONDecodeError:
                pass
    
    except WebSocketDisconnect:
        manager.disconnect_user(user_id)
        logger.info(f"User {user_id} disconnected")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
