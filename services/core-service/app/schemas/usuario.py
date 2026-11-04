from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator


class UsuarioCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)

    @field_validator("senha")
    @classmethod
    def validar_tamanho_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("A senha é muito longa.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    email: EmailStr
    is_admin: bool