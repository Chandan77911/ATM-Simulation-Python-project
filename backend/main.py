from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Allow React to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Database ---
bank_database = {
    "4532000011112222": {
        "pin": "1234",
        "name": "warren buffet",
        "is_blocked": False,
        "attempts": 0,
        "accounts": {
            "Checking": 1500.0,
            "Savings": 8500.0
        }
    }
}

# --- Pydantic Models for API Requests ---
class LoginRequest(BaseModel):
    card_number: str
    pin: str

class TransactionRequest(BaseModel):
    card_number: str
    account_type: str
    amount: float

# --- API Endpoints ---

@app.post("/api/auth")
def authenticate(req: LoginRequest):
    user = bank_database.get(req.card_number)
    
    if not user:
        raise HTTPException(status_code=404, detail="Card not recognized.")
    if user["is_blocked"]:
        raise HTTPException(status_code=403, detail="Card is blocked.")
        
    if user["pin"] == req.pin:
        user["attempts"] = 0 # Reset attempts on success
        return {"message": "Success", "name": user["name"], "accounts": user["accounts"]}
    else:
        user["attempts"] += 1
        if user["attempts"] >= 3:
            user["is_blocked"] = True
            raise HTTPException(status_code=403, detail="Too many attempts. Card blocked.")
        raise HTTPException(status_code=401, detail="Incorrect PIN.")

@app.post("/api/withdraw")
def withdraw(req: TransactionRequest):
    user = bank_database.get(req.card_number)
    if not user or user["is_blocked"]:
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    balance = user["accounts"].get(req.account_type)
    if balance is None:
        raise HTTPException(status_code=404, detail="Account not found.")
        
    if req.amount > balance:
        raise HTTPException(status_code=400, detail="Insufficient funds.")
        
    # Process withdrawal
    user["accounts"][req.account_type] -= req.amount
    return {"message": "Success", "new_balance": user["accounts"][req.account_type]}

@app.post("/api/deposit")
def deposit(req: TransactionRequest):
    user = bank_database.get(req.card_number)
    if not user or user["is_blocked"]:
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    if req.account_type not in user["accounts"]:
        raise HTTPException(status_code=404, detail="Account not found.")
        
    user["accounts"][req.account_type] += req.amount
    return {"message": "Success", "new_balance": user["accounts"][req.account_type]}