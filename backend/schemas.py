from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
import datetime

# --- AUTH SCHEMAS ---
class OTPRequest(BaseModel):
    mobile_number: str = Field(..., description="Indian format or 10-digit mobile number")

    @validator('mobile_number')
    def validate_mobile(cls, v):
        # Allow numbers starting with +91 or clean 10-digit numbers
        clean_num = ''.join(filter(str.isdigit, v))
        if len(clean_num) == 10:
            return v
        elif len(clean_num) == 12 and clean_num.startswith("91"):
            return v
        raise ValueError("Invalid Indian mobile number. Must be 10 digits or start with +91.")

class OTPVerify(BaseModel):
    mobile_number: str
    otp: str = Field(..., min_length=6, max_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- COUPON SCHEMAS ---
class CouponResponse(BaseModel):
    id: int
    code: str
    description: str
    discount_value: float
    discount_type: str
    valid_until: datetime.datetime
    is_used: bool

    class Config:
        from_attributes = True

# --- USER PROFILE SCHEMAS ---
class UserProfileResponse(BaseModel):
    id: int
    mobile_number: str
    name: Optional[str] = None
    email: Optional[str] = None
    points_balance: int
    coupons: List[CouponResponse] = []

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None

# --- OFFER SCHEMAS ---
class OfferResponse(BaseModel):
    id: int
    title: str
    description: str
    store_id: Optional[int] = None
    image_url: Optional[str] = None
    valid_from: datetime.datetime
    valid_until: datetime.datetime
    is_active: bool

    class Config:
        from_attributes = True

# --- STORE SCHEMAS ---
class StoreResponse(BaseModel):
    id: int
    name: str
    address: str
    lat: float
    lng: float
    phone: str
    hours: str
    distance_km: Optional[float] = None

# --- SUPPORT SCHEMAS ---
class ContactInfoResponse(BaseModel):
    phone: str
    email: str
    hours: str

class SupportRequestCreate(BaseModel):
    name: str
    contact: str
    issue_category: str  # "order", "points", "refund", "store", "other"
    description: str

class SupportResponse(BaseModel):
    id: int
    status: str
    message: str

# --- AI CHAT SCHEMAS ---
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    messages: List[ChatMessage]

class AIChatResponse(BaseModel):
    reply: str

# --- POINTS TRANSACTION SCHEMAS ---
class PointsTransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: int
    description: str
    created_at: datetime.datetime
    transaction_type: str

    class Config:
        from_attributes = True
