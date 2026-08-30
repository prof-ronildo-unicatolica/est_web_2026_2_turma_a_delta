from __future__ import annotations

from uuid import UUID

from sqlalchemy import Boolean, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    senha_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    reservas: Mapped[list["Reserva"]] = relationship(
        "Reserva",
        back_populates="usuario",
    )

    avaliacoes: Mapped[list["Avaliacao"]] = relationship(
        "Avaliacao",
        back_populates="usuario",
    )