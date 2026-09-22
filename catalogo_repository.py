from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.mongo import COLLECTION_CATALOGO_HOTEIS


class CatalogoRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[COLLECTION_CATALOGO_HOTEIS]

    async def upsert_hotel(
        self,
        hotel_id: str,
        documento: dict[str, Any],
    ) -> None:
        await self.collection.replace_one(
            {"_id": hotel_id},
            documento,
            upsert=True,
        )

    async def delete_hotel(
        self,
        hotel_id: str,
    ) -> None:
        await self.collection.delete_one(
            {"_id": hotel_id}
        )

    async def get_hotel(
        self,
        hotel_id: str,
    ) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {"_id": hotel_id}
        )

    async def list_hoteis(
        self,
    ) -> list[dict[str, Any]]:
        cursor = self.collection.find({})
        return await cursor.to_list(length=None)