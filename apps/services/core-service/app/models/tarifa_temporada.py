from __future__ import annotations

from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TarifaTemporada(Base):
    __tablename__ = "tarifas_temporada"

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

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    data_inicio: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    data_fim: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    multiplicador: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "data_fim >= data_inicio",
            name="ck_tarifas_data",
        ),
        CheckConstraint(
            "multiplicador > 0",
            name="ck_tarifas_multiplicador",
        ),
    )

    hotel: Mapped["Hotel"] = relationship(
        "Hotel",
        back_populates="tarifas_temporada",
    )