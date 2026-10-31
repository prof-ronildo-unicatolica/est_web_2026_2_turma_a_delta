import json

import aio_pika

from app.core.config import settings

QUEUE_SOLICITACOES_RESERVA = "solicitacoes-reserva"
QUEUE_AUDITORIA = "audit.logs"
QUEUE_SYNC_CATALOGO = "catalogo-sync"


async def publish_event(queue_name: str, event_data: dict) -> None:
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    async with connection:
        channel = await connection.channel()
        queue = await channel.declare_queue(queue_name, durable=True)
        body = json.dumps(event_data, default=str).encode("utf-8")
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=body,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                content_type="application/json",
            ),
            routing_key=queue.name,
        )