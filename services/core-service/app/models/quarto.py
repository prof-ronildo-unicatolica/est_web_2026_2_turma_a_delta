from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Quarto(Base):
    __tablename__ = "quartos"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    hotel_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("hoteis.id", ondelete="CASCADE"),
        nullable=False,
    )

    numero: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    preco_diaria: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    max_adultos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    max_criancas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    __table_args__ = (
        CheckConstraint(
            "preco_diaria >= 0",
            name="ck_quartos_preco_diaria",
        ),
        CheckConstraint(
            "max_adultos >= 1",
            name="ck_quartos_max_adultos",
        ),
        CheckConstraint(
            "max_criancas >= 0",
            name="ck_quartos_max_criancas",
        ),
        UniqueConstraint(
            "hotel_id",
            "numero",
            name="uq_quartos_hotel_numero",
        ),
    )

    hotel: Mapped["Hotel"] = relationship(
        "Hotel",
        back_populates="quartos",
    )

    reservas: Mapped[list["Reserva"]] = relationship(
        "Reserva",
        back_populates="quarto",
    )