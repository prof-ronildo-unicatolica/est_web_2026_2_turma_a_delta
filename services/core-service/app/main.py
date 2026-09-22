from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.catalogo import router as catalogo_router
from app.api.v1.health import router as health_router
from app.api.v1.reservas import router as reservas_router

from app.core.config import settings
from app.core.database import get_mongo_db
from app.core.seed_mongo import seed_mongo_users
from app.core.seed_catalogo import seed_catalogo


@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_db = get_mongo_db()
    await seed_mongo_users(mongo_db)
    seed_catalogo()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    auth_router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    catalogo_router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    reservas_router,
    prefix=settings.API_V1_STR,
)


@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo ao Core Service do Sistema de Reservas!"
    }