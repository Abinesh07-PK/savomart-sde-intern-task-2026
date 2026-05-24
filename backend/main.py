import os
import datetime
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from slowapi.errors import RateLimitExceeded

import database
import models
from routers import auth, profile, offers, stores, support, ai
from utils.limiter import limiter

# Initialize FastAPI App
app = FastAPI(
    title="Savomart Loyalty Companion API",
    description="Backend API services supporting mock OTP, points loyalty, stores and support tickets.",
    version="1.0.0"
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many OTP requests. Please wait 10 minutes."}
    )

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for quick local setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect & Initialize SQLite Database Tables
models.Base.metadata.create_all(bind=database.engine)

def seed_database(db: Session):
    """
    Seeds initial database tables with mock users, coupons, and offers on application boot.
    """
    # Check if database already has users
    if db.query(models.User).count() > 0:
        print("Database already seeded. Skipping...")
        return
        
    print("Seeding SQLite database with mock data...")
    
    # 1. Seed 3 sample users
    user_arjun = models.User(
        mobile_number="9999999999",
        name="Arjun Kumar",
        email="arjun.kumar@example.com",
        points_balance=1240
    )
    user_priya = models.User(
        mobile_number="8888888888",
        name="Priya Nair",
        email="priya.nair@example.com",
        points_balance=580
    )
    user_ravi = models.User(
        mobile_number="7777777777",
        name="Ravi Shankar",
        email="ravi.shankar@example.com",
        points_balance=3200
    )
    
    db.add_all([user_arjun, user_priya, user_ravi])
    db.commit()
    db.refresh(user_arjun)
    db.refresh(user_priya)
    db.refresh(user_ravi)
    
    # 2. Seed 2-3 coupons per test user
    future_date = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    
    # Arjun's coupons
    c_arjun_1 = models.Coupon(
        user_id=user_arjun.id,
        code="SAVO200",
        description="Flat ₹200 Off on your next order",
        discount_value=200.0,
        discount_type="flat",
        valid_until=future_date
    )
    c_arjun_2 = models.Coupon(
        user_id=user_arjun.id,
        code="FRESH10",
        description="10% Off on Fresh Veggies & Fruits",
        discount_value=10.0,
        discount_type="percent",
        valid_until=future_date
    )
    
    # Priya's coupons
    c_priya_1 = models.Coupon(
        user_id=user_priya.id,
        code="SAVO50",
        description="Flat ₹50 Off on ₹300+ purchase",
        discount_value=50.0,
        discount_type="flat",
        valid_until=future_date
    )
    c_priya_2 = models.Coupon(
        user_id=user_priya.id,
        code="BAKE15",
        description="15% Off on freshly baked goods",
        discount_value=15.0,
        discount_type="percent",
        valid_until=future_date
    )
    
    # Ravi's coupons
    c_ravi_1 = models.Coupon(
        user_id=user_ravi.id,
        code="SUPER500",
        description="Flat ₹500 Off Premium Members Promo",
        discount_value=500.0,
        discount_type="flat",
        valid_until=future_date
    )
    c_ravi_2 = models.Coupon(
        user_id=user_ravi.id,
        code="DIARY5",
        description="5% Off on organic dairy products",
        discount_value=5.0,
        discount_type="percent",
        valid_until=future_date
    )
    
    db.add_all([c_arjun_1, c_arjun_2, c_priya_1, c_priya_2, c_ravi_1, c_ravi_2])
    
    # 3. Seed 5 active offers
    this_weekend_start = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    this_weekend_end = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    
    offer_1 = models.Offer(
        title="Weekend Double Points",
        description="Earn double loyalty points on all purchases at any Savomart store this weekend!",
        store_id=None,
        image_url="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
        valid_from=this_weekend_start,
        valid_until=this_weekend_end,
        is_active=True
    )
    offer_2 = models.Offer(
        title="10% Off Fresh Produce",
        description="Save 10% instantly on all green vegetables, seasonal fruits, and leafy salads.",
        store_id=None,
        image_url="https://images.unsplash.com/photo-1610397613657-a97e87970881?auto=format&fit=crop&q=80&w=400",
        valid_from=this_weekend_start,
        valid_until=this_weekend_end,
        is_active=True
    )
    offer_3 = models.Offer(
        title="Buy 2 Get 1 Free Beverages",
        description="Buy any 2 carbonated soft drinks or freshly squeezed juices, get 1 free! Valid only at Chennai T-Nagar store.",
        store_id=1,  # Savomart T-Nagar
        image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400",
        valid_from=this_weekend_start,
        valid_until=this_weekend_end,
        is_active=True
    )
    offer_4 = models.Offer(
        title="Flat ₹50 Off on ₹500+",
        description="Add groceries worth ₹500 or more to your cart and get a flat ₹50 cash deduction at checkout.",
        store_id=None,
        image_url="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400",
        valid_from=this_weekend_start,
        valid_until=this_weekend_end,
        is_active=True
    )
    offer_5 = models.Offer(
        title="New Member Bonus: 200 Points",
        description="Welcome to the family! Fresh accounts earn 200 bonus loyalty points upon verification.",
        store_id=None,
        image_url="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400",
        valid_from=this_weekend_start,
        valid_until=this_weekend_end,
        is_active=True
    )
    
    db.add_all([offer_1, offer_2, offer_3, offer_4, offer_5])
    db.commit()

    # 4. Seed Points Transactions for users
    # Arjun's transactions (5)
    t_arjun_1 = models.PointsTransaction(
        user_id=user_arjun.id,
        amount=500,
        transaction_type="earn",
        description="Welcome Bonus Points",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
    )
    t_arjun_2 = models.PointsTransaction(
        user_id=user_arjun.id,
        amount=300,
        transaction_type="earn",
        description="Grocery Shopping - Invoice #SAVO-1024",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=8)
    )
    t_arjun_3 = models.PointsTransaction(
        user_id=user_arjun.id,
        amount=150,
        transaction_type="redeem",
        description="Redeemed SAVO150 Discount Coupon",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    t_arjun_4 = models.PointsTransaction(
        user_id=user_arjun.id,
        amount=440,
        transaction_type="earn",
        description="Weekend Double Points Promo purchase",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    t_arjun_5 = models.PointsTransaction(
        user_id=user_arjun.id,
        amount=150,
        transaction_type="earn",
        description="Friend Referral Reward - Rahul S",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )

    # Priya's transactions (3)
    t_priya_1 = models.PointsTransaction(
        user_id=user_priya.id,
        amount=500,
        transaction_type="earn",
        description="Welcome Bonus Points",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=6)
    )
    t_priya_2 = models.PointsTransaction(
        user_id=user_priya.id,
        amount=180,
        transaction_type="earn",
        description="Savo Bakery Purchase - Invoice #SAVO-1088",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
    )
    t_priya_3 = models.PointsTransaction(
        user_id=user_priya.id,
        amount=100,
        transaction_type="redeem",
        description="Redeemed Flat ₹100 Voucher",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )

    # Ravi's transactions (5)
    t_ravi_1 = models.PointsTransaction(
        user_id=user_ravi.id,
        amount=1000,
        transaction_type="earn",
        description="Platinum Club Onboarding Gift",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12)
    )
    t_ravi_2 = models.PointsTransaction(
        user_id=user_ravi.id,
        amount=2000,
        transaction_type="earn",
        description="Electronics & Appliances Shop - Invoice #SAVO-0995",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
    )
    t_ravi_3 = models.PointsTransaction(
        user_id=user_ravi.id,
        amount=300,
        transaction_type="redeem",
        description="Redeemed Movie Ticket Voucher Promo",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
    )
    t_ravi_4 = models.PointsTransaction(
        user_id=user_ravi.id,
        amount=700,
        transaction_type="earn",
        description="Monthly Groceries Stocking - Invoice #SAVO-1140",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
    )
    t_ravi_5 = models.PointsTransaction(
        user_id=user_ravi.id,
        amount=200,
        transaction_type="redeem",
        description="Insta-Discount Voucher applied",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )

    db.add_all([
        t_arjun_1, t_arjun_2, t_arjun_3, t_arjun_4, t_arjun_5,
        t_priya_1, t_priya_2, t_priya_3,
        t_ravi_1, t_ravi_2, t_ravi_3, t_ravi_4, t_ravi_5
    ])
    db.commit()
    print("Database seeding completed!")

# Seed on startup
db = database.SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# Include Subrouters
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(offers.router)
app.include_router(stores.router)
app.include_router(support.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Savomart Loyalty Companion API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
