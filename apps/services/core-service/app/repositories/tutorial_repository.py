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

    async def delete_hotel(self, hotel_id: str) -> None:
        await self.collection.delete_one({"_id": hotel_id})

    async def get_hotel(self, hotel_id: str):
        return await self.collection.find_one({"_id": hotel_id})

    async def list_hoteis(self):
        cursor = self.collection.find({})
        return await cursor.to_list(length=None)

    async def buscar_hoteis(
        self,
        cidade: str | None = None,
        estrelas: int | None = None,
    ):
        filtro = {}

        if cidade:
            filtro["cidade.nome"] = {
                "$regex": cidade,
                "$options": "i",
            }

        if estrelas is not None:
            filtro["categoria_estrelas"] = estrelas

        cursor = self.collection.find(
            filtro,
            {
                "_id": 0,
                "nome": 1,
                "categoria_estrelas": 1,
                "quartos": 1,
            },
        )

        resultados = await cursor.to_list(length=100)

        return [
            {
                "hotel": item["nome"],
                "estrelas": item["categoria_estrelas"],
                "quartos": item.get("quartos", []),
            }
            for item in resultados
        ]