# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.mongo import mongo_db  # conexão Mongo agora vem daqui

# --- Configuração do PostgreSQL ---
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Configuração do MongoDB ---
# mongo_db é importado de app.core.mongo (fonte única da conexão).
# get_mongo_db() é mantido aqui por compatibilidade com o código existente
# (ex: app.main), que já importa dessa forma.
def get_mongo_db():
    return mongo_db