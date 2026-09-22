import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CidadeCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    estado: str = Field(min_length=2, max_length=2)
    limite_territorial: dict = Field(default_factory=dict)


class CidadeResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    estado: str
    limite_territorial: dict


class ComodidadeCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=100)


class ComodidadeResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str


class HotelCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    cidade_id: uuid.UUID
    categoria_estrelas: int = Field(default=3, ge=1, le=5)
    localizacao: dict | None = None


class HotelResponseSchema(BaseModel):
    id: uuid.UUID
    nome: str
    cidade_id: uuid.UUID
    cidade: str
    categoria_estrelas: int
    localizacao: dict | None
    comodidades: list[uuid.UUID]


class QuartoCreateSchema(BaseModel):
    hotel_id: uuid.UUID
    numero: str = Field(min_length=1, max_length=10)
    tipo: str = Field(min_length=1, max_length=50)
    preco_diaria: Decimal = Field(ge=0)
    max_adultos: int = Field(ge=1)
    max_criancas: int = Field(default=0, ge=0)


class QuartoResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hotel_id: uuid.UUID
    numero: str
    tipo: str
    preco_diaria: Decimal
    max_adultos: int
    max_criancas: int
