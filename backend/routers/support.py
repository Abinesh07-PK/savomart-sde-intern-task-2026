from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
import datetime
from jose import jwt

import database
import models
from utils.auth import get_current_user
import schemas
from utils.auth import SECRET_KEY, ALGORITHM
from fastapi.responses import FileResponse
import os
import openpyxl

router = APIRouter(prefix="/api/support", tags=["Support"])

EXCEL_PATH = "support_tickets.xlsx"

def append_to_excel(ticket_data: dict):
    if os.path.exists(EXCEL_PATH):
        wb = openpyxl.load_workbook(EXCEL_PATH)
        ws = wb.active
    else:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Support Tickets"
        ws.append([
            "Ticket ID", "Name", "Contact", 
            "Issue Category", "Description", 
            "Status", "Submitted At"
        ])
    ws.append([
        ticket_data["id"],
        ticket_data["name"],
        ticket_data["contact"],
        ticket_data["issue_category"],
        ticket_data["description"],
        ticket_data["status"],
        datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    ])
    wb.save(EXCEL_PATH)

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
    # Append ticket info to Excel file
    ticket_data = {
        "id": ticket.id,
        "name": payload.name,
        "contact": payload.contact,
        "issue_category": payload.issue_category,
        "description": payload.description,
        "status": ticket.status,
    }
    append_to_excel(ticket_data)
    
    # Return ticket details
    ref_code = f"SAVO-{ticket.id:04d}"
    return {
        "id": ticket.id,
        "status": "open",
        "message": f"We've successfully logged your ticket ({ref_code}). Our customer success team will get back to you within 24 hours!"
    }

@router.get("/my-tickets", response_model=List[schemas.MyTicketResponse])
def get_my_tickets(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    Returns all support tickets for the authenticated user, ordered by newest first.
    """
    tickets = db.query(models.SupportRequest).filter(models.SupportRequest.user_id == current_user.id).order_by(models.SupportRequest.created_at.desc()).all()
    return tickets

@router.get("/export-tickets")
def export_tickets():
    if not os.path.exists(EXCEL_PATH):
        raise HTTPException(status_code=404, detail="No tickets yet")
    return FileResponse(
        EXCEL_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="savomart_support_tickets.xlsx"
    )
