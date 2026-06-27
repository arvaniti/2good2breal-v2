import uuid
import logging
import asyncio
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from models.analysis import ProfileAnalysisRequest, VerificationResult
from utils.auth import get_current_user
from services.ai import analyze_profile_with_ai_v2
from services.email import send_analysis_form_notification, send_client_acceptance_confirmation
from config import db, ADMIN_EMAIL

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=VerificationResult)
async def analyze_profile(profile: ProfileAnalysisRequest, current_user: dict = Depends(get_current_user)):
    basic_credits = current_user.get("basic_credits", 0)
    comprehensive_credits = current_user.get("comprehensive_credits", 0)
    premium_credits = current_user.get("premium_credits", 0)
    paid_credits = basic_credits + comprehensive_credits + premium_credits

    if paid_credits <= 0:
        raise HTTPException(status_code=402, detail="No paid credits available. Please purchase a verification package to continue. Free credits are not accepted for profile analysis.")

    credit_field = None
    credit_type = None
    if basic_credits > 0:
        credit_field = "basic_credits"
        credit_type = "basic"
    elif comprehensive_credits > 0:
        credit_field = "comprehensive_credits"
        credit_type = "comprehensive"
    elif premium_credits > 0:
        credit_field = "premium_credits"
        credit_type = "premium"

    photos_count = len(profile.photos) if profile.photos else 0
    result_id = str(uuid.uuid4())

    result = VerificationResult(
        id=result_id,
        user_id=current_user["id"],
        profile_name=profile.profile_name,
        overall_score=0,
        trust_level="pending",
        red_flags=[],
        analysis_summary="Your profile submission has been received successfully. Our team will analyze the profile and contact you within 48 hours with the results.",
        detailed_analysis={},
        image_analysis={},
        recommendations=["Your request is being processed by our expert team.", "You will receive the detailed verification report via email.", "For urgent inquiries, please contact us via WhatsApp or phone."],
        created_at=datetime.now(timezone.utc).isoformat()
    )

    result_dict = result.model_dump()
    result_dict["red_flags"] = []
    result_dict["credit_type_used"] = credit_type
    result_dict["status"] = "pending"
    result_dict["ai_analysis"] = None
    result_dict["form_data"] = {
        "client_email": profile.client_email,
        "client_age": profile.client_age,
        "client_location": profile.client_location,
        "client_phone": profile.client_phone,
        "profile_name": profile.profile_name,
        "full_real_name": profile.full_real_name,
        "gender": profile.gender,
        "height": profile.height,
        "nationality": profile.nationality,
        "language_of_communication": profile.language_of_communication,
        "assumed_marital_status": profile.assumed_marital_status,
        "hobbies_interests": profile.hobbies_interests,
        "university_college": profile.university_college,
        "years_attendance": profile.years_attendance,
        "phone_whatsapp": profile.phone_whatsapp,
        "profile_email": profile.profile_email,
        "date_of_birth": profile.date_of_birth,
        "assumed_age": profile.assumed_age,
        "profile_location": profile.profile_location,
        "occupation": profile.occupation,
        "company_name": profile.company_name,
        "company_website": profile.company_website,
        "dating_platform": profile.dating_platform,
        "profile_bio": profile.profile_bio,
        "profile_photos_count": profile.profile_photos_count,
        "has_verified_photos": profile.has_verified_photos,
        "social_media_links": profile.social_media_links,
        "profile_creation_date": profile.profile_creation_date,
        "last_active": profile.last_active,
        "communication_frequency": profile.communication_frequency,
        "message_substance": profile.message_substance,
        "has_met_profile": profile.has_met_profile,
        "communication_method": profile.communication_method,
        "last_communication_timeframe": profile.last_communication_timeframe,
        "first_meet_date": profile.first_meet_date,
        "first_engagement_timeframe": profile.first_engagement_timeframe,
        "observations_concerns": profile.observations_concerns,
        "risk_assessment": profile.risk_assessment,
        "photos_uploaded": photos_count,
        "photos": [{"name": p.name, "base64": p.base64} for p in profile.photos] if profile.photos else []
    }
    await db.verification_results.insert_one(result_dict)

    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {credit_field: -1}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    logger.info(f"Analysis request submitted for user {current_user['email']}, used 1 {credit_type} credit")

    async def run_background_tasks():
        try:
            ai_analysis = None
            try:
                ai_analysis = await analyze_profile_with_ai_v2(profile)
                logger.info(f"AI analysis completed for profile: {profile.profile_name}")
            except Exception as e:
                logger.error(f"AI analysis failed: {e}")
                ai_analysis = {"error": str(e), "status": "failed"}

            await db.verification_results.update_one(
                {"id": result_id},
                {"$set": {"ai_analysis": ai_analysis}}
            )

            try:
                await send_analysis_form_notification(current_user["email"], current_user["name"], profile, photos_count)
            except Exception as e:
                logger.error(f"Admin notification email failed: {e}")

            client_email = ADMIN_EMAIL  # TODO: Change back to profile.client_email once domain is verified on Resend
            try:
                await send_client_acceptance_confirmation(client_email, current_user["name"], result_id, credit_type)
            except Exception as e:
                logger.error(f"Acceptance email failed: {e}")
        except Exception as e:
            logger.error(f"Background task error: {e}")

    asyncio.create_task(run_background_tasks())
    return result


@router.get("/analyses", response_model=List[VerificationResult])
async def get_analyses(current_user: dict = Depends(get_current_user)):
    results = await db.verification_results.find(
        {"user_id": current_user["id"]},
        {"_id": 0, "id": 1, "user_id": 1, "profile_name": 1, "overall_score": 1, "trust_level": 1,
         "red_flags": 1, "analysis_summary": 1, "recommendations": 1, "created_at": 1, "status": 1}
    ).sort("created_at", -1).to_list(50)
    return results


@router.get("/analyses/{analysis_id}", response_model=VerificationResult)
async def get_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.verification_results.find_one(
        {"id": analysis_id, "user_id": current_user["id"]}, {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.verification_results.delete_one({"id": analysis_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Analysis deleted"}
