from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UsuarioRegister(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioPublic(BaseModel):
    id: UUID
    email: EmailStr
    nome: str
    is_admin: bool

    model_config = {
        "from_attributes": True
    }