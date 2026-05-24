from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import datetime
from jose import jwt

import database
import models
import schemas
from utils.auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/support", tags=["Support"])

def get_optional_user_id(authorization: Optional[str] = Header(None), db: Session = Depends(database.get_db)) -> Optional[int]:
    """
    Optional helper dependency to extract user_id if an Authorization token is supplied.
    Allows support request logging to remain open to guest queries as well.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
        
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        return user_id
    except Exception:
        return None

@router.get("/contact-info", response_model=schemas.ContactInfoResponse)
def get_contact_info():
    """
    Returns static support information and business hours.
    """
    return {
        "phone": "1800-123-5678",
        "email": "support@savomart.in",
        "hours": "Mon–Sat, 9 AM – 6 PM IST"
    }

@router.post("/request", response_model=schemas.SupportResponse)
def create_support_request(
    payload: schemas.SupportRequestCreate,
    user_id: Optional[int] = Depends(get_optional_user_id),
    db: Session = Depends(database.get_db)
):
    """
    Submit a customer support request, logs it to database, and assigns a ticket reference.
    """
    ticket = models.SupportRequest(
        user_id=user_id,
        name=payload.name,
        contact=payload.contact,
        issue_category=payload.issue_category,
        description=payload.description,
        status="open"
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Return ticket details
    ref_code = f"SAVO-{ticket.id:04d}"
    return {
        "id": ticket.id,
        "status": "open",
        "message": f"We've successfully logged your ticket ({ref_code}). Our customer success team will get back to you within 24 hours!"
    }
