import asyncio, json, time
from datetime import datetime
import aio_pika
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.rabbitmq import publish_event
from app.models.reserva import Reserva
from app.models.quarto import Quarto

async def process(message: aio_pika.IncomingMessage):
    async with message.process(requeue=False):
        data=json.loads(message.body.decode())
        reserva_id=data["reserva_id"]
        db=SessionLocal()
        try:
            reserva=db.scalar(select(Reserva).where(Reserva.id==reserva_id).with_for_update())
            if reserva is None or reserva.status != "Pendente":
                return
            # O lock do quarto é mantido até o commit final. Assim, dois
            # workers para o mesmo quarto são serializados e não conseguem
            # confirmar reservas sobrepostas simultaneamente.
            quarto=db.scalar(select(Quarto).where(Quarto.id==reserva.quarto_id).with_for_update())
            if quarto is None:
                reserva.status="Cancelada"; db.commit(); return
            conflitos=db.scalars(select(Reserva).where(
                Reserva.quarto_id==reserva.quarto_id,
                Reserva.id!=reserva.id,
                Reserva.status=="Confirmada",
                Reserva.data_checkin < reserva.data_checkout,
                Reserva.data_checkout > reserva.data_checkin,
            )).all()
            if conflitos:
                reserva.status="Cancelada"
                db.commit()
                await publish_event("audit.logs", {"evento":"RESERVA_CANCELADA","reserva_id":str(reserva.id),"usuario_id":str(reserva.usuario_id),"motivo":"overbooking"})
                return
            # Pagamento simulado enquanto o lock do quarto permanece aberto.
            await asyncio.sleep(2)
            reserva.status="Confirmada"
            db.commit()
            await publish_event("audit.logs", {"evento":"PAGAMENTO_APROVADO","reserva_id":str(reserva.id),"usuario_id":str(reserva.usuario_id),"adquirente":"SIMULADO","codigo_autorizacao":str(reserva.id)[:8],"tentativas":1,"tempo_resposta_ms":2000})
        except Exception:
            db.rollback(); raise
        finally: db.close()

async def main():
    conn=await aio_pika.connect_robust(settings.RABBITMQ_URL)
    async with conn:
        ch=await conn.channel(); await ch.set_qos(prefetch_count=1)
        q=await ch.declare_queue("solicitacoes-reserva", durable=True)
        await q.consume(process)
        print("[ReservaWorker] aguardando solicitacoes-reserva")
        await asyncio.Future()

if __name__=="__main__": asyncio.run(main())
