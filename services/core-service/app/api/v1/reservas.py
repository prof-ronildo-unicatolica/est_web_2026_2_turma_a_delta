from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.reserva import ReservaCreateSchema, ReservaResponseSchema
from app.services import reserva_service

router = APIRouter(prefix="/reservas", tags=["Reservas"])


@router.post("", response_model=ReservaResponseSchema, status_code=status.HTTP_201_CREATED)
async def criar_reserva(
    payload: ReservaCreateSchema,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Cria uma reserva para o usuário autenticado (via Bearer token)."""
    return await reserva_service.criar_reserva(payload, db, usuario_atual)


@router.get("", response_model=list[ReservaResponseSchema])
def listar_reservas(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Lista as reservas do usuário autenticado (ou todas, se admin)."""
    return reserva_service.listar_reservas(db, usuario_atual)


@router.get("/{reserva_id}", response_model=ReservaResponseSchema)
def obter_reserva(
    reserva_id: UUID,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Retorna uma reserva específica, se pertencer ao usuário autenticado."""
    return reserva_service.obter_reserva(reserva_id, db, usuario_atual)


@router.patch("/{reserva_id}/cancelar", response_model=ReservaResponseSchema)
def cancelar_reserva(
    reserva_id: UUID,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
):
    """Cancela uma reserva do usuário autenticado."""
    return reserva_service.cancelar_reserva(reserva_id, db, usuario_atual)
