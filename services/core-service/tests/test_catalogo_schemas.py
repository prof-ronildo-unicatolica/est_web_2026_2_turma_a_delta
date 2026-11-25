from uuid import uuid4

from app.schemas.catalogo import HotelCreateSchema, HotelResponseSchema


def test_hotel_response_exposes_complete_city_and_comodidades():
    cidade_id = uuid4()
    comodidade_id = uuid4()

    resposta = HotelResponseSchema.model_validate(
        {
            "id": uuid4(),
            "nome": "Hotel de Teste",
            "cidade_id": cidade_id,
            "cidade": {
                "id": cidade_id,
                "nome": "Quixadá",
                "estado": "CE",
                "limite_territorial": {"type": "FeatureCollection", "features": []},
            },
            "categoria_estrelas": 4,
            "localizacao": None,
            "comodidades": [{"id": comodidade_id, "nome": "Wi-Fi"}],
        }
    )

    assert resposta.cidade.id == cidade_id
    assert resposta.cidade.nome == "Quixadá"
    assert resposta.cidade.estado == "CE"
    assert resposta.comodidades[0].id == comodidade_id
    assert resposta.comodidades[0].nome == "Wi-Fi"


def test_hotel_create_accepts_comodidade_ids():
    cidade_id = uuid4()
    comodidade_id = uuid4()

    entrada = HotelCreateSchema.model_validate(
        {
            "nome": "Hotel de Teste",
            "cidade_id": cidade_id,
            "categoria_estrelas": 3,
            "comodidade_ids": [str(comodidade_id)],
        }
    )

    assert entrada.cidade_id == cidade_id
    assert entrada.comodidade_ids == [comodidade_id]
