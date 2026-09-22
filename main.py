from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.catalogo import router as catalogo_router
from app.api.v1.health import router as health_router
from app.api.v1.reservas import router as reservas_router
from app.api.v1.precos import router as precos_router

from app.core.config import settings
from app.core.seed_catalogo import seed_catalogo
from app.core.mongo import create_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
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

app.include_router(
    precos_router,
    prefix=settings.API_V1_STR,
)


@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo ao Core Service do Sistema de Reservas!"
    }