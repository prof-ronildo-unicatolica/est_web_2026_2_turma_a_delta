
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cidade import Cidade


class CidadeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        nome: str,
        estado: str,
        limite_territorial: dict,
    ) -> Cidade:
        cidade = Cidade(
            nome=nome,
            estado=estado,
            limite_territorial=limite_territorial,
        )

        self.db.add(cidade)
        self.db.commit()
        self.db.refresh(cidade)

        return cidade

    def list(self) -> list[Cidade]:
        stmt = select(Cidade).order_by(Cidade.nome)
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, cidade_id: UUID) -> Cidade | None:
        return self.db.get(Cidade, cidade_id)

    def get_by_nome(self, nome: str) -> Cidade | None:
        stmt = select(Cidade).where(Cidade.nome == nome)
        return self.db.scalars(stmt).one_or_none()