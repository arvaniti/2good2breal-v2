import logging
from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from config import db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    total_analyses = await db.verification_results.count_documents({"user_id": current_user["id"]})

    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {"$group": {"_id": "$trust_level", "count": {"$sum": 1}}}
    ]
    trust_distribution = await db.verification_results.aggregate(pipeline).to_list(10)

    avg_pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$overall_score"}}}
    ]
    avg_result = await db.verification_results.aggregate(avg_pipeline).to_list(1)
    avg_score = avg_result[0]["avg_score"] if avg_result else 0

    recent = await db.verification_results.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)

    total_filters = await db.filters.count_documents({"user_id": current_user["id"]})

    return {
        "total_analyses": total_analyses,
        "average_score": round(avg_score, 1) if avg_score else 0,
        "trust_distribution": {item["_id"]: item["count"] for item in trust_distribution},
        "recent_analyses": recent,
        "total_filters": total_filters
    }
