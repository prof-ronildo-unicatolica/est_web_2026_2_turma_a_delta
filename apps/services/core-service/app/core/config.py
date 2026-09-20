from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ... configurações existentes (POSTGRES_*, RABBITMQ_*) ...

    # --- MongoDB ---
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "hotel_mongo_dev"
    MONGO_MAX_POOL_SIZE: int = 20
    MONGO_MIN_POOL_SIZE: int = 1
    MONGO_SERVER_SELECTION_TIMEOUT_MS: int = 5_000


settings = Settings()