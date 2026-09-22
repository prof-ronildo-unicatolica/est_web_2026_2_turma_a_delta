from datetime import timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.quarto import Quarto
from app.models.reserva import Reserva
from app.models.usuario import Usuario
from app.schemas.reserva import ReservaCreateSchema, ReservaResponseSchema

router = APIRouter(prefix="/reservas", tags=["Reservas"])


def _reserva_ou_404(
    reserva_id: UUID, db: Session, usuario_atual: Usuario
) -> Reserva:
    reserva = db.scalar(select(Reserva).where(Reserva.id == reserva_id))
    if reserva is None or (
        not usuario_atual.is_admin and reserva.usuario_id != usuario_atual.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada",
        )
    return reserva


@router.post(
    "",
    response_model=ReservaResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar_reserva(
    payload: ReservaCreateSchema,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Cria uma reserva para o usuário autenticado (via Bearer token)."""
    quarto = db.scalar(select(Quarto).where(Quarto.id == payload.quarto_id))
    if quarto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quarto não encontrado",
        )

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

    conflito = db.scalar(
        select(Reserva).where(
            Reserva.quarto_id == payload.quarto_id,
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

    diarias = (payload.data_checkout - payload.data_checkin).days
    valor_total = quarto.preco_diaria * diarias

    data_limite_cancelamento = None
    if payload.tarifa_tipo == "Reembolsavel":
        data_limite_cancelamento = payload.data_checkin - timedelta(days=2)

    reserva = Reserva(
        usuario_id=usuario_atual.id,
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
        data_limite_cancelamento=data_limite_cancelamento,
        valor_multa_cancelamento=0,
        valor_total=valor_total,
        status="Confirmada",
    )

    db.add(reserva)
    db.commit()
    db.refresh(reserva)

    return reserva


@router.get("", response_model=list[ReservaResponseSchema])
def listar_reservas(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Lista as reservas do usuário autenticado (ou todas, se admin)."""
    query = select(Reserva).order_by(Reserva.data_checkin.desc())
    if not usuario_atual.is_admin:
        query = query.where(Reserva.usuario_id == usuario_atual.id)
    return db.scalars(query).all()


@router.get("/{reserva_id}", response_model=ReservaResponseSchema)
def obter_reserva(
    reserva_id: UUID,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Retorna uma reserva específica, se pertencer ao usuário autenticado."""
    return _reserva_ou_404(reserva_id, db, usuario_atual)


@router.patch("/{reserva_id}/cancelar", response_model=ReservaResponseSchema)
def cancelar_reserva(
    reserva_id: UUID,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Cancela uma reserva do usuário autenticado."""
    reserva = _reserva_ou_404(reserva_id, db, usuario_atual)

    if reserva.status == "Cancelada":
        return reserva

    reserva.status = "Cancelada"
    db.commit()
    db.refresh(reserva)
    return reserva
