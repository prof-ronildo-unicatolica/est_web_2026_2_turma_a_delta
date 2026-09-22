from app.models.cidade import Cidade
from app.models.hotel import Hotel


def test_catalogo_relacionamento(db_session):
    cidade = Cidade(nome='Cidade Teste', estado='CE', limite_territorial={})
    db_session.add(cidade); db_session.flush()
    hotel = Hotel(nome='Hotel Teste', cidade_id=cidade.id, categoria_estrelas=4)
    db_session.add(hotel); db_session.commit(); db_session.refresh(hotel)
    assert hotel.id is not None
    assert hotel.cidade.nome == 'Cidade Teste'
