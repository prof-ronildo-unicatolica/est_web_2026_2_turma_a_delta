# app/schemas/mongo/evento_auditoria.py
"""
Schemas Pydantic para a coleção `historico_auditoria` (seção 4.2 do
documento de modelagem NoSQL). Coleção write-heavy, imutável, que
rastreia o ciclo de vida assíncrono das reservas.

Os quatro eventos abaixo são exatamente os definidos no RFO11 e no
diagrama de sequência do documento — não introduza variações de nome.

`detalhes` é um discriminated union pelo campo `evento`: cada tipo de
evento só aceita o payload de detalhes correspondente, validado em
tempo de criação do documento.
"""

from datetime import datetime
from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.mongo.py_object_id import PyObjectId


class TipoEvento(str, Enum):
    RESERVA_SOLICITADA = "RESERVA_SOLICITADA"
    RESERVA_EM_FILA = "RESERVA_EM_FILA"
    PAGAMENTO_APROVADO = "PAGAMENTO_APROVADO"
    RESERVA_CANCELADA = "RESERVA_CANCELADA"


# --- Payloads de `detalhes`, um por tipo de evento ---

class DetalhesReservaSolicitada(BaseModel):
    quarto_id: str
    data_checkin: str
    data_checkout: str
    valor_total_estimado: float = Field(..., gt=0)
    dispositivo: str


class DetalhesReservaEmFila(BaseModel):
    fila: str = "RabbitMQ"
    posicao: int | None = None


class DetalhesPagamentoAprovado(BaseModel):
    adquirente: str
    codigo_autorizacao: str
    tentativas: int = Field(..., ge=1)
    tempo_resposta_ms: int = Field(..., ge=0)


class PeriodoConflituoso(BaseModel):
    inicio: str
    fim: str


class DetalhesReservaCancelada(BaseModel):
    motivo: str
    quarto_id: str
    periodo_conflituoso: PeriodoConflituoso | None = None


# --- Campos comuns a todo evento (sem `evento`/`detalhes`, que cada
# subclasse abaixo fixa com seu próprio Literal + payload) ---

class _EventoAuditoriaCamposComuns(BaseModel):
    reserva_id: str
    usuario_id: str
    timestamp: datetime


# --- Uma classe "Create" por tipo de evento, com `evento` como Literal
# (discriminador) e `detalhes` já tipado com o payload correto ---

class ReservaSolicitadaCreate(_EventoAuditoriaCamposComuns):
    evento: Literal[TipoEvento.RESERVA_SOLICITADA] = TipoEvento.RESERVA_SOLICITADA
    detalhes: DetalhesReservaSolicitada


class ReservaEmFilaCreate(_EventoAuditoriaCamposComuns):
    evento: Literal[TipoEvento.RESERVA_EM_FILA] = TipoEvento.RESERVA_EM_FILA
    detalhes: DetalhesReservaEmFila


class PagamentoAprovadoCreate(_EventoAuditoriaCamposComuns):
    evento: Literal[TipoEvento.PAGAMENTO_APROVADO] = TipoEvento.PAGAMENTO_APROVADO
    detalhes: DetalhesPagamentoAprovado


class ReservaCanceladaCreate(_EventoAuditoriaCamposComuns):
    evento: Literal[TipoEvento.RESERVA_CANCELADA] = TipoEvento.RESERVA_CANCELADA
    detalhes: DetalhesReservaCancelada


# --- Union discriminado: usado como tipo de entrada em qualquer função
# que grave um evento (ex: auditoria_repository.insert_evento) ---

EventoAuditoriaCreate = Annotated[
    Union[
        ReservaSolicitadaCreate,
        ReservaEmFilaCreate,
        PagamentoAprovadoCreate,
        ReservaCanceladaCreate,
    ],
    Field(discriminator="evento"),
]


# --- Representação de leitura (documento como vem do Mongo, já com _id) ---
# Mantém o mesmo discriminated union, só acrescentando o `id`.

class ReservaSolicitada(ReservaSolicitadaCreate):
    id: PyObjectId = Field(..., alias="_id")
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ReservaEmFila(ReservaEmFilaCreate):
    id: PyObjectId = Field(..., alias="_id")
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class PagamentoAprovado(PagamentoAprovadoCreate):
    id: PyObjectId = Field(..., alias="_id")
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ReservaCancelada(ReservaCanceladaCreate):
    id: PyObjectId = Field(..., alias="_id")
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


EventoAuditoria = Annotated[
    Union[
        ReservaSolicitada,
        ReservaEmFila,
        PagamentoAprovado,
        ReservaCancelada,
    ],
    Field(discriminator="evento"),
]


# --- Helpers de construção — mantidos, agora retornando o tipo
# específico em vez de um EventoAuditoriaCreate genérico ---

def build_reserva_solicitada(
    reserva_id: str,
    usuario_id: str,
    timestamp: datetime,
    detalhes: DetalhesReservaSolicitada,
) -> ReservaSolicitadaCreate:
    return ReservaSolicitadaCreate(
        reserva_id=reserva_id,
        usuario_id=usuario_id,
        timestamp=timestamp,
        detalhes=detalhes,
    )


def build_reserva_em_fila(
    reserva_id: str,
    usuario_id: str,
    timestamp: datetime,
    detalhes: DetalhesReservaEmFila,
) -> ReservaEmFilaCreate:
    return ReservaEmFilaCreate(
        reserva_id=reserva_id,
        usuario_id=usuario_id,
        timestamp=timestamp,
        detalhes=detalhes,
    )


def build_pagamento_aprovado(
    reserva_id: str,
    usuario_id: str,
    timestamp: datetime,
    detalhes: DetalhesPagamentoAprovado,
) -> PagamentoAprovadoCreate:
    return PagamentoAprovadoCreate(
        reserva_id=reserva_id,
        usuario_id=usuario_id,
        timestamp=timestamp,
        detalhes=detalhes,
    )


def build_reserva_cancelada(
    reserva_id: str,
    usuario_id: str,
    timestamp: datetime,
    detalhes: DetalhesReservaCancelada,
) -> ReservaCanceladaCreate:
    return ReservaCanceladaCreate(
        reserva_id=reserva_id,
        usuario_id=usuario_id,
        timestamp=timestamp,
        detalhes=detalhes,
    )