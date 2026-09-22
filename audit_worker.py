import asyncio, json
from datetime import datetime, timezone
import aio_pika
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.mongo import COLLECTION_HISTORICO_AUDITORIA

async def process_message(message):
    async with message.process(requeue=False):
        data=json.loads(message.body.decode())
        client=AsyncIOMotorClient(settings.MONGODB_URL)
        try:
            db=client[settings.MONGODB_DB]
            data["timestamp"]=datetime.now(timezone.utc)
            await db[COLLECTION_HISTORICO_AUDITORIA].insert_one(data)
        finally: client.close()

async def main():
    connection=await aio_pika.connect_robust(settings.RABBITMQ_URL)
    async with connection:
        channel=await connection.channel(); await channel.set_qos(prefetch_count=10)
        queue=await channel.declare_queue("audit.logs", durable=True)
        await queue.consume(process_message)
        print("[AuditWorker] aguardando audit.logs")
        await asyncio.Future()

if __name__=="__main__": asyncio.run(main())
