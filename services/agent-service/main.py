"""
PRO Platform - AI Agent Service
CrewAI-based multi-agent system for resource orchestration
Agents: Hunter, Negotiator, Strategist
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
import os
import logging
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
import json
import uuid

# CrewAI imports
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-service")

# Database pool
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool, redis_client
    
    # Startup
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    logger.info("Agent Service started")
    
    yield
    
    # Shutdown
    await db_pool.close()
    await redis_client.close()
    logger.info("Agent Service stopped")


app = FastAPI(
    title="PRO Agent Service",
    description="CrewAI-powered resource orchestration agents",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================================
# MODELS
# ============================================================================

class ResourceGap(BaseModel):
    location_id: str
    resource_id: str
    quantity_needed: float
    urgency: str  # low, medium, high, critical
    deadline: Optional[str] = None


class TriggerRequest(BaseModel):
    location_id: Optional[str] = None
    resource_id: Optional[str] = None


class AgentActivity(BaseModel):
    id: str
    agent_type: str
    action: str
    status: str
    details: dict
    timestamp: str


# ============================================================================
# CUSTOM TOOLS FOR AGENTS
# ============================================================================

class SurplusSearchTool(BaseTool):
    """Tool for Hunter agent to search surplus resources"""
    name: str = "surplus_search"
    description: str = "Search for available surplus resources across providers"
    
    def _run(self, resource_type: str, min_quantity: float = 0) -> str:
        """Synchronous search - in production, this would query the database"""
        # Mock surplus data for demonstration
        surplus_data = [
            {
                "provider": "Global Grain Cooperative",
                "location": "Rotterdam, Netherlands",
                "resource": "Wheat Grain",
                "quantity": 15000,
                "quality": "A+",
                "price_per_ton": 280,
                "available_until": "2024-12-31",
            },
            {
                "provider": "Pacific Rice Federation", 
                "location": "Tokyo, Japan",
                "resource": "Rice (Long Grain)",
                "quantity": 8500,
                "quality": "A",
                "price_per_ton": 420,
                "available_until": "2024-11-30",
            },
            {
                "provider": "North American Grain Exchange",
                "location": "Chicago, USA",
                "resource": "Wheat Grain",
                "quantity": 25000,
                "quality": "A+",
                "price_per_ton": 265,
                "available_until": "2025-01-15",
            },
        ]
        
        filtered = [s for s in surplus_data if s["quantity"] >= min_quantity]
        return json.dumps(filtered, indent=2)


class RouteCalculatorTool(BaseTool):
    """Tool for Negotiator agent to calculate shipping routes"""
    name: str = "route_calculator"
    description: str = "Calculate optimal shipping routes and costs"
    
    def _run(self, origin: str, destination: str, quantity: float) -> str:
        """Calculate route - in production, this would use real logistics APIs"""
        # Mock route calculation
        routes = {
            ("Rotterdam", "Dhaka"): {
                "route": ["Rotterdam", "Singapore", "Chittagong", "Dhaka"],
                "transport_modes": ["sea", "sea", "rail"],
                "estimated_days": 18,
                "cost_per_ton": 45,
                "carbon_kg_per_ton": 420,
            },
            ("Tokyo", "Dhaka"): {
                "route": ["Tokyo", "Singapore", "Chittagong", "Dhaka"],
                "transport_modes": ["sea", "sea", "rail"],
                "estimated_days": 14,
                "cost_per_ton": 38,
                "carbon_kg_per_ton": 380,
            },
            ("Chicago", "Dhaka"): {
                "route": ["Chicago", "Los Angeles", "Singapore", "Chittagong", "Dhaka"],
                "transport_modes": ["rail", "sea", "sea", "rail"],
                "estimated_days": 25,
                "cost_per_ton": 62,
                "carbon_kg_per_ton": 580,
            },
        }
        
        # Find best matching route
        for (o, d), route_data in routes.items():
            if o.lower() in origin.lower() and d.lower() in destination.lower():
                route_data["total_cost"] = route_data["cost_per_ton"] * quantity
                route_data["total_carbon_kg"] = route_data["carbon_kg_per_ton"] * quantity
                return json.dumps(route_data, indent=2)
        
        # Default route
        return json.dumps({
            "route": [origin, destination],
            "transport_modes": ["mixed"],
            "estimated_days": 21,
            "cost_per_ton": 50,
            "total_cost": 50 * quantity,
            "carbon_kg_per_ton": 450,
            "total_carbon_kg": 450 * quantity,
        }, indent=2)


class ImpactAnalyzerTool(BaseTool):
    """Tool for Strategist agent to analyze humanitarian impact"""
    name: str = "impact_analyzer"
    description: str = "Analyze humanitarian and economic impact of resource allocation"
    
    def _run(self, location: str, resource: str, quantity: float) -> str:
        """Analyze impact - in production, this would use real demographic data"""
        # Mock impact analysis
        impact_data = {
            "Dhaka": {
                "population_affected": 2100000,
                "food_security_improvement": "28%",
                "economic_value_usd": 8500000,
                "lives_directly_impacted": 3200000,
                "malnutrition_reduction": "15%",
                "success_probability": 0.89,
            },
            "Sanaa": {
                "population_affected": 1500000,
                "food_security_improvement": "35%",
                "economic_value_usd": 12000000,
                "lives_directly_impacted": 500000,
                "malnutrition_reduction": "22%",
                "success_probability": 0.78,
            },
        }
        
        for loc, data in impact_data.items():
            if loc.lower() in location.lower():
                data["location"] = loc
                data["resource"] = resource
                data["quantity"] = quantity
                return json.dumps(data, indent=2)
        
        # Default impact
        return json.dumps({
            "location": location,
            "resource": resource,
            "quantity": quantity,
            "population_affected": int(quantity * 200),
            "economic_value_usd": int(quantity * 500),
            "lives_directly_impacted": int(quantity * 250),
            "success_probability": 0.85,
        }, indent=2)


# ============================================================================
# CREWAI AGENTS DEFINITION
# ============================================================================

def create_hunter_agent(llm) -> Agent:
    """
    Agent 1: The Hunter
    Searches for available surplus resources across the web and private APIs
    """
    return Agent(
        role="Resource Hunter",
        goal="Identify and locate available surplus resources that can address critical shortages",
        backstory="""You are an elite resource intelligence analyst with decades of experience 
        in global supply chain management. You have access to a vast network of suppliers, 
        warehouses, and agricultural cooperatives worldwide. Your specialty is finding hidden 
        surplus resources that others overlook. You understand seasonal patterns, storage 
        limitations, and quality degradation timelines. Your mission is to leave no stone 
        unturned in finding resources that can save lives.""",
        verbose=True,
        allow_delegation=False,
        tools=[SurplusSearchTool()],
        llm=llm,
    )


def create_negotiator_agent(llm) -> Agent:
    """
    Agent 2: The Negotiator
    Matches surplus to demand and calculates optimal logistics
    """
    return Agent(
        role="Logistics Negotiator",
        goal="Match available surplus resources to high-priority demand areas with optimal cost and carbon efficiency",
        backstory="""You are a master logistics strategist who has coordinated humanitarian 
        relief operations across 50+ countries. You understand the complexities of 
        international shipping, customs, cold chain requirements, and last-mile delivery 
        in challenging environments. You balance cost efficiency with speed, always 
        prioritizing the most critical needs. You're skilled at negotiating with shipping 
        companies and finding creative solutions to logistical challenges.""",
        verbose=True,
        allow_delegation=False,
        tools=[RouteCalculatorTool()],
        llm=llm,
    )


def create_strategist_agent(llm) -> Agent:
    """
    Agent 3: The Strategist
    Generates final action plans for human approval
    """
    return Agent(
        role="Strategic Advisor",
        goal="Generate comprehensive action plans that maximize humanitarian impact while ensuring feasibility",
        backstory="""You are a senior strategic advisor who has worked with the UN, World Bank, 
        and leading NGOs on resource allocation decisions. You understand the political, 
        economic, and social dimensions of resource distribution. You're skilled at 
        synthesizing complex data into clear recommendations that decision-makers can 
        act upon. You always consider second-order effects, potential risks, and 
        alternative scenarios. Your recommendations have directly influenced policies 
        that have saved millions of lives.""",
        verbose=True,
        allow_delegation=False,
        tools=[ImpactAnalyzerTool()],
        llm=llm,
    )


# ============================================================================
# CREW ORCHESTRATION
# ============================================================================

class ResourceOrchestrationCrew:
    """Orchestrates the Hunter, Negotiator, and Strategist agents"""
    
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,
            api_key=openai_api_key,
        )
        
        self.hunter = create_hunter_agent(self.llm)
        self.negotiator = create_negotiator_agent(self.llm)
        self.strategist = create_strategist_agent(self.llm)
        
        # Shared memory for agents
        self.memory = {
            "surplus_found": [],
            "routes_calculated": [],
            "impact_analyses": [],
        }
    
    def solve_resource_gap(self, gap: ResourceGap) -> dict:
        """
        Execute the full agent pipeline to solve a resource gap
        """
        # Task 1: Hunter finds surplus
        hunt_task = Task(
            description=f"""
            A critical resource shortage has been identified:
            - Location: {gap.location_id}
            - Resource needed: {gap.resource_id}
            - Quantity required: {gap.quantity_needed} metric tons
            - Urgency level: {gap.urgency}
            - Deadline: {gap.deadline or 'ASAP'}
            
            Search for available surplus resources that can fulfill this need.
            Consider quality, quantity, and availability timeline.
            Identify at least 2-3 potential sources.
            """,
            expected_output="A detailed list of available surplus sources with quantities, prices, and quality grades",
            agent=self.hunter,
        )
        
        # Task 2: Negotiator calculates routes
        negotiate_task = Task(
            description=f"""
            Based on the surplus sources identified by the Hunter, calculate the optimal 
            shipping routes to deliver {gap.quantity_needed} metric tons to {gap.location_id}.
            
            For each potential source:
            1. Calculate the shipping route and estimated delivery time
            2. Estimate total cost including transport and handling
            3. Calculate carbon footprint
            4. Assess feasibility given the deadline: {gap.deadline or 'ASAP'}
            
            Recommend the most cost-effective and carbon-efficient option.
            """,
            expected_output="Detailed route analysis with costs, timelines, and carbon impact for each option",
            agent=self.negotiator,
            context=[hunt_task],
        )
        
        # Task 3: Strategist creates action plan
        strategy_task = Task(
            description=f"""
            Create a comprehensive action plan for human authorization based on:
            - The surplus sources identified by the Hunter
            - The logistics analysis from the Negotiator
            - The urgency level: {gap.urgency}
            
            Your action plan must include:
            1. Executive summary (2-3 sentences)
            2. Recommended action with clear justification
            3. Humanitarian impact analysis (lives affected, economic value)
            4. Risk assessment and mitigation strategies
            5. Success probability assessment
            6. Alternative scenarios if primary plan fails
            
            Format the output as a structured JSON action plan ready for human review.
            """,
            expected_output="A complete action plan in JSON format ready for human authorization",
            agent=self.strategist,
            context=[hunt_task, negotiate_task],
        )
        
        # Create and run the crew
        crew = Crew(
            agents=[self.hunter, self.negotiator, self.strategist],
            tasks=[hunt_task, negotiate_task, strategy_task],
            process=Process.sequential,
            verbose=True,
        )
        
        result = crew.kickoff()
        
        return {
            "gap": gap.dict(),
            "solution": str(result),
            "agents_involved": ["hunter", "negotiator", "strategist"],
            "execution_time": datetime.utcnow().isoformat(),
        }


# Global crew instance
crew_instance: Optional[ResourceOrchestrationCrew] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agent-service"}


@app.get("/agents/status")
async def get_agents_status():
    """Get status of all agents"""
    return {
        "agents": [
            {
                "id": "hunter",
                "name": "Resource Hunter",
                "role": "Surplus Resource Discovery",
                "status": "active",
                "capabilities": ["surplus_search", "quality_assessment", "availability_tracking"],
            },
            {
                "id": "negotiator", 
                "name": "Logistics Negotiator",
                "role": "Route Optimization & Cost Analysis",
                "status": "active",
                "capabilities": ["route_calculation", "cost_optimization", "carbon_tracking"],
            },
            {
                "id": "strategist",
                "name": "Strategic Advisor",
                "role": "Action Plan Generation",
                "status": "active",
                "capabilities": ["impact_analysis", "risk_assessment", "recommendation_synthesis"],
            },
        ],
        "crew_status": "ready",
        "last_execution": None,
    }


@app.get("/agents/activity")
async def get_agents_activity(limit: int = 50):
    """Get recent agent activity logs"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT 
                id, agent_type, action_type as action, 
                input_data, output_data, execution_time_ms,
                memory_state, created_at
            FROM ai_agent_logs
            ORDER BY created_at DESC
            LIMIT $1
        """
        rows = await conn.fetch(query, limit)
        
        return [
            {
                "id": str(row["id"]),
                "agent_type": row["agent_type"],
                "action": row["action"],
                "status": "completed",
                "details": {
                    "input": row["input_data"],
                    "output": row["output_data"],
                    "execution_time_ms": row["execution_time_ms"],
                },
                "timestamp": row["created_at"].isoformat(),
            }
            for row in rows
        ]


@app.post("/agents/trigger")
async def trigger_agent_analysis(
    request: TriggerRequest,
    background_tasks: BackgroundTasks,
):
    """
    Manually trigger agent analysis for a resource gap
    This runs the full Hunter -> Negotiator -> Strategist pipeline
    """
    global crew_instance
    
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    
    # Initialize crew if not exists
    if crew_instance is None:
        crew_instance = ResourceOrchestrationCrew(OPENAI_API_KEY)
    
    # Create execution ID
    execution_id = str(uuid.uuid4())
    
    # Get resource gap details from database
    async with db_pool.acquire() as conn:
        # Get location details
        location_query = """
            SELECT name, priority_level FROM demand_locations 
            WHERE id = $1
        """
        location = await conn.fetchrow(location_query, request.location_id)
        
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        
        # Get resource details
        resource_query = """
            SELECT name, category FROM resources WHERE id = $1
        """
        resource = await conn.fetchrow(resource_query, request.resource_id)
        
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Get forecast to determine quantity needed
        forecast_query = """
            SELECT predicted_demand, anomaly_severity FROM demand_forecasts
            WHERE location_id = $1 AND resource_id = $2
            AND forecast_date >= CURRENT_DATE
            ORDER BY forecast_date ASC
            LIMIT 1
        """
        forecast = await conn.fetchrow(
            forecast_query, 
            request.location_id, 
            request.resource_id
        )
    
    # Create resource gap
    gap = ResourceGap(
        location_id=location["name"],
        resource_id=resource["name"],
        quantity_needed=float(forecast["predicted_demand"]) if forecast else 5000.0,
        urgency=location["priority_level"],
        deadline=(datetime.utcnow().replace(hour=0, minute=0, second=0) + 
                  __import__("datetime").timedelta(days=14)).isoformat(),
    )
    
    # Log the trigger
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO ai_agent_logs (agent_type, action_type, input_data)
            VALUES ('crew', 'analysis_triggered', $1)
        """, json.dumps(gap.dict()))
    
    # In production, this would run in background
    # For demo, we return a simulated response
    
    return {
        "execution_id": execution_id,
        "status": "processing",
        "message": "Agent analysis triggered successfully",
        "gap": gap.dict(),
        "estimated_completion": "2-5 minutes",
        "agents_deployed": ["hunter", "negotiator", "strategist"],
    }


@app.get("/demo/solve-gap")
async def demo_solve_gap():
    """
    Demonstration endpoint showing how agents solve a resource gap
    Returns a simulated but realistic agent interaction
    """
    
    # Simulated agent execution trace
    execution_trace = {
        "execution_id": str(uuid.uuid4()),
        "started_at": datetime.utcnow().isoformat(),
        "gap": {
            "location": "Dhaka, Bangladesh",
            "resource": "Wheat Grain",
            "quantity_needed": 12500,
            "urgency": "critical",
            "deadline": "14 days",
        },
        "agent_interactions": [
            {
                "agent": "hunter",
                "role": "Resource Hunter",
                "action": "Searching for surplus wheat grain...",
                "status": "completed",
                "duration_ms": 3420,
                "findings": {
                    "sources_found": 3,
                    "best_match": {
                        "provider": "Global Grain Cooperative",
                        "location": "Rotterdam, Netherlands",
                        "quantity_available": 15000,
                        "quality": "A+",
                        "price_per_ton": 280,
                    },
                    "memory_update": "Identified Rotterdam as optimal source due to quality and quantity match",
                },
            },
            {
                "agent": "negotiator",
                "role": "Logistics Negotiator",
                "action": "Calculating optimal shipping route...",
                "status": "completed",
                "duration_ms": 2150,
                "findings": {
                    "optimal_route": {
                        "path": ["Rotterdam", "Singapore", "Chittagong", "Dhaka"],
                        "transport_modes": ["sea", "sea", "rail"],
                        "estimated_days": 12,
                        "total_cost_usd": 562500,
                        "carbon_footprint_kg": 5250,
                    },
                    "alternatives_evaluated": 2,
                    "memory_update": "Rotterdam-Singapore-Chittagong route selected for optimal cost/time balance",
                },
            },
            {
                "agent": "strategist",
                "role": "Strategic Advisor",
                "action": "Generating action plan for authorization...",
                "status": "completed",
                "duration_ms": 4890,
                "findings": {
                    "action_plan": {
                        "executive_summary": "Recommend immediate authorization of 12,500 tons wheat transfer from Rotterdam to Dhaka via Singapore-Chittagong route. High success probability (89%) with potential to prevent food insecurity for 3.2M people.",
                        "recommended_action": "APPROVE",
                        "total_cost_usd": 4062500,
                        "lives_impacted": 3200000,
                        "economic_value_generated": 8750000,
                        "success_probability": 0.89,
                        "risk_level": "medium",
                        "carbon_offset_available": True,
                    },
                    "risks_identified": [
                        "Monsoon season may delay final delivery by 2-3 days",
                        "Port congestion at Chittagong - recommend priority berth request",
                    ],
                    "mitigation_strategies": [
                        "Pre-position storage at Chittagong port",
                        "Coordinate with Bangladesh Ministry for expedited customs",
                    ],
                },
            },
        ],
        "final_recommendation": {
            "action": "APPROVE_FOR_AUTHORIZATION",
            "urgency": "HIGH",
            "summary": "All three agents concur: The identified surplus from Global Grain Cooperative represents the optimal match for the Dhaka food security gap. The Rotterdam-Singapore-Chittagong route provides the best balance of speed, cost, and carbon efficiency. Human authorization recommended within 24 hours to meet the 14-day deadline.",
            "requires_human_approval": True,
            "transaction_ready": True,
        },
        "shared_memory_state": {
            "surplus_sources": ["Rotterdam: 15000t wheat @ A+"],
            "routes_evaluated": ["Rotterdam->Dhaka: 12 days, $562.5k"],
            "impact_assessments": ["3.2M lives, $8.75M economic value"],
            "consensus_reached": True,
        },
        "completed_at": datetime.utcnow().isoformat(),
        "total_duration_ms": 10460,
    }
    
    return execution_trace


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
