from pydantic import BaseModel
from typing import Optional, Dict, Any


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool = True


class AdminAnalysisResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_name: str
    profile_name: str
    status: str
    created_at: str
    form_data: Dict[str, Any]
    ai_analysis: Optional[Dict[str, Any]] = None


class AdminReportData(BaseModel):
    admin_report: Dict[str, Any]
    status: Optional[str] = "completed"


class SendReportData(BaseModel):
    admin_report: Dict[str, Any]
    client_email: str


class RefundRequestData(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    phone: str
    address: str
    city: str
    postalCode: str
    country: str
    orderReference: str
    orderDate: str
    packagePurchased: str
    amountPaid: str
    accountHolder: str
    iban: str
    bic: str
    bankName: str
    reason: str
    additionalDetails: Optional[str] = ""
    agreeTerms: bool
    agreeDataProcessing: bool
    submittedAt: str
    language: str
