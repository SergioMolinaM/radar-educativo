"""Authentication router - JWT-based auth for SLEP users."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# TODO: Replace with real DB-backed user store and bcrypt hashing
DEMO_USERS = {
    "admin@slep-barrancas.cl": {
        "password": "demo2026",
        "name": "Admin Barrancas",
        "role": "admin_slep",
        "slep_id": "barrancas",
    },
    "analista@slep-barrancas.cl": {
        "password": "demo2026",
        "name": "Analista Barrancas",
        "role": "analista",
        "slep_id": "barrancas",
    },
}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserOut(BaseModel):
    email: str
    name: str
    role: str
    slep_id: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a simple token. TODO: Replace with proper JWT (python-jose)."""
    import hashlib
    import json

    payload = {**data, "exp": (datetime.now(timezone.utc) + (expires_delta or timedelta(hours=8))).isoformat()}
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Validate token and return user. TODO: Implement proper JWT validation."""
    # For MVP, accept any non-empty token and return demo user
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")
    return {"email": "admin@slep-barrancas.cl", "name": "Admin Barrancas", "role": "admin_slep", "slep_id": "barrancas"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    token = create_access_token({"sub": form_data.username, "role": user["role"], "slep_id": user["slep_id"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"email": form_data.username, "name": user["name"], "role": user["role"], "slep_id": user["slep_id"]},
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)
