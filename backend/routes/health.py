import logging
from datetime import datetime, timezone
from fastapi import APIRouter
from config import db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Profile Verify API", "status": "healthy"}


@router.get("/health")
async def health():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "2good2breal-api"
    }
    if db is not None:
        try:
            await db.command('ping')
            health_status["database"] = "connected"
        except Exception as e:
            health_status["database"] = "disconnected"
            logger.warning(f"Database health check failed: {e}")
    else:
        health_status["database"] = "not_configured"
    return health_status
