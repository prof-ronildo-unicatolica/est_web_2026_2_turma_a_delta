from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.avaliacao import Avaliacao
from app.models.hotel import Hotel
from app.models.hotel_comodidade import HotelComodidade
from app.models.quarto import Quarto
from app.repositories.mongo.catalogo_repository import CatalogoRepository


class CatalogoSyncService:

    def __init__(
        self,
        db: Session,
        catalogo_repository: CatalogoRepository,
    ):
        self.db = db
        self.catalogo_repository = catalogo_repository

    def construir_documento_hotel(
        self,
        hotel: Hotel,
    ) -> dict:

        cidade = hotel.cidade

        # ---------------------------------------------------------
        # Cidade
        # ---------------------------------------------------------

        coordenadas = None

        if cidade.limite_territorial:
            # Neste primeiro momento não vamos tentar transformar
            # um Polygon em Point automaticamente.
            #
            # O Point usado pelo catálogo deve vir de:
            # hotel.localizacao
            pass

        if hotel.localizacao:
            coordenadas = hotel.localizacao

        if coordenadas is None:
            raise ValueError(
                f"Hotel {hotel.id} não possui localizacao válida."
            )

        cidade_documento = {
            "cidade_id": str(cidade.id),
            "nome": cidade.nome,
            "estado": cidade.estado,
            "coordenadas": coordenadas,
        }

        # ---------------------------------------------------------
        # Comodidades
        # ---------------------------------------------------------

        comodidades = []

        for associacao in hotel.comodidades:
            if associacao.comodidade:
                comodidades.append(
                    associacao.comodidade.nome
                )

        # ---------------------------------------------------------
        # Quartos
        # ---------------------------------------------------------

        quartos = []

        for quarto in hotel.quartos:
            quartos.append(
                {
                    "quarto_id": str(quarto.id),
                    "numero": quarto.numero,
                    "tipo": quarto.tipo,
                    "preco_diaria": float(quarto.preco_diaria),
                    "max_adultos": quarto.max_adultos,
                    "max_criancas": quarto.max_criancas,
                }
            )

        # ---------------------------------------------------------
        # Avaliações
        # ---------------------------------------------------------

        avaliacoes = list(hotel.avaliacoes)

        if avaliacoes:
            media = sum(
                avaliacao.nota
                for avaliacao in avaliacoes
            ) / len(avaliacoes)
        else:
            media = 0.0

        avaliacoes.sort(
            key=lambda avaliacao: avaliacao.data_publicacao,
            reverse=True,
        )

        avaliacoes_recentes = []

        for avaliacao in avaliacoes[:10]:
            avaliacoes_recentes.append(
                {
                    "usuario_nome": avaliacao.usuario.nome,
                    "nota": avaliacao.nota,
                    "comentario": avaliacao.comentario or "",
                    "data": avaliacao.data_publicacao,
                }
            )

        # ---------------------------------------------------------
        # Documento final
        # ---------------------------------------------------------

        return {
            "_id": str(hotel.id),
            "id": str(hotel.id),
            "cidade_id": str(cidade.id),

            "nome": hotel.nome,

            "categoria_estrelas": hotel.categoria_estrelas,

            "cidade": cidade_documento,

            "comodidades": comodidades,

            "quartos": quartos,

            "media_avaliacao": round(media, 2),

            "avaliacoes_recentes": avaliacoes_recentes,
        }

    def carregar_hotel(
        self,
        hotel_id: UUID,
    ) -> Hotel | None:

        return (
            self.db.query(Hotel)
            .options(
                joinedload(Hotel.cidade),

                joinedload(Hotel.quartos),

                joinedload(Hotel.comodidades)
                .joinedload(
                    HotelComodidade.comodidade
                ),

                joinedload(Hotel.avaliacoes)
                .joinedload(
                    Avaliacao.usuario
                ),
            )
            .filter(Hotel.id == hotel_id)
            .first()
        )

    async def sincronizar_hotel(
        self,
        hotel_id: UUID,
    ) -> dict:

        hotel = self.carregar_hotel(hotel_id)

        if hotel is None:
            raise ValueError(
                f"Hotel {hotel_id} não encontrado."
            )

        documento = self.construir_documento_hotel(
            hotel
        )

        await self.catalogo_repository.upsert_hotel(
            str(hotel.id),
            documento,
        )

        return documento