from uuid import UUID

from app.models.hotel import Hotel
from app.repositories.hotel_repository import HotelRepository


class HotelService:
    """Regras de consulta e filtros do catálogo de hotéis."""

    def __init__(self, repository: HotelRepository):
        self.repository = repository

    def listar_hoteis(
        self, *, cidade_id: UUID | None = None,
        estrelas_min: int | None = None, busca: str | None = None,
    ) -> list[Hotel]:
        if estrelas_min is not None and not 1 <= estrelas_min <= 5:
            raise ValueError("estrelas_min deve estar entre 1 e 5")
        return self.repository.listar(
            cidade_id=cidade_id, estrelas_min=estrelas_min, busca=busca
        )

    def obter_hotel(self, hotel_id: UUID) -> Hotel | None:
        return self.repository.obter(hotel_id)
