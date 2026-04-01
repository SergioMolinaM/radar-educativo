"""Authentication router - JWT-based auth for SLEP users."""
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-please")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8

# Demo users - TODO: Replace with DB-backed user store + bcrypt
DEMO_USERS = {
    "admin@slep-barrancas.cl": {
        "password": "demo2026",
        "name": "Administrador Barrancas",
        "role": "admin_slep",
        "slep_id": "barrancas",
    },
    "analista@slep-barrancas.cl": {
        "password": "demo2026",
        "name": "Analista Barrancas",
        "role": "analista",
        "slep_id": "barrancas",
    },
    "admin@slep-puertocordillera.cl": {
        "password": "demo2026",
        "name": "Administrador Puerto Cordillera",
        "role": "admin_slep",
        "slep_id": "puerto_cordillera",
    },
    "admin@slep-losparques.cl": {
        "password": "demo2026",
        "name": "Administrador Los Parques",
        "role": "admin_slep",
        "slep_id": "los_parques",
    },
    "admin@slep-santarosa.cl": {
        "password": "demo2026",
        "name": "Administrador Santa Rosa",
        "role": "admin_slep",
        "slep_id": "santa_rosa",
    },
    "admin@slep-colchagua.cl": {
        "password": "demo2026",
        "name": "Administrador Colchagua",
        "role": "admin_slep",
        "slep_id": "colchagua",
    },
    "admin@slep-delpino.cl": {
        "password": "demo2026",
        "name": "Administrador Del Pino",
        "role": "admin_slep",
        "slep_id": "del_pino",
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


def _create_token(data: dict) -> str:
    """Create a JWT token. Uses python-jose if available, falls back to simple encoding."""
    now = datetime.now(timezone.utc)
    payload = {
        **data,
        "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": now,
    }
    try:
        from jose import jwt
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except ImportError:
        # Fallback: base64 encoding (not cryptographically secure, OK for dev)
        import base64
        import json
        return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()


def _decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ImportError:
        # Fallback: base64 decoding
        import base64
        import json
        try:
            payload = json.loads(base64.urlsafe_b64decode(token + "=="))
            exp = datetime.fromisoformat(payload.get("exp", "2000-01-01"))
            if exp < datetime.now(timezone.utc):
                raise ValueError("Token expirado")
            return payload
        except Exception:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Validate token and return current user."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

    payload = _decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = DEMO_USERS.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return {
        "email": email,
        "name": user["name"],
        "role": user["role"],
        "slep_id": user["slep_id"],
    }


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    token = _create_token({"sub": form_data.username, "role": user["role"], "slep_id": user["slep_id"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"email": form_data.username, "name": user["name"], "role": user["role"], "slep_id": user["slep_id"]},
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)
