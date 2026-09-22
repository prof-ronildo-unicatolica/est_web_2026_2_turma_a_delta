from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario


bearer_scheme = HTTPBearer(
    description="Informe o JWT retornado por POST /api/v1/auth/login.",
    auto_error=True,
)


def _unauthorized(detail: str = "Token inválido ou expirado") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Valida o Bearer Token e busca o usuário no PostgreSQL."""
    token = credentials.credentials

    try:
        payload = decode_token(token)
        subject = payload.get("sub")
        if not subject:
            raise _unauthorized()
        user_id = UUID(subject)
    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise _unauthorized()

    usuario = db.scalar(select(Usuario).where(Usuario.id == user_id))

    if usuario is None:
        raise _unauthorized("Usuário do token não encontrado")

    return usuario


def get_current_admin(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """Exige que o usuário autenticado tenha is_admin=True."""
    if not usuario.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return usuario
