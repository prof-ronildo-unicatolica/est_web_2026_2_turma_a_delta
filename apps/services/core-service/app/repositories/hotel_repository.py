from sqlalchemy.orm import Session

import app.models.avaliacao  # noqa: F401
import app.models.cidade  # noqa: F401
import app.models.comodidade  # noqa: F401
import app.models.hotel  # noqa: F401
import app.models.hotel_comodidade  # noqa: F401
import app.models.quarto  # noqa: F401
import app.models.reserva  # noqa: F401
import app.models.reserva_servico  # noqa: F401
import app.models.servico_adicional  # noqa: F401
import app.models.tarifa_temporada  # noqa: F401
import app.models.usuario  # noqa: F401
from app.models.cidade import Cidade


class CidadeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        nome: str,
        estado: str = "CE",
        limite_territorial: str = "{}",
    ) -> Cidade:
        cidade = Cidade(nome=nome)
        cidade.estado = estado
        cidade.limite_territorial = limite_territorial

        self.db.add(cidade)
        self.db.commit()
        self.db.refresh(cidade)
        return cidade

    def list(self) -> list[Cidade]:
        return self.db.query(Cidade).order_by(Cidade.nome).all()

    def get_by_id(self, cidade_id) -> Cidade | None:
        return self.db.query(Cidade).filter(Cidade.id == cidade_id).first()

    def get_by_nome(self, nome: str) -> Cidade | None:
        return self.db.query(Cidade).filter(Cidade.nome == nome).first()