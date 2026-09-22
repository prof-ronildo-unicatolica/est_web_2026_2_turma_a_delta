from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Gera um hash bcrypt para armazenamento seguro da senha."""
    if not password:
        raise ValueError("A senha não pode ser vazia.")
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verifica uma senha em texto contra seu hash bcrypt."""
    if not password or not password_hash:
        return False
    try:
        return pwd_context.verify(password, password_hash)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: str) -> str:
    """Cria um JWT assinado contendo o ID do usuário no claim `sub`."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict:
    """Valida e decodifica um JWT."""
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


# Compatibilidade com código que utilizava o nome anterior.
decode_access_token = decode_token
