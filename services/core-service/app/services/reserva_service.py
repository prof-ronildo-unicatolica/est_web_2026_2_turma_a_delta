"""Regras de negócio e persistência do ciclo de reservas.

As funções mantêm os mesmos códigos HTTP e mensagens usados pela API.
A publicação no RabbitMQ ocorre somente depois do commit, preservando
ordem e conteúdo dos eventos já consumidos pelos workers.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.rabbitmq import QUEUE_AUDITORIA, QUEUE_SOLICITACOES_RESERVA, publish_event
from app.models.quarto import Quarto
from app.models.reserva import Reserva
from app.models.usuario import Usuario
from app.schemas.reserva import ReservaCreateSchema


def obter_reserva_ou_404(reserva_id: UUID, db: Session, usuario_atual: Usuario) -> Reserva:
    reserva = db.scalar(select(Reserva).where(Reserva.id == reserva_id))
    if reserva is None or (not usuario_atual.is_admin and reserva.usuario_id != usuario_atual.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva não encontrada")
    return reserva


def obter_quarto_ou_404(quarto_id: UUID, db: Session) -> Quarto:
    quarto = db.scalar(select(Quarto).where(Quarto.id == quarto_id))
    if quarto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quarto não encontrado")
    return quarto


def validar_capacidade(quarto: Quarto, payload: ReservaCreateSchema) -> None:
    if payload.quantidade_adultos > quarto.max_adultos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Este quarto acomoda no máximo {quarto.max_adultos} adulto(s).",
        )
    if payload.quantidade_criancas > quarto.max_criancas:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Este quarto acomoda no máximo {quarto.max_criancas} criança(s).",
        )


def validar_disponibilidade(quarto_id: UUID, payload: ReservaCreateSchema, db: Session) -> None:
    conflito = db.scalar(
        select(Reserva).where(
            Reserva.quarto_id == quarto_id,
            Reserva.status != "Cancelada",
            Reserva.data_checkin < payload.data_checkout,
            Reserva.data_checkout > payload.data_checkin,
        )
    )
    if conflito is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Quarto indisponível para o período selecionado.",
        )


def calcular_dados_financeiros(payload: ReservaCreateSchema, preco_diaria):
    diarias = (payload.data_checkout - payload.data_checkin).days
    valor_total = preco_diaria * diarias
    limite_cancelamento = None
    if payload.tarifa_tipo == "Reembolsavel":
        limite_cancelamento = payload.data_checkin - timedelta(days=2)
    return valor_total, limite_cancelamento


def construir_reserva(payload: ReservaCreateSchema, usuario: Usuario, quarto: Quarto) -> Reserva:
    valor_total, limite_cancelamento = calcular_dados_financeiros(payload, quarto.preco_diaria)
    return Reserva(
        usuario_id=usuario.id,
        quarto_id=payload.quarto_id,
        data_checkin=payload.data_checkin,
        data_checkout=payload.data_checkout,
        quantidade_adultos=payload.quantidade_adultos,
        quantidade_criancas=payload.quantidade_criancas,
        quantidade_bebes=payload.quantidade_bebes,
        early_checkin=payload.early_checkin,
        late_checkout=payload.late_checkout,
        necessita_berco=payload.necessita_berco,
        tarifa_tipo=payload.tarifa_tipo,
        data_limite_cancelamento=limite_cancelamento,
        valor_multa_cancelamento=0,
        valor_total=valor_total,
        status="Pendente",
    )


async def publicar_eventos_reserva(reserva: Reserva) -> None:
    evento = {
        "evento": "RESERVA_SOLICITADA",
        "reserva_id": str(reserva.id),
        "usuario_id": str(reserva.usuario_id),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "detalhes": {"valor_total": str(reserva.valor_total)},
    }
    await publish_event(QUEUE_AUDITORIA, evento)
    await publish_event(QUEUE_AUDITORIA, {**evento, "evento": "RESERVA_EM_FILA"})
    await publish_event(QUEUE_SOLICITACOES_RESERVA, {"reserva_id": str(reserva.id)})


async def criar_reserva(payload: ReservaCreateSchema, db: Session, usuario: Usuario) -> Reserva:
    quarto = obter_quarto_ou_404(payload.quarto_id, db)
    validar_capacidade(quarto, payload)
    validar_disponibilidade(payload.quarto_id, payload, db)
    reserva = construir_reserva(payload, usuario, quarto)
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    await publicar_eventos_reserva(reserva)
    return reserva


def listar_reservas(db: Session, usuario: Usuario) -> list[Reserva]:
    consulta = select(Reserva).order_by(Reserva.data_checkin.desc())
    if not usuario.is_admin:
        consulta = consulta.where(Reserva.usuario_id == usuario.id)
    return db.scalars(consulta).all()


def obter_reserva(reserva_id: UUID, db: Session, usuario: Usuario) -> Reserva:
    return obter_reserva_ou_404(reserva_id, db, usuario)


def cancelar_reserva(reserva_id: UUID, db: Session, usuario: Usuario) -> Reserva:
    reserva = obter_reserva_ou_404(reserva_id, db, usuario)
    if reserva.status == "Cancelada":
        return reserva
    reserva.status = "Cancelada"
    db.commit()
    db.refresh(reserva)
    return reserva
