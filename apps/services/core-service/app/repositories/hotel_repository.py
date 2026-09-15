from uuid import UUID

from sqlalchemy.orm import Session

from app.models.cidade import Cidade


class CidadeRepository:
    """Acesso ao banco para a entidade Cidade."""

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
        return self.db.query(Cidade).order_by(Cidade.nome).all()

    def get_by_id(self, cidade_id: UUID) -> Cidade | None:
        return self.db.query(Cidade).filter(Cidade.id == cidade_id).first()

    def get_by_nome(self, nome: str) -> Cidade | None:
        return self.db.query(Cidade).filter(Cidade.nome == nome).first()
