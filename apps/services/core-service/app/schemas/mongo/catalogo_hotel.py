# app/schemas/mongo/catalogo_hotel.py
"""
Schemas Pydantic para a coleção `catalogo_hoteis` (seção 4.1 do documento
de modelagem NoSQL). Representa a View Otimizada de busca, desnormalizada
a partir dos dados do PostgreSQL.

Importante: esta coleção representa o que existe, não o que está livre.
Disponibilidade por período é sempre resolvida no PostgreSQL (RFO04.1).
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# --- Sub-documentos embutidos ---

class Coordenadas(BaseModel):
    """Ponto GeoJSON, indexado como 2dsphere em cidade.coordenadas."""

    model_config = ConfigDict(populate_by_name=True)

    type: Literal["Point"] = "Point"
    coordinates: list[float] = Field(
        ..., min_length=2, max_length=2, description="[longitude, latitude]"
    )


class CidadeEmbed(BaseModel):
    """Recorte desnormalizado da cidade dentro do documento do hotel."""

    cidade_id: str
    nome: str
    estado: str
    coordenadas: Coordenadas


class Quarto(BaseModel):
    """Item do array `quartos` — espelha a tabela de quartos do Postgres."""

    quarto_id: str
    numero: str
    tipo: str
    preco_diaria: float = Field(..., gt=0)
    max_adultos: int = Field(..., ge=1)
    max_criancas: int = Field(0, ge=0)


class AvaliacaoRecente(BaseModel):
    """Item do array `avaliacoes_recentes` — as N avaliações mais recentes."""

    usuario_nome: str
    nota: int = Field(..., ge=1, le=5)
    comentario: str
    data: datetime


# --- Documento principal ---

class CatalogoHotelBase(BaseModel):
    nome: str
    categoria_estrelas: int = Field(..., ge=1, le=5)
    cidade: CidadeEmbed
    comodidades: list[str] = Field(default_factory=list)
    quartos: list[Quarto] = Field(default_factory=list)
    media_avaliacao: float = Field(0.0, ge=0, le=5)
    avaliacoes_recentes: list[AvaliacaoRecente] = Field(default_factory=list)


class CatalogoHotelCreate(CatalogoHotelBase):
    """
    Usado pela SyncTask (services/catalogo_sync_service.py) ao reconstruir
    o documento do zero a partir do Postgres. O _id é o mesmo hotel_id
    (UUID) usado no lado relacional — não um ObjectId gerado pelo Mongo.
    """

    id: str = Field(..., alias="_id")

    model_config = ConfigDict(populate_by_name=True)


class CatalogoHotel(CatalogoHotelBase):
    """Representação de leitura — documento tal como vem do Mongo."""

    id: str = Field(..., alias="_id")

    model_config = ConfigDict(populate_by_name=True)


class CatalogoHotelUpdate(BaseModel):
    """
    Update parcial — usado pelos disparos granulares da tabela de
    Políticas de Disparo (seção 3 do doc): editar só `quartos`, só
    `comodidades`, ou só a média/avaliações recentes, sem reconstruir
    o documento inteiro.
    """

    nome: str | None = None
    categoria_estrelas: int | None = Field(None, ge=1, le=5)
    comodidades: list[str] | None = None
    quartos: list[Quarto] | None = None
    media_avaliacao: float | None = Field(None, ge=0, le=5)
    avaliacoes_recentes: list[AvaliacaoRecente] | None = None