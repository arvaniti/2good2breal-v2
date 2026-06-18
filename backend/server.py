from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import logging

from config import db, client
from utils.auth import seed_admin_user
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.analysis import router as analysis_router
from routes.filters import router as filters_router
from routes.dashboard import router as dashboard_router
from routes.payments import router as payments_router
from routes.seeker import router as seeker_router
from routes.health import router as health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="2good2breal API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all route modules into the api_router
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(analysis_router)
api_router.include_router(filters_router)
api_router.include_router(dashboard_router)
api_router.include_router(payments_router)
api_router.include_router(seeker_router)
api_router.include_router(health_router)

# Include the api_router in the main app
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting 2good2breal API server...")
    if db is not None:
        try:
            await db.command('ping')
            logger.info("Database connection verified successfully")
            await seed_admin_user()
        except Exception as e:
            logger.warning(f"Database ping failed during startup (non-blocking): {e}")
    else:
        logger.warning("Database not configured - some features may not work")


# Root-level health endpoint (without /api prefix) for Kubernetes probes
@app.get("/health")
async def root_health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/")
async def app_root():
    return {"message": "2good2breal API", "status": "running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
