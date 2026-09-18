from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Python Global Bank ATM API",
    description="Backend API for the ATM Simulation",
    version="1.0.0"
)


# ============================================================
# CORS Configuration
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://atm-simulation-01.chandansahu12398.workers.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Mock Database
# ============================================================

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


# ============================================================
# Pydantic Request Models
# ============================================================

class LoginRequest(BaseModel):
    card_number: str
    pin: str


class TransactionRequest(BaseModel):
    card_number: str
    account_type: str
    amount: float


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Python Global Bank ATM API is running"
    }


# ============================================================
# Authentication
# ============================================================

@app.post("/api/auth")
def authenticate(req: LoginRequest):

    user = bank_database.get(req.card_number)

    # Card does not exist
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Card not recognized."
        )

    # Card already blocked
    if user["is_blocked"]:
        raise HTTPException(
            status_code=403,
            detail="Card is blocked."
        )

    # Correct PIN
    if user["pin"] == req.pin:

        # Reset failed attempts after successful login
        user["attempts"] = 0

        return {
            "message": "Success",
            "name": user["name"],
            "accounts": user["accounts"]
        }

    # Incorrect PIN
    user["attempts"] += 1

    # Block after 3 failed attempts
    if user["attempts"] >= 3:

        user["is_blocked"] = True

        raise HTTPException(
            status_code=403,
            detail="Too many attempts. Card blocked."
        )

    remaining_attempts = 3 - user["attempts"]

    raise HTTPException(
        status_code=401,
        detail=f"Incorrect PIN. {remaining_attempts} attempt(s) remaining."
    )


# ============================================================
# Withdraw
# ============================================================

@app.post("/api/withdraw")
def withdraw(req: TransactionRequest):

    user = bank_database.get(req.card_number)

    # Verify card
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Card not recognized."
        )

    # Verify card status
    if user["is_blocked"]:
        raise HTTPException(
            status_code=403,
            detail="Card is blocked."
        )

    # Validate amount
    if req.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero."
        )

    # Find account
    balance = user["accounts"].get(req.account_type)

    if balance is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found."
        )

    # Check sufficient balance
    if req.amount > balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds."
        )

    # Perform withdrawal
    user["accounts"][req.account_type] -= req.amount

    new_balance = user["accounts"][req.account_type]

    return {
        "message": "Withdrawal successful",
        "new_balance": new_balance
    }


# ============================================================
# Deposit
# ============================================================

@app.post("/api/deposit")
def deposit(req: TransactionRequest):

    user = bank_database.get(req.card_number)

    # Verify card
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Card not recognized."
        )

    # Verify card status
    if user["is_blocked"]:
        raise HTTPException(
            status_code=403,
            detail="Card is blocked."
        )

    # Validate amount
    if req.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero."
        )

    # Verify account
    if req.account_type not in user["accounts"]:
        raise HTTPException(
            status_code=404,
            detail="Account not found."
        )

    # Perform deposit
    user["accounts"][req.account_type] += req.amount

    new_balance = user["accounts"][req.account_type]

    return {
        "message": "Deposit successful",
        "new_balance": new_balance
    }