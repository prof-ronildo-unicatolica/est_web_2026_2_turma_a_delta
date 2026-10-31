import pytest

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.usuario import UsuarioCreate


client = TestClient(app)


def test_rota_principal():
    response = client.get("/")

    assert response.status_code == 200
    assert "message" in response.json()


def test_documentacao_openapi():
    response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200

    paths = response.json()["paths"]

    assert "/api/v1/health" in paths
    assert "/api/v1/auth/register" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/reservas" in paths
    assert "/api/v1/hoteis/{hotel_id}" in paths
    assert "/api/v1/admin/cidades" in paths
    assert "/api/v1/admin/cidades/{cidade_id}" in paths
    assert "/api/v1/admin/hoteis" in paths
    assert "/api/v1/admin/hoteis/{hotel_id}" in paths

    assert "put" in paths["/api/v1/admin/cidades/{cidade_id}"]
    assert "delete" in paths["/api/v1/admin/cidades/{cidade_id}"]

    assert "put" in paths["/api/v1/admin/hoteis/{hotel_id}"]
    assert "delete" in paths["/api/v1/admin/hoteis/{hotel_id}"]


def test_cancelamento_usa_patch():
    response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200

    paths = response.json()["paths"]

    rota = paths["/api/v1/reservas/{reserva_id}/cancelar"]

    assert "patch" in rota
    assert "post" not in rota


def test_cadastro_publico_rejeita_campo_administrativo():
    with pytest.raises(ValidationError):
        UsuarioCreate(
            nome="Usuario Malicioso",
            email="teste2@example.com",
            senha="SenhaForte123",
            is_admin=True,
        )