from __future__ import annotations

from uuid import UUID

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Cidade(Base):
    __tablename__ = "cidades"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    estado: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
    )

    limite_territorial: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    hoteis: Mapped[list["Hotel"]] = relationship(
        "Hotel",
        back_populates="cidade",
    )