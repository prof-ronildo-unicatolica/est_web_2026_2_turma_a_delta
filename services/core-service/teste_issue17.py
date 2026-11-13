
from uuid import UUID, uuid4

from app.core.database import SessionLocal
from app.services.hotel_service import (
    CidadeService,
    HotelService,
    CidadeJaExisteError,
    CidadeNaoEncontradaError,
)


db = SessionLocal()

try:
    cidades = CidadeService(db)
    hoteis = HotelService(db)

    nome = f"Cidade Teste Issue 17 {uuid4().hex[:8]}"

    try:
        cidades.criar(
            nome=nome,
            estado="CE",
            limite_territorial={},
        )

        cidades.criar(
            nome=nome,
            estado="CE",
            limite_territorial={},
        )

        raise AssertionError("A duplicata nao foi bloqueada")

    except CidadeJaExisteError as erro:
        print("OK - cidade duplicada bloqueada:", erro)

    try:
        cidades.criar(
            nome=f"  {nome}  ",
            estado="CE",
            limite_territorial={},
        )

        raise AssertionError("A normalizacao nao funcionou")

    except CidadeJaExisteError as erro:
        print("OK - espacos normalizados:", erro)

    try:
        hoteis.criar(
            nome="Hotel Fantasma",
            cidade_id=UUID(
                "00000000-0000-0000-0000-000000000000"
            ),
        )

        raise AssertionError("A cidade inexistente foi aceita")

    except CidadeNaoEncontradaError as erro:
        print("OK - cidade inexistente bloqueada:", erro)

    print("cidades cadastradas:", len(cidades.listar()))

finally:
    db.close()