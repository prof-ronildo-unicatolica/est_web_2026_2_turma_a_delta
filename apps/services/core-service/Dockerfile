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

# Não cria .venv dentro do container
RUN poetry config virtualenvs.create false

# Copia os arquivos do Poetry
COPY pyproject.toml poetry.lock ./

# Instala exatamente as dependências do lock
RUN poetry install --no-interaction --no-ansi --no-root

# Copia o projeto
COPY . .

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]