from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cidade import Cidade
from app.models.comodidade import Comodidade
from app.models.hotel import Hotel
from app.repositories.cidade_repository import CidadeRepository
from app.repositories.hotel_repository import HotelRepository


class RegraDeNegocioError(Exception):
    """Erro de domínio independente do protocolo HTTP."""


class CidadeJaExisteError(RegraDeNegocioError):
    pass


class CidadeNaoEncontradaError(RegraDeNegocioError):
    pass


class HotelNaoEncontradoError(RegraDeNegocioError):
    pass


class HotelComQuartosError(RegraDeNegocioError):
    pass


class ComodidadeNaoEncontradaError(RegraDeNegocioError):
    pass


class CidadeService:
    def __init__(self, db: Session):
        self.repository = CidadeRepository(db)

    def criar(self, nome: str, estado: str, limite_territorial: dict) -> Cidade:
        nome = nome.strip()
        estado = estado.strip().upper()
        if self.repository.get_by_nome(nome):
            raise CidadeJaExisteError(f"Ja existe uma cidade chamada '{nome}'.")
        return self.repository.create(
            nome=nome,
            estado=estado,
            limite_territorial=limite_territorial,
        )

    def listar(self) -> list[Cidade]:
        return self.repository.list()


class HotelService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = HotelRepository(db)
        self.cidades = CidadeRepository(db)

    def _validar_comodidades(self, comodidade_ids: list[UUID]) -> None:
        if not comodidade_ids:
            return
        existentes = set(self.db.scalars(
            select(Comodidade.id).where(Comodidade.id.in_(comodidade_ids))
        ).all())
        faltantes = set(comodidade_ids) - existentes
        if faltantes:
            raise ComodidadeNaoEncontradaError(
                "Uma ou mais comodidades informadas não existem."
            )

    def criar(
        self,
        nome: str,
        cidade_id: UUID,
        categoria_estrelas: int = 3,
        localizacao: dict | None = None,
        comodidade_ids: list[UUID] | None = None,
    ) -> Hotel:
        nome = nome.strip()
        if not self.cidades.get_by_id(cidade_id):
            raise CidadeNaoEncontradaError(f"Não existe cidade com id '{cidade_id}'.")
        ids = list(dict.fromkeys(comodidade_ids or []))
        self._validar_comodidades(ids)
        return self.repository.create(
            nome, cidade_id, categoria_estrelas, localizacao, ids
        )

    def listar_hoteis(
        self,
        *,
        cidade_id: UUID | None = None,
        estrelas_min: int | None = None,
        busca: str | None = None,
    ) -> list[Hotel]:
        if estrelas_min is not None and not 1 <= estrelas_min <= 5:
            raise ValueError("estrelas_min deve estar entre 1 e 5")
        if cidade_id is not None and not self.cidades.get_by_id(cidade_id):
            raise CidadeNaoEncontradaError(f"Não existe cidade com id '{cidade_id}'.")
        return self.repository.listar(
            cidade_id=cidade_id,
            estrelas_min=estrelas_min,
            busca=busca,
        )

    def obter_hotel(self, hotel_id: UUID) -> Hotel:
        hotel = self.repository.obter(hotel_id)
        if hotel is None:
            raise HotelNaoEncontradoError("Hotel não encontrado.")
        return hotel

    def atualizar(
        self,
        hotel_id: UUID,
        *,
        nome: str,
        cidade_id: UUID,
        categoria_estrelas: int,
        localizacao: dict | None,
        comodidade_ids: list[UUID] | None = None,
    ) -> Hotel:
        hotel = self.obter_hotel(hotel_id)
        if not self.cidades.get_by_id(cidade_id):
            raise CidadeNaoEncontradaError(f"Não existe cidade com id '{cidade_id}'.")
        ids = list(dict.fromkeys(comodidade_ids or []))
        self._validar_comodidades(ids)
        return self.repository.update(
            hotel,
            nome=nome.strip(),
            cidade_id=cidade_id,
            categoria_estrelas=categoria_estrelas,
            localizacao=localizacao,
            comodidade_ids=ids,
        )

    def remover(self, hotel_id: UUID) -> None:
        hotel = self.obter_hotel(hotel_id)
        if not self.repository.delete(hotel):
            raise HotelComQuartosError(
                "Não é possível remover um hotel que possui quartos cadastrados."
            )


def hotel_para_resposta(hotel: Hotel) -> dict:
    """Converte o modelo ORM em JSON sem esconder campos do relacionamento."""
    return {
        "id": hotel.id,
        "nome": hotel.nome,
        "cidade_id": hotel.cidade_id,
        "cidade": {
            "id": hotel.cidade.id,
            "nome": hotel.cidade.nome,
            "estado": hotel.cidade.estado,
            "limite_territorial": hotel.cidade.limite_territorial,
        },
        "categoria_estrelas": hotel.categoria_estrelas,
        "localizacao": hotel.localizacao,
        "comodidades": [
            {"id": item.comodidade.id, "nome": item.comodidade.nome}
            for item in hotel.comodidades
        ],
    }
