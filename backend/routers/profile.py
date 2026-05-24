from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

import database
import models
import schemas
from utils.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("/me", response_model=schemas.UserProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    Protected route to retrieve current authenticated user details and active coupons.
    """
    # Fetch active coupons (not used, valid until future date)
    now = datetime.datetime.utcnow()
    coupons = db.query(models.Coupon).filter(
        models.Coupon.user_id == current_user.id,
        models.Coupon.is_used == False,
        models.Coupon.valid_until > now
    ).all()
    
    current_user.coupons = coupons
    return current_user

@router.put("/me", response_model=schemas.UserProfileResponse)
def update_profile(
    payload: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Protected route to update user name and email.
    """
    current_user.name = payload.name
    current_user.email = payload.email
    current_user.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    # Reload coupons to return full profile representation
    now = datetime.datetime.utcnow()
    coupons = db.query(models.Coupon).filter(
        models.Coupon.user_id == current_user.id,
        models.Coupon.is_used == False,
        models.Coupon.valid_until > now
    ).all()
    current_user.coupons = coupons
    
    return current_user

@router.get("/points-history", response_model=List[schemas.PointsTransactionResponse])
def get_points_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Retrieve points transaction history for the authenticated user, showing the last 10 entries.
    """
    transactions = db.query(models.PointsTransaction).filter(
        models.PointsTransaction.user_id == current_user.id
    ).order_by(models.PointsTransaction.created_at.desc()).limit(10).all()
    
    return transactions
