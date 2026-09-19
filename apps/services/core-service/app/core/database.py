from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.base import Base

# Importa os modelos para registrar os relacionamentos
import app.models.usuario
import app.models.reserva
import app.models.cidade
import app.models.hotel
import app.models.quarto
import app.models.comodidade
import app.models.hotel_comodidade
import app.models.reserva_servico
import app.models.servico_adicional
import app.models.tarifa_temporada
import app.models.avaliacao


DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{settings.POSTGRES_USER}:"
    f"{settings.POSTGRES_PASSWORD}@"
    f"{settings.POSTGRES_SERVER}:"
    f"{settings.POSTGRES_PORT}/"
    f"{settings.POSTGRES_DB}"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)