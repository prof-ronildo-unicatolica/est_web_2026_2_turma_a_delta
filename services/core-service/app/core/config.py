from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )

    PROJECT_NAME: str = "Sistema de Reservas - Core Service"
    API_V1_STR: str = "/api/v1"

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "hotel_db_dev"
    POSTGRES_PORT: int = 5432

    # Sem valor padrão intencionalmente: a aplicação não deve iniciar
    # com uma chave JWT pública ou previsível. Defina no .env/ambiente.
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        ).render_as_string(hide_password=False)

    MONGODB_URL: str = "mongodb://admin:admin123@localhost:27017/?authSource=admin"
    MONGODB_DB: str = "hotel_mongo_dev"
    RABBITMQ_URL: str = "amqp://hotel_app:change-me@localhost:5672/"


settings = Settings()
