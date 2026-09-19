from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = UsuarioRepository(db)

    def register(
        self,
        nome: str,
        email: str,
        senha: str,
    ) -> Usuario:

        email = email.lower().strip()

        usuario_existente = (
            self.repository.get_by_email(email)
        )

        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado",
            )

        usuario = Usuario(
            nome=nome.strip(),
            email=email,
            senha_hash=hash_password(senha),
            is_admin=False,
        )

        self.repository.create(usuario)

        self.db.commit()
        self.db.refresh(usuario)

        return usuario

    def login(
        self,
        email: str,
        senha: str,
    ) -> str:

        email = email.lower().strip()

        usuario = self.repository.get_by_email(email)

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos",
                headers={
                    "WWW-Authenticate": "Bearer"
                },
            )

        if not verify_password(
            senha,
            usuario.senha_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos",
                headers={
                    "WWW-Authenticate": "Bearer"
                },
            )

        return create_access_token(
            str(usuario.id)
        )