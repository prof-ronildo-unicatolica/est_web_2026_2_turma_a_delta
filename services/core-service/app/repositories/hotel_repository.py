from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.hotel import Hotel


class HotelRepository:
    """Centraliza consultas SQL de hotéis e carrega relações em lote."""

    def __init__(self, db: Session):
        self.db = db

    def listar(
        self, *, cidade_id: UUID | None = None,
        estrelas_min: int | None = None, busca: str | None = None,
    ) -> list[Hotel]:
        stmt = (
            select(Hotel)
            .options(
                joinedload(Hotel.cidade),
                joinedload(Hotel.comodidades),
            )
            .order_by(Hotel.nome)
        )
        if cidade_id is not None:
            stmt = stmt.where(Hotel.cidade_id == cidade_id)
        if estrelas_min is not None:
            stmt = stmt.where(Hotel.categoria_estrelas >= estrelas_min)
        if busca and busca.strip():
            stmt = stmt.where(Hotel.nome.ilike(f"%{busca.strip()}%"))
        return list(self.db.scalars(stmt).unique().all())

    def obter(self, hotel_id: UUID) -> Hotel | None:
        stmt = (
            select(Hotel)
            .options(
                joinedload(Hotel.cidade),
                joinedload(Hotel.comodidades),
            )
            .where(Hotel.id == hotel_id)
        )
        return self.db.scalars(stmt).unique().one_or_none()
