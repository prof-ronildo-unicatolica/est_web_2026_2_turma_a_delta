from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Avaliacao(Base):
    __tablename__ = "avaliacoes"

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

    hotel_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("hoteis.id", ondelete="CASCADE"),
        nullable=False,
    )

    reserva_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("reservas.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    nota: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    comentario: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    data_publicacao: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    __table_args__ = (
        CheckConstraint(
            "nota BETWEEN 1 AND 5",
            name="ck_avaliacoes_nota",
        ),
    )

    usuario: Mapped["Usuario"] = relationship(
        "Usuario",
        back_populates="avaliacoes",
    )

    hotel: Mapped["Hotel"] = relationship(
        "Hotel",
        back_populates="avaliacoes",
    )

    reserva: Mapped["Reserva"] = relationship(
        "Reserva",
        back_populates="avaliacao",
    )