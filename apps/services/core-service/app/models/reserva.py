from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Reserva(Base):
    __tablename__ = "reservas"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    usuario_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
    )

    quarto_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("quartos.id", ondelete="CASCADE"),
        nullable=False,
    )

    data_checkin: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    data_checkout: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    quantidade_adultos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    quantidade_criancas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    quantidade_bebes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    early_checkin: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    late_checkout: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    necessita_berco: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    tarifa_tipo: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Reembolsavel",
        server_default=text("'Reembolsavel'"),
    )

    data_limite_cancelamento: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    valor_multa_cancelamento: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0"),
        server_default=text("0"),
    )

    valor_total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Pendente",
        server_default=text("'Pendente'"),
    )

    __table_args__ = (
        CheckConstraint(
            "data_checkout > data_checkin",
            name="ck_reservas_datas",
        ),
        CheckConstraint(
            "quantidade_adultos >= 1",
            name="ck_reservas_adultos",
        ),
        CheckConstraint(
            "quantidade_criancas >= 0",
            name="ck_reservas_criancas",
        ),
        CheckConstraint(
            "quantidade_bebes >= 0",
            name="ck_reservas_bebes",
        ),
        CheckConstraint(
            "tarifa_tipo IN ('Reembolsavel', 'Nao Reembolsavel')",
            name="ck_reservas_tarifa_tipo",
        ),
        CheckConstraint(
            "valor_multa_cancelamento >= 0",
            name="ck_reservas_valor_multa",
        ),
        CheckConstraint(
            "valor_total >= 0",
            name="ck_reservas_valor_total",
        ),
        CheckConstraint(
            "status IN ('Pendente', 'Confirmada', 'Cancelada')",
            name="ck_reservas_status",
        ),
    )

    usuario: Mapped["Usuario"] = relationship(
        "Usuario",
        back_populates="reservas",
    )

    quarto: Mapped["Quarto"] = relationship(
        "Quarto",
        back_populates="reservas",
    )

    avaliacao: Mapped[Optional["Avaliacao"]] = relationship(
        "Avaliacao",
        back_populates="reserva",
        uselist=False,
    )

    servicos: Mapped[list["ReservaServico"]] = relationship(
        "ReservaServico",
        back_populates="reserva",
        cascade="all, delete-orphan",
    )