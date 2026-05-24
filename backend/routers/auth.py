from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import datetime

import database
import models
import schemas
from utils.otp import generate_mock_otp
from utils.auth import create_access_token
from utils.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/request-otp", response_model=dict)
@limiter.limit("3/10minute")
def request_otp(request: Request, payload: schemas.OTPRequest, db: Session = Depends(database.get_db)):
    """
    Step 1: Request a 6-digit OTP code for a given Indian mobile number.
    In development mode, the OTP is returned in the response body.
    """
    mobile = payload.mobile_number
    otp_code = generate_mock_otp()
    
    # 5 minutes expiry
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    
    # Save to DB
    otp_record = models.OTPRecord(
        mobile_number=mobile,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()
    
    return {
        "message": "OTP sent successfully",
        "dev_otp": otp_code
    }

@router.post("/verify-otp", response_model=schemas.TokenResponse)
def verify_otp(payload: schemas.OTPVerify, db: Session = Depends(database.get_db)):
    """
    Step 2: Verify the 6-digit OTP and generate a JWT access token valid for 24h.
    If the user does not exist yet, a new user account is created.
    """
    now = datetime.datetime.utcnow()
    
    # Fetch latest unused, non-expired OTP for this mobile number
    otp_record = db.query(models.OTPRecord).filter(
        models.OTPRecord.mobile_number == payload.mobile_number,
        models.OTPRecord.otp_code == payload.otp,
        models.OTPRecord.is_used == False,
        models.OTPRecord.expires_at > now
    ).order_by(models.OTPRecord.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please request a new one."
        )
    
    # Mark OTP as used
    otp_record.is_used = True
    db.commit()
    
    # Check if user already exists
    user = db.query(models.User).filter(models.User.mobile_number == payload.mobile_number).first()
    if not user:
        # Create a new user
        user = models.User(
            mobile_number=payload.mobile_number,
            name=f"User {payload.mobile_number[-4:]}",
            points_balance=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate JWT
    token_data = {
        "user_id": user.id,
        "mobile_number": user.mobile_number
    }
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
