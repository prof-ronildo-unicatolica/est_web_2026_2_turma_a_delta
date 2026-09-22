from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import LoginRequest, Token, UsuarioCreate, UsuarioPublic


router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=UsuarioPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: UsuarioCreate, db: Session = Depends(get_db)):
    """Cadastra um usuário armazenando somente o hash da senha."""
    email = payload.email.strip().lower()

    existente = db.scalar(select(Usuario).where(Usuario.email == email))
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    usuario = Usuario(
        nome=payload.nome.strip(),
        email=email,
        senha_hash=hash_password(payload.senha),
        is_admin=False,
    )

    db.add(usuario)
    try:
        db.commit()
        db.refresh(usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    return usuario


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Autentica o usuário e devolve um JWT Bearer."""
    email = payload.email.strip().lower()
    usuario = db.scalar(select(Usuario).where(Usuario.email == email))

    if usuario is None or not verify_password(payload.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=create_access_token(str(usuario.id)))


@router.get("/me", response_model=UsuarioPublic)
def get_me(usuario_atual: Usuario = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado."""
    return usuario_atual


@router.get("/admin/verificacao")
def somente_admin(admin: Usuario = Depends(get_current_admin)):
    """Rota protegida para comprovar o RBAC de administrador."""
    return {
        "mensagem": f"Acesso administrativo concedido para {admin.nome}",
        "usuario_id": str(admin.id),
    }
