import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.cidades import Cidade


class Hotel(Base):
    __tablename__ = "hoteis"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    cidade_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cidades.id"),
        nullable=False,
    )

    categorias_estrelas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    localizacao: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    cidade: Mapped["Cidade"] = relationship(
        "Cidade",
        back_populates="hoteis",
    )

    __table_args__ = (
        CheckConstraint(
            "categorias_estrelas BETWEEN 1 AND 5",
            name="ck_hoteis_categorias_estrelas",
        ),
    )