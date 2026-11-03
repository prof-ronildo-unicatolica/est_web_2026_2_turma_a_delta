
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala o Poetry
RUN pip install --no-cache-dir poetry

# Não cria ambiente virtual dentro do container
RUN poetry config virtualenvs.create false

# Copia somente os arquivos de dependências
COPY pyproject.toml poetry.lock ./

# Instala as dependências travadas no poetry.lock
RUN poetry install --no-interaction --no-ansi --no-root

# Copia somente os arquivos necessários da aplicação
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
