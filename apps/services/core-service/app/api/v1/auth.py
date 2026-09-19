from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_admin,
    get_current_user,
)
from app.core.database import get_db
from app.schemas.usuario import (
    LoginRequest,
    Token,
    UsuarioPublic,
    UsuarioRegister,
)
from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)


@router.post(
    "/register",
    response_model=UsuarioPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UsuarioRegister,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.register(
        nome=payload.nome,
        email=payload.email,
        senha=payload.senha,
    )


@router.post(
    "/login",
    response_model=Token,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    token = service.login(
        email=payload.email,
        senha=payload.senha,
    )

    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=UsuarioPublic,
)
def get_me(
    usuario_atual=Depends(get_current_user),
):
    return usuario_atual


@router.get("/admin/verificacao")
def somente_admin(
    admin=Depends(get_current_admin),
):
    return {
        "mensagem": (
            "Acesso administrativo concedido "
            f"para {admin.nome}"
        )
    }