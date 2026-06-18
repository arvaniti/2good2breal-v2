from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any


class UploadedPhoto(BaseModel):
    name: str
    base64: str


class ProfileAnalysisRequest(BaseModel):
    client_email: Optional[str] = ""
    client_age: Optional[str] = ""
    client_location: Optional[str] = ""
    client_phone: Optional[str] = ""
    profile_name: str
    full_real_name: Optional[str] = ""
    gender: Optional[str] = ""
    height: Optional[str] = ""
    nationality: Optional[str] = ""
    language_of_communication: Optional[str] = ""
    assumed_marital_status: Optional[str] = ""
    hobbies_interests: Optional[str] = ""
    university_college: Optional[str] = ""
    years_attendance: Optional[str] = ""
    phone_whatsapp: Optional[str] = ""
    profile_email: Optional[str] = ""
    profile_bio: Optional[str] = ""
    date_of_birth: Optional[str] = ""
    assumed_age: Optional[str] = ""
    profile_location: Optional[str] = ""
    occupation: Optional[str] = ""
    company_name: Optional[str] = ""
    company_website: Optional[str] = ""
    profile_photos_count: Optional[str] = ""
    has_verified_photos: Optional[bool] = False
    social_media_links: Optional[str] = ""
    profile_creation_date: Optional[str] = ""
    last_active: Optional[str] = ""
    dating_platform: Optional[str] = ""
    communication_frequency: Optional[str] = ""
    message_substance: Optional[str] = ""
    has_met_profile: Optional[str] = ""
    communication_method: Optional[str] = ""
    last_communication_timeframe: Optional[str] = ""
    first_meet_date: Optional[str] = ""
    first_engagement_timeframe: Optional[str] = ""
    observations_concerns: Optional[str] = ""
    photos: Optional[List[UploadedPhoto]] = []


class RedFlag(BaseModel):
    category: str
    severity: str
    description: str
    recommendation: str


class VerificationResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    profile_name: str
    overall_score: int = 0
    trust_level: str = "pending"
    red_flags: List[RedFlag] = []
    analysis_summary: str = ""
    detailed_analysis: Optional[Dict[str, Any]] = None
    image_analysis: Optional[Dict[str, Any]] = None
    recommendations: List[str] = []
    created_at: str
    status: Optional[str] = "pending"


class FilterCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    criteria: Dict[str, Any]
    is_active: bool = True


class FilterResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    description: str
    criteria: Dict[str, Any]
    is_active: bool
    created_at: str
