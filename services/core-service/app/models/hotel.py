from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Hotel(Base):
    __tablename__ = "hoteis"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    cidade_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("cidades.id", ondelete="CASCADE"),
        nullable=False,
    )

    categoria_estrelas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    localizacao: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "categoria_estrelas BETWEEN 1 AND 5",
            name="ck_hoteis_categoria_estrelas",
        ),
    )

    cidade: Mapped["Cidade"] = relationship(
        "Cidade",
        back_populates="hoteis",
    )

    quartos: Mapped[list["Quarto"]] = relationship(
        "Quarto",
        back_populates="hotel",
        cascade="all, delete-orphan",
    )

    tarifas_temporada: Mapped[list["TarifaTemporada"]] = relationship(
        "TarifaTemporada",
        back_populates="hotel",
        cascade="all, delete-orphan",
    )

    comodidades: Mapped[list["HotelComodidade"]] = relationship(
        "HotelComodidade",
        back_populates="hotel",
        cascade="all, delete-orphan",
    )

    avaliacoes: Mapped[list["Avaliacao"]] = relationship(
        "Avaliacao",
        back_populates="hotel",
    )