# Savomart Loyalty Companion 🛒✨

Welcome to the **Savomart Loyalty Companion**, a highly premium, full-stack, mobile-responsive customer loyalty web application designed for the grocery retail brand **Savomart**. 

This application provides a seamless loyalty dashboard for customers, enabling them to verify accounts via mobile OTP, track point balances, copy reward coupons, search active promotional offers, locate nearest stores on interactive Leaflet maps using real-time geolocation, submit customer support tickets, and interact with an AI Chatbot powered securely by Anthropic's Claude.

---

## 🎨 Design & Brand Identity
- **Primary Brand Color:** `#782B90` (Purple) — governs visual headers, core button actions, profile themes, and Leaflet map pins.
- **Accent Highlight Color:** `#FFF200` (Yellow) — defines highlight details, dev-mode OTP alerts, exclusive markers on Leaflet maps, and badge accents.
- **Aesthetic Philosophy:** Premium glassmorphism card gradients, Outfit and Inter Google Fonts typography, modern layouts, micro-animations, and animated loading widgets.
- **Responsive Policy:** Mobile-first layout structure supporting desktop adaptive viewport layouts.

---

## 🛠️ Technology Stack
### Backend
- **Python + FastAPI:** Modern, high-performance web framework.
- **SQLAlchemy ORM:** SQL toolkit for clean relational mapping.
- **SQLite Database:** High-speed development database (`savomart.db`).
- **python-jose [cryptography]:** Implements secure HMAC-SHA256 JWT authorization valid for exactly 24 hours.
- **Pydantic v2:** Enterprise-grade validation schemas.
- **httpx:** Async HTTP client to query live store locators and Anthropic APIs.

### Frontend
- **React (Vite):** Blazing fast Single Page Application (SPA).
- **React Router v6:** Modern declarative client-side routing.
- **Axios:** Handles dynamic API querying with interceptor managers to automatically catch 401s and flush expired tokens.
- **Leaflet & React-Leaflet:** Completely free, interactive map renders (no API key required).
- **Tailwind CSS:** Premium styling using brand configuration profiles.
- **react-hot-toast:** Sleek popups supporting clipboard notifications and status checks.

---

## 📁 Project Architecture
```text
savomart-sde-intern-task-2026/
├── backend/
│   ├── data/
│   │   └── stores_fallback.json  # 10 realistic Indian stores with exact lat/lng
│   ├── routers/
│   │   ├── ai.py                 # Secure Anthropic Claude API proxy & intelligent mock chat
│   │   ├── auth.py               # Request-OTP and Verify-OTP endpoints
│   │   ├── offers.py             # Active discounts portal
│   │   ├── profile.py            # User credentials & coupons
│   │   ├── stores.py             # Live locator proxy with 5min cache & nearest calculations
│   │   └── support.py            # Customer ticketing logger
│   ├── utils/
│   │   ├── auth.py               # JWT encoders & security dependencies
│   │   └── otp.py                # 6-digit mock generator
│   ├── .env                      # Server runtime variables
│   ├── database.py               # SQLAlchemy SQLite engine setup
│   ├── main.py                   # FastAPI bootstrapper, CORS, and seed functions
│   ├── models.py                 # Declarative DB schemas
│   ├── schemas.py                # Pydantic v2 inputs/outputs
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Custom Axios client with 401 interceptor
│   │   ├── components/
│   │   │   ├── AiChatButton.jsx  # Floating (💬) chatbot with typing animation
│   │   │   ├── BottomNav.jsx     # Mobile-first navigation with active highlights
│   │   │   ├── LoadingSpinner.jsx# Standardized purple-yellow loading wheel
│   │   │   └── ProtectedRoute.jsx# Auth gate redirecting to /login
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Persisted auth state, OTP, and profile methods
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx # Points, coupon list & dynamic clipboard copies
│   │   │   ├── LoginPage.jsx     # Stylized OTP input boxes & dev banners
│   │   │   ├── OffersPage.jsx    # Promo grids, detail modals & inline location requests
│   │   │   ├── ProfilePage.jsx   # Editable initials avatar & inline preferences
│   │   │   ├── StoresPage.jsx    # Tabbed Leaflet locator & nearest marker pins
│   │   │   └── SupportPage.jsx   # Support pre-fills & ticket receipt references
│   │   ├── App.jsx               # Layout configurations & routers
│   │   ├── index.css             # Tailwind setup, custom scrollbars, and keyframes
│   │   └── main.jsx              # React mounting script
│   ├── .env                      # Frontend endpoints config
│   ├── index.html                # Leaflet stylesheet loads & Inter font loads
│   ├── postcss.config.js
│   ├── tailwind.config.js        # Extended brand colors configurations
│   ├── vite.config.js            # Port configurations
│   └── package.json              # Frontend libraries
└── README.md
```

---

## 💾 Database Schema Summary
SQLite is configured targeting file `./backend/savomart.db`. 
- **users:** `id` (PK), `mobile_number` (Unique), `name`, `email` (Nullable), `points_balance` (Int), `created_at`, `updated_at`.
- **otp_records:** `id` (PK), `mobile_number`, `otp_code` (6-digits), `created_at`, `expires_at` (5 min), `is_used` (Bool).
- **coupons:** `id` (PK), `user_id` (FK), `code` (Unique), `description`, `discount_value` (Float), `discount_type` ("percent" / "flat"), `valid_until`, `is_used`.
- **offers:** `id` (PK), `title`, `description`, `store_id` (FK, Nullable), `image_url`, `valid_from`, `valid_until`, `is_active`.
- **support_requests:** `id` (PK), `user_id` (FK, Nullable), `name`, `contact`, `issue_category`, `description`, `created_at`, `status` ("open" / "resolved").

---

## 🚀 Setup & Execution Guide

### Prerequisite Checklist
Ensure you have **Python 3.10+** and **Node.js 18+** installed on your system.

### Step 1: Start the Backend Service
1. Open a new terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows PowerShell:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install all dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Note: Upon startup, the backend automatically initializes `savomart.db` and seeds all mock users, offers, and coupons.*

### Step 2: Start the Frontend SPA
1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Start the Vite React server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Authentication Guide (Test Credentials)

Because this is an MVP, a MOCK SMS system has been built:
1. When you enter a test number on the login page and click **Send OTP**, the backend returns the active OTP in the response body.
2. The frontend intercepts this response and displays a **styled yellow banner at the top of the screen** containing the `dev_otp`.
3. Simply click the "Copy" link on the banner, paste it into the stylized input box, and verify!

### Pre-seeded Test Profiles
- **Mobile Number:** `9999999999` (Arjun Kumar — 1,240 Points — 2 active coupons)
- **Mobile Number:** `8888888888` (Priya Nair — 580 Points — 2 active coupons)
- **Mobile Number:** `7777777777` (Ravi Shankar — 3,200 Points — 2 active coupons)

*Entering any other valid 10-digit Indian mobile number will automatically create a new user profile with `0` loyalty points.*

---

## 🔐 Auth & Security Strategy Decisions
- **Development Mock OTP Flow:** We decouple mobile OTP generation from expensive third-party SMS handlers (like Twilio, MSG91, or Firebase). The mock architecture generates a secure 6-digit record in `otp_records` expiring in 5 minutes. **To transition to production, you only need to swap the return payload block in `backend/routers/auth.py` with your Twilio SDK trigger.**
- **Token Protection:** The JWT keys (`SECRET_KEY`) reside exclusively server-side. The frontend proxy `/api/ai/chat` acts as a shield, preventing browser users from capturing our Anthropic API credentials.
- **Client Session Flush:** To prevent stale token operations, client-side interceptors immediately redirect users to `/login` if any route requests return `401 Unauthorized`.

---

## 🧠 AI Support Agent Features
Our floating chat agent (💬) uses advanced conversational UX:
1. **Dynamic Prompting:** Claude guides the conversation, prompting the user for details (Name, Contact, Category, Description) sequentially without asking for them all at once.
2. **Key Security:** Passes instructions via `POST /api/ai/chat` keeping your `ANTHROPIC_API_KEY` safe inside `backend/.env`.
3. **Graceful Fallback:** If the API key is not configured or network issues occur, the backend immediately deploys a **smart, highly conversational local python mock agent** that guides the user through the exact same flow!
4. **Auto-Ticket Creation:** When the conversation notes "request has been logged" or exceeds 8 turns, it immediately POSTs to `/api/support/request` on behalf of the customer, and injects a styled green confirmation block containing the Ticket Reference inside the chat!

---

## 💡 Known Issues & Future Improvements
1. **SMS Integration:** Swap mock OTP returns with production Twilio/MSG91 connectors.
2. **Offline Leaflet Maps:** Leaflet maps fetch tiles from OpenStreetMap CDN. If running in a completely offline environment, map tiles will fall back to local grid graphics, although markers and nearest calculations will continue to compute.
3. **Database Migrations:** SQLite operates directly via SQLAlchemy schema creation. For production scale, introducing Alembic is recommended to manage schema versions.

---

## ## Video Demo
*This section contains a link placeholder to the video demonstration of the completed Savomart Loyalty Companion app:*

[![Savomart Loyalty Companion Video Demo](https://img.shields.io/badge/Video_Demo-Savomart_Loyalty_Companion-782B90?style=for-the-badge&logo=youtube&logoColor=FFF200)](https://youtu.be/placeholder-demo-id)

*(Alternatively, access the walkthrough video at the following link: [YouTube/Loom Placeholder Video URL](https://youtu.be/placeholder-demo-id))*
