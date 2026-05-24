from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import datetime

import database
import models
import schemas
from utils.auth import get_current_user

router = APIRouter(prefix="/api/offers", tags=["Offers"])

@router.get("", response_model=List[schemas.OfferResponse])
def get_offers(
    store_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Protected route to retrieve active offers.
    Supports filtering by ?store_id=X. If provided, returns offers applying to all stores (store_id IS NULL)
    plus offers matching the specific store_id.
    """
    now = datetime.datetime.utcnow()
    query = db.query(models.Offer).filter(
        models.Offer.is_active == True,
        models.Offer.valid_from <= now,
        models.Offer.valid_until >= now
    )
    
    if store_id is not None:
        query = query.filter(
            or_(
                models.Offer.store_id == None,
                models.Offer.store_id == store_id
            )
        )
        
    return query.all()

@router.get("/{offer_id}", response_model=schemas.OfferResponse)
def get_offer_detail(
    offer_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Protected route to fetch details for a single offer.
    """
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    return offer
