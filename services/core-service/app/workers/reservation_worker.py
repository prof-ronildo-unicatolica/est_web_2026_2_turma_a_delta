import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import UUID

import aio_pika
from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.rabbitmq import QUEUE_AUDITORIA, QUEUE_SOLICITACOES_RESERVA, publish_event
from app.models.reserva import Reserva

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def audit_payload(reserva: Reserva, evento: str, detalhes: dict | None = None) -> dict:
    return {
        "evento": evento,
        "reserva_id": str(reserva.id),
        "usuario_id": str(reserva.usuario_id),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "detalhes": detalhes or {},
    }


async def process_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process(requeue=True):
        data = json.loads(message.body.decode("utf-8"))
        reserva_id = UUID(data["reserva_id"])
        db = SessionLocal()
        try:
            reserva = db.scalar(select(Reserva).where(Reserva.id == reserva_id).with_for_update())
            if reserva is None or reserva.status != "Pendente":
                return

            # Verifica conflitos novamente no worker para reduzir reservas simultâneas.
            conflito = db.scalar(
                select(Reserva.id).where(
                    Reserva.quarto_id == reserva.quarto_id,
                    Reserva.id != reserva.id,
                    Reserva.status == "Confirmada",
                    Reserva.data_checkin < reserva.data_checkout,
                    Reserva.data_checkout > reserva.data_checkin,
                ).limit(1)
            )
            if conflito is not None:
                reserva.status = "Cancelada"
                db.commit()
                await publish_event(QUEUE_AUDITORIA, audit_payload(reserva, "RESERVA_CANCELADA", {"motivo": "indisponibilidade"}))
                return

            # Etapa de pagamento simulada: valores válidos seguem para aprovação.
            # Integrar gateway real aqui quando houver credenciais/contrato definidos.
            if reserva.valor_total is None:
                reserva.status = "Cancelada"
                db.commit()
                await publish_event(QUEUE_AUDITORIA, audit_payload(reserva, "RESERVA_CANCELADA", {"motivo": "pagamento_reprovado"}))
                return

            reserva.status = "Confirmada"
            db.commit()
            await publish_event(QUEUE_AUDITORIA, audit_payload(reserva, "PAGAMENTO_APROVADO", {"valor": str(reserva.valor_total)}))
            logger.info("Reserva %s confirmada", reserva.id)
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()


async def main() -> None:
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)
        queue = await channel.declare_queue(QUEUE_SOLICITACOES_RESERVA, durable=True)
        await queue.consume(process_message)
        logger.info("Worker de reservas aguardando mensagens")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())