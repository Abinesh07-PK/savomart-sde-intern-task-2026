import os
import json
import datetime
import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from dotenv import load_dotenv

import schemas

load_dotenv()

router = APIRouter(prefix="/api/stores", tags=["Stores"])

FALLBACK_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "stores_fallback.json")

# Server-side Cache
stores_cache = {
    "data": None,
    "timestamp": None
}
CACHE_DURATION_MINUTES = 5

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes the great-circle distance between two points in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def load_fallback_stores() -> List[dict]:
    """
    Loads fallback store seed data from local JSON.
    """
    try:
        with open(FALLBACK_FILE_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading local fallback file: {e}")
        # absolute bare minimum fallback list to prevent system crash
        return [
            {
                "id": 1,
                "name": "Savomart T-Nagar",
                "address": "78 Pondy Bazaar, T-Nagar, Chennai, Tamil Nadu 600017",
                "lat": 13.0418,
                "lng": 80.2341,
                "phone": "+914424345678",
                "hours": "8 AM - 10 PM"
            }
        ]

async def fetch_stores_list() -> List[dict]:
    """
    Helper function to query either live Savomart APIs or load local fallback JSON.
    Caches the results server-side for 5 minutes.
    """
    global stores_cache
    now = datetime.datetime.utcnow()
    
    # Check cache validity
    if (
        stores_cache["data"] is not None and 
        stores_cache["timestamp"] is not None and 
        (now - stores_cache["timestamp"]).total_seconds() < CACHE_DURATION_MINUTES * 60
    ):
        return stores_cache["data"]
        
    api_url = os.getenv("SAVOMART_STORE_API_URL")
    api_token = os.getenv("SAVOMART_STORE_API_TOKEN")
    
    if not api_url:
        # Fallback to local file if environment setup is incomplete
        fallback_data = load_fallback_stores()
        stores_cache["data"] = fallback_data
        stores_cache["timestamp"] = now
        return fallback_data
        
    try:
        headers = {"X-cron-token": api_token} if api_token else {}
        # Fetch with a 3-second timeout to prevent stalling the user if offline
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{api_url}?is_operational=True", headers=headers)
            
            if response.status_code == 200:
                raw_stores = response.json()
                cleaned_stores = []
                # Handle possible list or dict responses
                if isinstance(raw_stores, list):
                    source_list = raw_stores
                elif isinstance(raw_stores, dict) and "stores" in raw_stores:
                    source_list = raw_stores["stores"]
                else:
                    source_list = []
                    
                for idx, item in enumerate(source_list):
                    cleaned_stores.append({
                        "id": item.get("id", idx + 1),
                        "name": item.get("name", f"Savomart Store {idx+1}"),
                        "address": item.get("address", "Savomart Address"),
                        "lat": float(item.get("lat") or item.get("latitude") or 0.0),
                        "lng": float(item.get("lng") or item.get("longitude") or 0.0),
                        "phone": item.get("phone", "+919999999999"),
                        "hours": item.get("hours", "9 AM - 9 PM")
                    })
                    
                if cleaned_stores:
                    stores_cache["data"] = cleaned_stores
                    stores_cache["timestamp"] = now
                    return cleaned_stores
                    
            print(f"Savomart API returned status {response.status_code}. Using local fallback JSON.")
    except Exception as e:
        print(f"Exception trying to fetch Savomart Live API: {e}. Utilizing fallback data.")
        
    # If API requests failed or raised exceptions, use local seed data
    fallback_data = load_fallback_stores()
    stores_cache["data"] = fallback_data
    stores_cache["timestamp"] = now
    return fallback_data

@router.get("", response_model=List[schemas.StoreResponse])
async def get_stores():
    """
    Retrieve all operational Savomart store branches.
    Uses cached/proxied live results or JSON fallback.
    """
    return await fetch_stores_list()

@router.get("/nearest", response_model=List[schemas.StoreResponse])
async def get_nearest_stores(lat: float, lng: float):
    """
    Given query coordinates ?lat=X&lng=Y, sort the stores in ascending order of distance
    using the Haversine distance formula. Appends 'distance_km' to responses.
    """
    stores = await fetch_stores_list()
    scored_stores = []
    
    for store in stores:
        dist = haversine_distance(lat, lng, store["lat"], store["lng"])
        store_copy = store.copy()
        store_copy["distance_km"] = dist
        scored_stores.append(store_copy)
        
    # Sort by distance (ascending)
    scored_stores.sort(key=lambda s: s["distance_km"])
    return scored_stores
