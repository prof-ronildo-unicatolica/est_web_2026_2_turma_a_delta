from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ReservaServico(Base):
    __tablename__ = "reserva_servicos"

    reserva_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("reservas.id", ondelete="CASCADE"),
        primary_key=True,
    )

    servico_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("servicos_adicionais.id", ondelete="CASCADE"),
        primary_key=True,
    )

    quantidade: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default=text("1"),
    )

    preco_cobrado: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "quantidade >= 1",
            name="ck_reserva_servicos_quantidade",
        ),
    )

    reserva: Mapped["Reserva"] = relationship(
        "Reserva",
        back_populates="servicos",
    )

    servico: Mapped["ServicoAdicional"] = relationship(
        "ServicoAdicional",
        back_populates="reservas",
    )