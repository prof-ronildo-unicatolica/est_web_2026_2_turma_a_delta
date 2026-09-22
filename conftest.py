import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import get_db
from app.main import app
from app.models.base import Base

TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/hotel_db_test')
engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope='function')
def db_session():
    Base.metadata.create_all(bind=engine)
    db=TestingSessionLocal()
    try: yield db
    finally:
        db.rollback(); db.close()
        # O banco de testes deve ser dedicado; limpar as tabelas mantém os testes isolados.
        for table in reversed(Base.metadata.sorted_tables):
            with engine.begin() as conn:
                conn.execute(table.delete())

@pytest.fixture(scope='function')
def client(db_session):
    def override_get_db(): yield db_session
    app.dependency_overrides[get_db]=override_get_db
    with TestClient(app, raise_server_exceptions=False) as c: yield c
    app.dependency_overrides.clear()
