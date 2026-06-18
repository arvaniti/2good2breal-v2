import uuid
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from models.analysis import FilterCreate, FilterResponse
from utils.auth import get_current_user
from config import db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/filters", response_model=FilterResponse)
async def create_filter(filter_data: FilterCreate, current_user: dict = Depends(get_current_user)):
    filter_id = str(uuid.uuid4())
    filter_doc = {
        "id": filter_id,
        "user_id": current_user["id"],
        "name": filter_data.name,
        "description": filter_data.description or "",
        "criteria": filter_data.criteria,
        "is_active": filter_data.is_active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.filters.insert_one(filter_doc)
    return FilterResponse(**filter_doc)


@router.get("/filters", response_model=List[FilterResponse])
async def get_filters(current_user: dict = Depends(get_current_user)):
    filters = await db.filters.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return filters


@router.put("/filters/{filter_id}", response_model=FilterResponse)
async def update_filter(filter_id: str, filter_data: FilterCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.filters.find_one({"id": filter_id, "user_id": current_user["id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Filter not found")

    update_data = {
        "name": filter_data.name,
        "description": filter_data.description or "",
        "criteria": filter_data.criteria,
        "is_active": filter_data.is_active
    }
    await db.filters.update_one({"id": filter_id}, {"$set": update_data})
    updated = await db.filters.find_one({"id": filter_id}, {"_id": 0})
    return FilterResponse(**updated)


@router.delete("/filters/{filter_id}")
async def delete_filter(filter_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.filters.delete_one({"id": filter_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Filter not found")
    return {"message": "Filter deleted"}
