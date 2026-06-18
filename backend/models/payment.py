from pydantic import BaseModel
from typing import Optional


class CreateCheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    promo_code: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PaymentStatusResponse(BaseModel):
    status: str
    payment_status: str
    amount: float
    currency: str
    package_id: str
    package_name: str


class PackageInfo(BaseModel):
    id: str
    name: str
    amount: float
    currency: str
    description: str
    profiles_included: int


class UserCreditsResponse(BaseModel):
    basic_credits: int
    comprehensive_credits: int
    premium_credits: int
    total_analyses_available: int
