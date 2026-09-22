from __future__ import annotations

from uuid import UUID

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Comodidade(Base):
    __tablename__ = "comodidades"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    hoteis: Mapped[list["HotelComodidade"]] = relationship(
        "HotelComodidade",
        back_populates="comodidade",
        cascade="all, delete-orphan",
    )