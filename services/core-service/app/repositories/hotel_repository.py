from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.hotel import Hotel
from app.models.hotel_comodidade import HotelComodidade
from app.models.quarto import Quarto


class HotelRepository:
    """Persistência e consultas de hotéis; não conhece HTTP nem schemas."""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _consulta_com_relacionamentos():
        return select(Hotel).options(
            joinedload(Hotel.cidade),
            joinedload(Hotel.comodidades).joinedload(HotelComodidade.comodidade),
        )

    def create(
        self,
        nome: str,
        cidade_id: UUID,
        categoria_estrelas: int,
        localizacao: dict | None = None,
        comodidade_ids: list[UUID] | None = None,
    ) -> Hotel:
        hotel = Hotel(
            nome=nome,
            cidade_id=cidade_id,
            categoria_estrelas=categoria_estrelas,
            localizacao=localizacao,
        )
        self.db.add(hotel)
        self.db.flush()

        for comodidade_id in comodidade_ids or []:
            self.db.add(HotelComodidade(
                hotel_id=hotel.id,
                comodidade_id=comodidade_id,
            ))

        self.db.commit()
        return self.get_by_id(hotel.id)

    def update(
        self,
        hotel: Hotel,
        *,
        nome: str,
        cidade_id: UUID,
        categoria_estrelas: int,
        localizacao: dict | None,
        comodidade_ids: list[UUID] | None = None,
    ) -> Hotel:
        hotel.nome = nome
        hotel.cidade_id = cidade_id
        hotel.categoria_estrelas = categoria_estrelas
        hotel.localizacao = localizacao

        self.db.query(HotelComodidade).filter(
            HotelComodidade.hotel_id == hotel.id
        ).delete(synchronize_session=False)
        for comodidade_id in comodidade_ids or []:
            self.db.add(HotelComodidade(
                hotel_id=hotel.id,
                comodidade_id=comodidade_id,
            ))

        self.db.commit()
        self.db.expire(hotel, ["cidade", "comodidades"])
        return self.get_by_id(hotel.id)

    def delete(self, hotel: Hotel) -> bool:
        possui_quartos = self.db.scalar(
            select(Quarto.id)
            .where(Quarto.hotel_id == hotel.id)
            .limit(1)
        )
        if possui_quartos:
            return False
        self.db.delete(hotel)
        self.db.commit()
        return True

    def list(self) -> list[Hotel]:
        stmt = self._consulta_com_relacionamentos().order_by(Hotel.nome)
        return list(self.db.scalars(stmt).unique().all())

    def list_by_cidade(self, cidade_id: UUID) -> list[Hotel]:
        stmt = (
            self._consulta_com_relacionamentos()
            .where(Hotel.cidade_id == cidade_id)
            .order_by(Hotel.nome)
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_by_id(self, hotel_id: UUID) -> Hotel | None:
        stmt = self._consulta_com_relacionamentos().where(Hotel.id == hotel_id)
        return self.db.scalars(stmt).unique().one_or_none()

    def listar(
        self,
        *,
        cidade_id: UUID | None = None,
        estrelas_min: int | None = None,
        busca: str | None = None,
    ) -> list[Hotel]:
        stmt = self._consulta_com_relacionamentos().order_by(Hotel.nome)
        if cidade_id is not None:
            stmt = stmt.where(Hotel.cidade_id == cidade_id)
        if estrelas_min is not None:
            stmt = stmt.where(Hotel.categoria_estrelas >= estrelas_min)
        if busca and busca.strip():
            stmt = stmt.where(Hotel.nome.ilike(f"%{busca.strip()}%"))
        return list(self.db.scalars(stmt).unique().all())

    def obter(self, hotel_id: UUID) -> Hotel | None:
        return self.get_by_id(hotel_id)
