from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=100)
    senha: str = Field(min_length=8, max_length=128)
    is_admin: bool = False


class LoginRequest(BaseModel):
    email: str
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioPublic(BaseModel):
    """Dados públicos do usuário; nunca expõe senha ou senha_hash."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    email: str
    is_admin: bool
