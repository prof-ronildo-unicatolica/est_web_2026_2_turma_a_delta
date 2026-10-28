from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.mongo import COLLECTION_HISTORICO_AUDITORIA


class AuditoriaRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[COLLECTION_HISTORICO_AUDITORIA]

    async def registrar_evento(self, evento: dict[str, Any]) -> None:
        documento = {**evento}
        documento.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        await self.collection.insert_one(documento)