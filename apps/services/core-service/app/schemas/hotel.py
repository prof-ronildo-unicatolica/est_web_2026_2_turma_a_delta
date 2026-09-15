import uuid

from pydantic import BaseModel, ConfigDict, Field


class CidadeCreateSchema(BaseModel):
    """Dados recebidos ao criar uma cidade."""

    nome: str = Field(min_length=1, max_length=100)


class CidadeResponseSchema(BaseModel):
    """Dados retornados pela API para uma cidade."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str