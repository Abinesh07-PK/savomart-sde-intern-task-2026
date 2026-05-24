from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mobile_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    points_balance = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    coupons = relationship("Coupon", back_populates="user", cascade="all, delete-orphan")
    support_requests = relationship("SupportRequest", back_populates="user", cascade="all, delete-orphan")
    points_transactions = relationship("PointsTransaction", back_populates="user", cascade="all, delete-orphan")

class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mobile_number = Column(String, index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)
    discount_value = Column(Float, nullable=False)
    discount_type = Column(String, nullable=False)  # "percent" or "flat"
    valid_until = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="coupons")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    store_id = Column(Integer, nullable=True)  # Null means applies to all stores
    image_url = Column(String, nullable=True)
    valid_from = Column(DateTime, default=datetime.datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for guests
    name = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    issue_category = Column(String, nullable=False)  # "order", "points", "refund", "store", "other"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="open")  # "open", "in_progress", "resolved"

    user = relationship("User", back_populates="support_requests")

class PointsTransaction(Base):
    __tablename__ = "points_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    transaction_type = Column(String, nullable=False) # "earn" or "redeem"

    user = relationship("User", back_populates="points_transactions")
