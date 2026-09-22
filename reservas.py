from datetime import date
from decimal import Decimal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.rabbitmq import publish_event
from app.models.reserva import Reserva
from app.models.quarto import Quarto
from app.models.usuario import Usuario
from app.models.reserva_servico import ReservaServico
from app.models.servico_adicional import ServicoAdicional
from app.schemas.reserva import ReservaCreate, ReservaResponse, ReservaCancelamentoResponse
from app.services.reserva_service import calcular_preco, data_limite_cancelamento, calcular_multa_cancelamento

router = APIRouter(prefix="/reservas", tags=["Reservas"])


def _response(r: Reserva) -> ReservaResponse:
    return ReservaResponse.model_validate(r)

@router.post("", response_model=ReservaResponse, status_code=status.HTTP_202_ACCEPTED)
def criar_reserva(payload: ReservaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    quarto = db.scalar(select(Quarto).where(Quarto.id == payload.quarto_id))
    if quarto is None:
        raise HTTPException(404, "Quarto não encontrado")
    try:
        servicos = [(item.servico_id, item.quantidade) for item in payload.servicos]
        preco = calcular_preco(db, quarto, data_checkin=payload.data_checkin, data_checkout=payload.data_checkout,
                               quantidade_adultos=payload.quantidade_adultos, quantidade_criancas=payload.quantidade_criancas,
                               quantidade_bebes=payload.quantidade_bebes, early_checkin=payload.early_checkin,
                               late_checkout=payload.late_checkout, tarifa_tipo=payload.tarifa_tipo, servicos=servicos)
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    reserva = Reserva(usuario_id=usuario.id, quarto_id=quarto.id, data_checkin=payload.data_checkin,
                      data_checkout=payload.data_checkout, quantidade_adultos=payload.quantidade_adultos,
                      quantidade_criancas=payload.quantidade_criancas, quantidade_bebes=payload.quantidade_bebes,
                      early_checkin=payload.early_checkin, late_checkout=payload.late_checkout,
                      necessita_berco=payload.necessita_berco, tarifa_tipo=payload.tarifa_tipo,
                      data_limite_cancelamento=data_limite_cancelamento(payload.data_checkin),
                      valor_total=preco.total, status="Pendente")
    db.add(reserva)
    db.flush()
    for item in payload.servicos:
        servico = db.get(ServicoAdicional, item.servico_id)
        if servico is None:
            db.rollback(); raise HTTPException(422, f"Serviço {item.servico_id} não encontrado")
        db.add(ReservaServico(reserva_id=reserva.id, servico_id=item.servico_id,
                              quantidade=item.quantidade, preco_cobrado=servico.preco))
    db.commit(); db.refresh(reserva)
    try:
        import asyncio
        asyncio.run(publish_event("audit.logs", {
            "evento": "RESERVA_SOLICITADA",
            "reserva_id": str(reserva.id),
            "usuario_id": str(usuario.id),
            "detalhes": {"quarto_id": str(reserva.quarto_id), "data_checkin": str(reserva.data_checkin), "data_checkout": str(reserva.data_checkout), "valor_total_estimado": float(reserva.valor_total), "dispositivo": "web"}
        }))
        asyncio.run(publish_event("audit.logs", {
            "evento": "RESERVA_EM_FILA",
            "reserva_id": str(reserva.id),
            "usuario_id": str(usuario.id),
            "detalhes": {"fila": "RabbitMQ", "posicao": None}
        }))
        asyncio.run(publish_event("solicitacoes-reserva", {"reserva_id": str(reserva.id)}))
    except Exception as exc:
        reserva.status = "Cancelada"
        db.commit()
        raise HTTPException(503, f"Não foi possível enfileirar a reserva: {exc}")
    return reserva

@router.get("", response_model=list[ReservaResponse])
def minhas_reservas(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return db.scalars(select(Reserva).where(Reserva.usuario_id == usuario.id).order_by(Reserva.data_checkin.desc())).all()

@router.get("/{reserva_id}", response_model=ReservaResponse)
def obter_reserva(reserva_id: UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    reserva = db.scalar(select(Reserva).where(Reserva.id == reserva_id))
    if reserva is None: raise HTTPException(404, "Reserva não encontrada")
    if reserva.usuario_id != usuario.id and not usuario.is_admin: raise HTTPException(403, "Acesso negado")
    return reserva

@router.post("/{reserva_id}/cancelar", response_model=ReservaCancelamentoResponse)
def cancelar_reserva(reserva_id: UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    reserva = db.scalar(select(Reserva).options(joinedload(Reserva.quarto)).where(Reserva.id == reserva_id))
    if reserva is None: raise HTTPException(404, "Reserva não encontrada")
    if reserva.usuario_id != usuario.id and not usuario.is_admin: raise HTTPException(403, "Acesso negado")
    if reserva.status == "Cancelada": raise HTTPException(409, "Reserva já cancelada")
    if reserva.status == "Pendente": raise HTTPException(409, "Aguarde o processamento antes de cancelar")
    multa = calcular_multa_cancelamento(reserva)
    reserva.valor_multa_cancelamento = multa
    reserva.status = "Cancelada"
    db.commit(); db.refresh(reserva)
    try:
        import asyncio
        asyncio.run(publish_event("audit.logs", {"evento":"RESERVA_CANCELADA", "reserva_id":str(reserva.id), "usuario_id":str(usuario.id), "motivo":"cancelamento pelo hóspede", "multa":float(multa)}))
    except Exception:
        pass
    return {"reserva": reserva, "multa": multa, "reembolso_estimado": max(Decimal("0"), reserva.valor_total-multa),
            "mensagem": "Cancelamento realizado."}
