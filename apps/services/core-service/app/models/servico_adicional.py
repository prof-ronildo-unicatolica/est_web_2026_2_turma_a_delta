from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import CheckConstraint, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ServicoAdicional(Base):
    __tablename__ = "servicos_adicionais"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    preco: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "preco >= 0",
            name="ck_servicos_preco",
        ),
    )

    reservas: Mapped[list["ReservaServico"]] = relationship(
        "ReservaServico",
        back_populates="servico",
        cascade="all, delete-orphan",
    )