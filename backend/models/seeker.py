from pydantic import BaseModel
from typing import List, Optional


class ProfileSeekerCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    pseudonyms: Optional[List[str]] = []
    address: Optional[str] = ""
    birth_date: Optional[str] = ""
    birth_place: Optional[str] = ""
    notes: Optional[str] = ""


class ProfileSeekerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    pseudonyms: Optional[List[str]] = None
    address: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    notes: Optional[str] = None


class ComparePhotosRequest(BaseModel):
    photo1: str
    photo2: str
    profile1_id: Optional[str] = None
    profile2_id: Optional[str] = None


class CompareProfilesRequest(BaseModel):
    profile1_id: str
    profile2_id: str


class SeekerSearchRequest(BaseModel):
    profile_id: str
    search_types: List[str] = ["web", "image"]
