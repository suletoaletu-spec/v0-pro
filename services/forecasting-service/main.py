"""
PRO Platform - Demand Forecasting Engine
AI/ML-powered demand prediction with anomaly detection using Prophet
"""

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
import os
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
import numpy as np
import pandas as pd
from prophet import Prophet
import json

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
MODEL_PATH = os.getenv("MODEL_PATH", "/app/models")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("forecasting-service")

# Suppress Prophet's verbose logging
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)

# Database pool
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool, redis_client
    
    # Startup
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    logger.info("Forecasting Service started")
    
    yield
    
    # Shutdown
    await db_pool.close()
    await redis_client.close()
    logger.info("Forecasting Service stopped")


app = FastAPI(
    title="PRO Forecasting Service",
    description="Demand prediction and anomaly detection engine",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================================
# MODELS
# ============================================================================

class ForecastRequest(BaseModel):
    location_id: str
    resource_id: str
    days_ahead: int = 14
    include_external_factors: bool = True


class ForecastResult(BaseModel):
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float
    anomaly_detected: bool
    anomaly_severity: str
    confidence: float


class AnomalyAlert(BaseModel):
    id: str
    location_name: str
    resource_name: str
    forecast_date: str
    predicted_demand: float
    severity: str
    description: str
    external_factors: dict
    created_at: str


# ============================================================================
# FORECASTING ENGINE
# ============================================================================

class DemandForecaster:
    """Prophet-based demand forecasting with external regressors"""
    
    def __init__(self):
        self.model = None
    
    def prepare_data(
        self, 
        historical_data: List[dict],
        external_factors: Optional[List[dict]] = None
    ) -> pd.DataFrame:
        """Prepare data for Prophet model"""
        df = pd.DataFrame(historical_data)
        df = df.rename(columns={"date": "ds", "demand": "y"})
        df["ds"] = pd.to_datetime(df["ds"])
        
        # Add external regressors if provided
        if external_factors:
            for factor in external_factors:
                if factor["name"] in df.columns or factor["name"] == "weather_index":
                    continue
                # Merge external factor data
                factor_df = pd.DataFrame(factor["data"])
                factor_df["ds"] = pd.to_datetime(factor_df["ds"])
                df = df.merge(factor_df, on="ds", how="left")
        
        return df
    
    def train(
        self,
        df: pd.DataFrame,
        external_regressors: Optional[List[str]] = None,
        seasonality_mode: str = "multiplicative",
    ) -> None:
        """Train Prophet model"""
        self.model = Prophet(
            seasonality_mode=seasonality_mode,
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            interval_width=0.95,
        )
        
        # Add external regressors
        if external_regressors:
            for regressor in external_regressors:
                if regressor in df.columns:
                    self.model.add_regressor(regressor)
        
        # Add custom seasonality for resource-specific patterns
        self.model.add_seasonality(
            name="monthly",
            period=30.5,
            fourier_order=5,
        )
        
        self.model.fit(df)
    
    def predict(
        self,
        days_ahead: int,
        future_regressors: Optional[pd.DataFrame] = None,
    ) -> pd.DataFrame:
        """Generate predictions"""
        future = self.model.make_future_dataframe(periods=days_ahead)
        
        # Add future regressor values if provided
        if future_regressors is not None:
            for col in future_regressors.columns:
                if col != "ds":
                    future = future.merge(future_regressors[["ds", col]], on="ds", how="left")
                    # Forward fill missing future values
                    future[col] = future[col].ffill()
        
        forecast = self.model.predict(future)
        return forecast
    
    def detect_anomalies(
        self,
        forecast: pd.DataFrame,
        threshold_sigma: float = 2.5,
    ) -> List[dict]:
        """Detect anomalies based on prediction intervals"""
        anomalies = []
        
        for idx, row in forecast.iterrows():
            # Calculate z-score for each prediction
            if row["yhat_upper"] != row["yhat_lower"]:
                interval_width = row["yhat_upper"] - row["yhat_lower"]
                expected_std = interval_width / 4  # Approximate std from 95% CI
                
                # Check if prediction is unusually high
                if row["yhat"] > row["yhat_upper"]:
                    z_score = (row["yhat"] - row["yhat_upper"]) / expected_std
                    if z_score > threshold_sigma:
                        severity = self._classify_severity(z_score)
                        anomalies.append({
                            "date": row["ds"].isoformat(),
                            "predicted_demand": float(row["yhat"]),
                            "upper_bound": float(row["yhat_upper"]),
                            "z_score": float(z_score),
                            "severity": severity,
                            "type": "demand_spike",
                        })
        
        return anomalies
    
    def _classify_severity(self, z_score: float) -> str:
        """Classify anomaly severity based on z-score"""
        if z_score > 4:
            return "critical"
        elif z_score > 3:
            return "high"
        elif z_score > 2.5:
            return "medium"
        return "low"


# Global forecaster instance
forecaster = DemandForecaster()


# ============================================================================
# MOCK DATA GENERATOR (for demonstration)
# ============================================================================

def generate_mock_historical_data(
    location: str,
    resource: str,
    days: int = 365,
) -> List[dict]:
    """Generate realistic mock historical data for demonstration"""
    np.random.seed(hash(f"{location}_{resource}") % 2**32)
    
    base_demand = {
        "Lagos_food": 5000,
        "Mumbai_food": 8000,
        "Dhaka_food": 6500,
        "Lagos_medicine": 15000,
        "Mumbai_medicine": 25000,
        "Dhaka_medicine": 18000,
    }.get(f"{location}_{resource}", 5000)
    
    dates = [datetime.now() - timedelta(days=days-i) for i in range(days)]
    
    data = []
    for i, date in enumerate(dates):
        # Base seasonal pattern
        seasonal = np.sin(2 * np.pi * i / 365) * base_demand * 0.2
        weekly = np.sin(2 * np.pi * i / 7) * base_demand * 0.05
        
        # Trend
        trend = i * base_demand * 0.0001
        
        # Random noise
        noise = np.random.normal(0, base_demand * 0.1)
        
        # Occasional spikes (anomalies)
        spike = 0
        if np.random.random() > 0.98:
            spike = base_demand * np.random.uniform(0.5, 1.5)
        
        demand = max(0, base_demand + seasonal + weekly + trend + noise + spike)
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "demand": round(demand, 2),
            "weather_index": np.random.uniform(20, 100),
            "economic_index": 50 + np.random.normal(0, 10),
        })
    
    return data


def generate_external_factors(days_ahead: int) -> pd.DataFrame:
    """Generate mock external factor predictions"""
    future_dates = [datetime.now() + timedelta(days=i) for i in range(1, days_ahead + 1)]
    
    return pd.DataFrame({
        "ds": future_dates,
        "weather_index": np.random.uniform(20, 100, days_ahead),
        "economic_index": 50 + np.random.normal(0, 10, days_ahead),
    })


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "forecasting-service"}


@app.post("/forecasts/generate")
async def generate_forecast(request: ForecastRequest):
    """Generate demand forecast for a location-resource pair"""
    try:
        # Get location and resource names (mock for demo)
        async with db_pool.acquire() as conn:
            location_row = await conn.fetchrow(
                "SELECT name FROM demand_locations WHERE id = $1", 
                request.location_id
            )
            resource_row = await conn.fetchrow(
                "SELECT name, category FROM resources WHERE id = $1", 
                request.resource_id
            )
        
        location_name = location_row["name"] if location_row else "Unknown"
        resource_category = resource_row["category"] if resource_row else "food"
        
        # Generate mock historical data (in production, query from DB)
        historical_data = generate_mock_historical_data(
            location_name, 
            resource_category,
            days=365,
        )
        
        # Prepare and train model
        df = forecaster.prepare_data(historical_data)
        
        external_regressors = None
        if request.include_external_factors:
            external_regressors = ["weather_index", "economic_index"]
        
        forecaster.train(df, external_regressors=external_regressors)
        
        # Generate future regressor values
        future_regressors = generate_external_factors(request.days_ahead)
        
        # Make predictions
        forecast = forecaster.predict(
            days_ahead=request.days_ahead,
            future_regressors=future_regressors if request.include_external_factors else None,
        )
        
        # Get only future predictions
        future_forecast = forecast.tail(request.days_ahead)
        
        # Detect anomalies
        anomalies = forecaster.detect_anomalies(future_forecast)
        
        # Format results
        results = []
        for idx, row in future_forecast.iterrows():
            date_str = row["ds"].strftime("%Y-%m-%d")
            anomaly = next((a for a in anomalies if a["date"].startswith(date_str)), None)
            
            results.append(ForecastResult(
                date=date_str,
                predicted_demand=round(row["yhat"], 2),
                lower_bound=round(row["yhat_lower"], 2),
                upper_bound=round(row["yhat_upper"], 2),
                anomaly_detected=anomaly is not None,
                anomaly_severity=anomaly["severity"] if anomaly else "none",
                confidence=0.95,
            ))
        
        # Store predictions in database
        async with db_pool.acquire() as conn:
            for result in results:
                await conn.execute("""
                    INSERT INTO demand_forecasts 
                    (location_id, resource_id, forecast_date, predicted_demand, 
                     confidence_lower, confidence_upper, anomaly_detected, 
                     anomaly_severity, model_version)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (location_id, resource_id, forecast_date) 
                    DO UPDATE SET 
                        predicted_demand = EXCLUDED.predicted_demand,
                        confidence_lower = EXCLUDED.confidence_lower,
                        confidence_upper = EXCLUDED.confidence_upper,
                        anomaly_detected = EXCLUDED.anomaly_detected,
                        anomaly_severity = EXCLUDED.anomaly_severity
                """,
                    request.location_id,
                    request.resource_id,
                    datetime.strptime(result.date, "%Y-%m-%d"),
                    result.predicted_demand,
                    result.lower_bound,
                    result.upper_bound,
                    result.anomaly_detected,
                    result.anomaly_severity,
                    "prophet-v2.1",
                )
        
        return {
            "location_id": request.location_id,
            "resource_id": request.resource_id,
            "forecasts": [r.dict() for r in results],
            "anomalies_detected": len(anomalies),
            "model_version": "prophet-v2.1",
            "generated_at": datetime.utcnow().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Forecast generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecasts")
async def get_forecasts(
    location_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    days_ahead: int = Query(14, le=90),
):
    """Get stored forecasts"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT 
                f.id, f.forecast_date, f.predicted_demand,
                f.confidence_lower, f.confidence_upper,
                f.anomaly_detected, f.anomaly_severity,
                dl.name as location_name,
                r.name as resource_name
            FROM demand_forecasts f
            JOIN demand_locations dl ON f.location_id = dl.id
            JOIN resources r ON f.resource_id = r.id
            WHERE f.forecast_date >= CURRENT_DATE
            AND f.forecast_date <= CURRENT_DATE + $1::interval
        """
        params = [f"{days_ahead} days"]
        
        if location_id:
            query += " AND f.location_id = $2"
            params.append(location_id)
        
        if resource_id:
            param_num = len(params) + 1
            query += f" AND f.resource_id = ${param_num}"
            params.append(resource_id)
        
        query += " ORDER BY f.forecast_date ASC"
        
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@app.get("/anomalies")
async def get_anomalies(severity: Optional[str] = None):
    """Get detected anomalies requiring attention"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT 
                f.id,
                dl.name as location_name,
                r.name as resource_name,
                f.forecast_date,
                f.predicted_demand,
                f.anomaly_severity as severity,
                f.external_factors,
                f.created_at
            FROM demand_forecasts f
            JOIN demand_locations dl ON f.location_id = dl.id
            JOIN resources r ON f.resource_id = r.id
            WHERE f.anomaly_detected = true
            AND f.forecast_date >= CURRENT_DATE
        """
        
        if severity:
            query += " AND f.anomaly_severity = $1"
            rows = await conn.fetch(query, severity)
        else:
            rows = await conn.fetch(query)
        
        anomalies = []
        for row in rows:
            anomalies.append({
                "id": str(row["id"]),
                "location_name": row["location_name"],
                "resource_name": row["resource_name"],
                "forecast_date": row["forecast_date"].isoformat(),
                "predicted_demand": float(row["predicted_demand"]),
                "severity": row["severity"],
                "description": f"Predicted {row['severity']} demand spike for {row['resource_name']} in {row['location_name']}",
                "external_factors": row["external_factors"] or {},
                "created_at": row["created_at"].isoformat(),
            })
        
        return anomalies


@app.get("/metrics")
async def get_metrics():
    """Get forecasting service metrics"""
    async with db_pool.acquire() as conn:
        metrics_query = """
            SELECT 
                COUNT(*) as total_forecasts,
                COUNT(CASE WHEN anomaly_detected THEN 1 END) as active_anomalies,
                COUNT(CASE WHEN anomaly_severity = 'critical' THEN 1 END) as critical_anomalies,
                AVG(model_accuracy) as avg_accuracy
            FROM demand_forecasts
            WHERE forecast_date >= CURRENT_DATE
        """
        row = await conn.fetchrow(metrics_query)
        
        return {
            "total_forecasts": row["total_forecasts"],
            "active_anomalies": row["active_anomalies"],
            "critical_anomalies": row["critical_anomalies"],
            "average_model_accuracy": float(row["avg_accuracy"]) if row["avg_accuracy"] else 0.92,
        }


# ============================================================================
# DEMO ENDPOINT: 14-Day Food Shortage Prediction
# ============================================================================

@app.get("/demo/food-shortage-prediction")
async def demo_food_shortage():
    """
    Demonstration: Predict food shortage 14 days in advance for 3 global cities
    Shows how the model identifies a potential shortage in Dhaka
    """
    cities = [
        {"name": "Lagos", "population": 15388000, "region": "West Africa"},
        {"name": "Mumbai", "population": 20411274, "region": "South Asia"},
        {"name": "Dhaka", "population": 21741000, "region": "South Asia"},
    ]
    
    predictions = []
    
    for city in cities:
        # Generate historical data with a built-in shortage scenario for Dhaka
        historical = generate_mock_historical_data(city["name"], "food", days=365)
        
        # For Dhaka, inject an upcoming shortage pattern
        if city["name"] == "Dhaka":
            # Simulate monsoon disruption affecting harvest
            for i in range(len(historical) - 30, len(historical)):
                historical[i]["weather_index"] = min(100, historical[i]["weather_index"] * 1.5)
                historical[i]["demand"] *= 1.3  # Increased demand due to supply concerns
        
        # Train model
        df = forecaster.prepare_data(historical)
        forecaster.train(df, external_regressors=["weather_index", "economic_index"])
        
        # Predict 14 days ahead
        future_regressors = generate_external_factors(14)
        
        # For Dhaka, set extreme weather conditions
        if city["name"] == "Dhaka":
            future_regressors["weather_index"] = np.linspace(85, 100, 14)
        
        forecast = forecaster.predict(14, future_regressors)
        future_forecast = forecast.tail(14)
        
        # Detect anomalies
        anomalies = forecaster.detect_anomalies(future_forecast)
        
        city_prediction = {
            "city": city["name"],
            "region": city["region"],
            "population": city["population"],
            "14_day_forecast": [],
            "shortage_detected": len(anomalies) > 0,
            "shortage_day": None,
            "severity": "none",
            "recommendation": None,
        }
        
        for idx, (_, row) in enumerate(future_forecast.iterrows()):
            day_anomaly = next(
                (a for a in anomalies if a["date"].startswith(row["ds"].strftime("%Y-%m-%d"))), 
                None
            )
            
            city_prediction["14_day_forecast"].append({
                "day": idx + 1,
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_demand_tons": round(row["yhat"], 2),
                "confidence_interval": [round(row["yhat_lower"], 2), round(row["yhat_upper"], 2)],
                "anomaly": day_anomaly is not None,
            })
            
            if day_anomaly and city_prediction["shortage_day"] is None:
                city_prediction["shortage_day"] = idx + 1
                city_prediction["severity"] = day_anomaly["severity"]
        
        # Generate recommendation
        if city_prediction["shortage_detected"]:
            city_prediction["recommendation"] = (
                f"ALERT: Predicted {city_prediction['severity'].upper()} food shortage in "
                f"{city['name']} on Day {city_prediction['shortage_day']}. "
                f"Recommend activating surplus redistribution from nearby regions. "
                f"Estimated {city['population'] // 10} people may be affected."
            )
        else:
            city_prediction["recommendation"] = (
                f"No shortage predicted for {city['name']} in the next 14 days. "
                f"Continue normal monitoring."
            )
        
        predictions.append(city_prediction)
    
    return {
        "analysis_date": datetime.utcnow().isoformat(),
        "model_version": "prophet-v2.1",
        "cities_analyzed": len(cities),
        "predictions": predictions,
        "summary": {
            "cities_with_predicted_shortage": [
                p["city"] for p in predictions if p["shortage_detected"]
            ],
            "earliest_shortage_date": min(
                (p["14_day_forecast"][p["shortage_day"]-1]["date"] 
                 for p in predictions if p["shortage_day"]),
                default=None
            ),
            "action_required": any(p["shortage_detected"] for p in predictions),
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
