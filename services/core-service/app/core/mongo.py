# app/core/mongo.py
"""
Módulo dedicado à camada NoSQL (MongoDB) do Core Service.

É a fonte única da conexão com o MongoDB — app.core.database importa
mongo_db daqui em vez de criar seu próprio client, evitando dois pools
de conexão abertos simultaneamente com o mesmo banco.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)


# --- Conexão única com o MongoDB (fonte da verdade) ---
mongo_client: AsyncIOMotorClient = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db: AsyncIOMotorDatabase = mongo_client[settings.MONGODB_DB]


# --- Nomes de coleção centralizados (evita strings soltas nos repositories) ---
COLLECTION_CATALOGO_HOTEIS = "catalogo_hoteis"
COLLECTION_HISTORICO_AUDITORIA = "historico_auditoria"


def get_mongo_db() -> AsyncIOMotorDatabase:
    """
    Dependency para uso em rotas/serviços que trabalham com o catálogo
    e a auditoria.
    """
    return mongo_db


async def create_indexes() -> None:
    """
    Cria os índices necessários para as coleções NoSQL.
    Deve ser chamada uma vez no startup da aplicação (lifespan do FastAPI).
    Operações de criação de índice no MongoDB são idempotentes: se o
    índice já existir com a mesma definição, a chamada não faz nada.
    """
    try:
        catalogo_collection = mongo_db[COLLECTION_CATALOGO_HOTEIS]

        # Índice geoespacial para buscas "próximos a mim" (seção 4.1 do doc)
        await catalogo_collection.create_index(
            [("cidade.coordenadas", "2dsphere")],
            name="idx_cidade_coordenadas_2dsphere",
        )

        # Índice auxiliar para buscas por cidade (uso comum no catálogo)
        await catalogo_collection.create_index(
            [("cidade.cidade_id", 1)],
            name="idx_cidade_id",
        )

        auditoria_collection = mongo_db[COLLECTION_HISTORICO_AUDITORIA]

        # Índice para consultas de histórico por reserva (uso muito frequente)
        await auditoria_collection.create_index(
            [("reserva_id", 1), ("timestamp", 1)],
            name="idx_reserva_id_timestamp",
        )

        logger.info("Índices do MongoDB criados/verificados com sucesso.")
    except Exception as e:
        logger.error(f"Erro ao criar índices do MongoDB: {str(e)}")
        raise