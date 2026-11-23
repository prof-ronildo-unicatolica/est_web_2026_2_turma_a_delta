
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.cidade import Cidade
from app.models.hotel import Hotel
from app.repositories.cidade_repository import CidadeRepository
from app.repositories.hotel_repository import HotelRepository


class RegraDeNegocioError(Exception):
    pass


class CidadeJaExisteError(RegraDeNegocioError):
    pass


class CidadeNaoEncontradaError(RegraDeNegocioError):
    pass


class CidadeService:
    def __init__(self, db: Session):
        self.repository = CidadeRepository(db)

    def criar(
        self,
        nome: str,
        estado: str,
        limite_territorial: dict,
    ) -> Cidade:
        nome = nome.strip()
        estado = estado.strip().upper()

        if self.repository.get_by_nome(nome):
            raise CidadeJaExisteError(
                f"Ja existe uma cidade chamada '{nome}'."
            )

        return self.repository.create(
            nome=nome,
            estado=estado,
            limite_territorial=limite_territorial,
        )

    def listar(self) -> list[Cidade]:
        return self.repository.list()


class HotelService:
    def __init__(self, db: Session):
        self.repository = HotelRepository(db)
        self.cidades = CidadeRepository(db)

    def criar(
        self,
        nome: str,
        cidade_id: UUID,
        categoria_estrelas: int = 3,
        localizacao: dict | None = None,
    ) -> Hotel:
        nome = nome.strip()

        if not self.cidades.get_by_id(cidade_id):
            raise CidadeNaoEncontradaError(
                f"Nao existe cidade com id '{cidade_id}'."
            )

        return self.repository.create(
            nome=nome,
            cidade_id=cidade_id,
            categoria_estrelas=categoria_estrelas,
            localizacao=localizacao,
        )

    def listar(
        self,
        cidade_id: UUID | None = None,
    ) -> list[Hotel]:
        if cidade_id is not None:
            if not self.cidades.get_by_id(cidade_id):
                raise CidadeNaoEncontradaError(
                    f"Nao existe cidade com id '{cidade_id}'."
                )

            return self.repository.list_by_cidade(cidade_id)

        return self.repository.list()

    def listar_hoteis(
        self,
        *,
        cidade_id: UUID | None = None,
        estrelas_min: int | None = None,
        busca: str | None = None,
    ) -> list[Hotel]:
        if estrelas_min is not None and not 1 <= estrelas_min <= 5:
            raise ValueError(
                "estrelas_min deve estar entre 1 e 5"
            )

        if cidade_id is not None:
            if not self.cidades.get_by_id(cidade_id):
                raise CidadeNaoEncontradaError(
                    f"Nao existe cidade com id '{cidade_id}'."
                )

        return self.repository.listar(
            cidade_id=cidade_id,
            estrelas_min=estrelas_min,
            busca=busca,
        )

    def obter_hotel(self, hotel_id: UUID) -> Hotel | None:
        return self.repository.obter(hotel_id)