import asyncio
import json
import logging

import aio_pika

from app.core.config import settings
from app.core.mongo import mongo_client, mongo_db
from app.repositories.mongo.auditoria_repository import AuditoriaRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process(requeue=True):
        evento = json.loads(message.body.decode("utf-8"))
        await AuditoriaRepository(mongo_db).registrar_evento(evento)
        logger.info("Evento de auditoria registrado: %s", evento.get("evento"))


async def main() -> None:
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=10)
        queue = await channel.declare_queue("audit.logs", durable=True)
        await queue.consume(process_message)
        logger.info("Aguardando eventos de auditoria")
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    finally:
        mongo_client.close()