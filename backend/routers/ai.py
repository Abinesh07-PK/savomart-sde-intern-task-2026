import os
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models
import schemas
from utils.auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Agent"])

# Fallback AI Agent Logic (Mock Claude support script)
def get_mock_ai_response(messages: List[schemas.ChatMessage]) -> str:
    """
    Intelligent conversational script for mock support agent.
    Gathers Name, Contact, Category, and Description sequentially.
    """
    user_messages = [m.content for m in messages if m.role == "user"]
    assistant_messages = [m.content for m in messages if m.role == "assistant"]
    
    # State tracking based on message counts
    msg_count = len(user_messages)
    
    if msg_count == 0:
         return "Hi there! I'm the Savomart Customer Assistant. 👋 How can I help you today?"
         
    # Analyze conversation flow and extract missing fields
    last_user_message = user_messages[-1].lower()
    
    # Simple keyword checking to infer if user wants to log support
    keywords = ["help", "support", "ticket", "issue", "problem", "broken", "points", "refund", "store", "order", "login", "hi", "hello"]
    
    # Let's count how many questions have been asked
    name_provided = any("name" in text for text in assistant_messages)
    contact_provided = any("contact" in text or "phone" in text or "email" in text for text in assistant_messages)
    category_provided = any("category" in text or "category" in text for text in assistant_messages)
    desc_provided = any("description" in text or "describe" in text or "detail" in text for text in assistant_messages)
    
    # We will guide them sequentially
    if not name_provided:
        return "I'd be glad to help you resolve your issue. First, could you tell me your full name?"
    
    if not contact_provided:
        return "Thank you! What is a good contact number or email address to reach you at?"
        
    if not category_provided:
        return "Got it! Which category best describes your issue? (Choose from: order, points, refund, store, or other)"
        
    if not desc_provided:
        return "Understood. Please provide a brief description of the issue you are experiencing."
        
    # Summarize and log
    # Find names and details from conversation
    name = "Customer"
    contact = "Not Provided"
    category = "other"
    desc = "Support request"
    
    # Try to heuristically pull from messages
    try:
        # User message 1: name
        if len(user_messages) >= 2:
            name = user_messages[1]
        if len(user_messages) >= 3:
            contact = user_messages[2]
        if len(user_messages) >= 4:
            category = user_messages[3]
        if len(user_messages) >= 5:
            desc = user_messages[4]
    except Exception:
        pass
        
    return f"Excellent. I have gathered all the details: \nName: {name}\nContact: {contact}\nCategory: {category}\nDescription: {desc}.\nYour request has been logged. We'll follow up shortly!"

@router.post("/chat", response_model=schemas.AIChatResponse)
async def chat_with_agent(
    payload: schemas.AIChatRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Secure backend proxy for Anthropic Claude Sonnet API.
    Guards API Keys server-side and falls back to a smart mock conversational assistant if key is missing.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # If key is missing or dummy
    if not api_key or api_key == "your-anthropic-key-here":
        reply = get_mock_ai_response(payload.messages)
        return {"reply": reply}
        
    # Call Anthropic API
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    system_prompt = (
        "You are a helpful Savomart customer support agent. Your job is to help customers "
        "resolve their issues. Gather these details through natural conversation:\n"
        "1. Customer's name\n"
        "2. Contact number or email\n"
        "3. Issue category (order issue, points problem, refund request, store complaint, other)\n"
        "4. Detailed description of the issue\n\n"
        "Be friendly, concise, and empathetic. Once you have all 4 pieces of information, "
        "summarize what you've collected and tell the customer their request has been logged.\n"
        "Respond in 1-3 short sentences per message. Do not ask for all info at once."
    )
    
    # Format messages array from request
    formatted_messages = []
    for msg in payload.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })
        
    body = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 300,
        "system": system_prompt,
        "messages": formatted_messages
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=body)
            
            if response.status_code == 200:
                result = response.json()
                reply_text = result["content"][0]["text"]
                return {"reply": reply_text}
            else:
                print(f"Anthropic API returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Exception calling Anthropic API: {e}")
        
    # Fallback to local mock conversational system if real call failed
    reply = get_mock_ai_response(payload.messages)
    return {"reply": reply}
