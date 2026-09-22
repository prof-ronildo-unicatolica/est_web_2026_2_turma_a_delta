from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class HotelComodidade(Base):
    __tablename__ = "hotel_comodidades"

    hotel_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("hoteis.id", ondelete="CASCADE"),
        primary_key=True,
    )

    comodidade_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("comodidades.id", ondelete="CASCADE"),
        primary_key=True,
    )

    hotel: Mapped["Hotel"] = relationship(
        "Hotel",
        back_populates="comodidades",
    )

    comodidade: Mapped["Comodidade"] = relationship(
        "Comodidade",
        back_populates="hoteis",
    )