import uuid
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.api.v1.reservas import (
    cancelar_reserva,
    criar_reserva,
    listar_reservas,
    obter_reserva,
)
from app.models.reserva import Reserva
from app.schemas.reserva import ReservaCreateSchema


@pytest.fixture
def usuario():
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_admin=False,
    )


@pytest.fixture
def quarto():
    return SimpleNamespace(
        id=uuid.uuid4(),
        preco_diaria=Decimal("150.00"),
        max_adultos=2,
        max_criancas=1,
    )


@pytest.fixture
def payload(quarto):
    return ReservaCreateSchema(
        quarto_id=quarto.id,
        data_checkin=date(2027, 5, 10),
        data_checkout=date(2027, 5, 13),
        quantidade_adultos=2,
        quantidade_criancas=1,
        quantidade_bebes=0,
        tarifa_tipo="Reembolsavel",
    )


@pytest.fixture
def db():
    session = Mock()
    session.add = Mock()
    session.commit = Mock()
    session.refresh = Mock()
    return session


def test_schema_rejeita_checkout_igual_checkin(quarto):
    with pytest.raises(ValidationError):
        ReservaCreateSchema(
            quarto_id=quarto.id,
            data_checkin=date(2027, 5, 10),
            data_checkout=date(2027, 5, 10),
            quantidade_adultos=1,
        )


def test_schema_rejeita_checkout_anterior_checkin(quarto):
    with pytest.raises(ValidationError):
        ReservaCreateSchema(
            quarto_id=quarto.id,
            data_checkin=date(2027, 5, 12),
            data_checkout=date(2027, 5, 10),
            quantidade_adultos=1,
        )


@pytest.mark.parametrize("adultos", [0, -1])
def test_schema_rejeita_quantidade_adultos_invalida(quarto, adultos):
    with pytest.raises(ValidationError):
        ReservaCreateSchema(
            quarto_id=quarto.id,
            data_checkin=date(2027, 5, 10),
            data_checkout=date(2027, 5, 12),
            quantidade_adultos=adultos,
        )


def test_criar_reserva_calcula_valor_e_limite_cancelamento(
    db, usuario, quarto, payload
):
    db.scalar.side_effect = [quarto, None]

    resultado = criar_reserva(payload, db, usuario)

    assert isinstance(resultado, Reserva)
    assert resultado.usuario_id == usuario.id
    assert resultado.quarto_id == quarto.id
    assert resultado.valor_total == Decimal("450.00")
    assert resultado.data_limite_cancelamento == date(2027, 5, 8)
    assert resultado.valor_multa_cancelamento == 0
    assert resultado.status == "Confirmada"

    db.add.assert_called_once_with(resultado)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(resultado)


def test_criar_reserva_tarifa_nao_reembolsavel(
    db, usuario, quarto
):
    payload = ReservaCreateSchema(
        quarto_id=quarto.id,
        data_checkin=date(2027, 5, 10),
        data_checkout=date(2027, 5, 12),
        quantidade_adultos=1,
        tarifa_tipo="Nao Reembolsavel",
    )
    db.scalar.side_effect = [quarto, None]

    resultado = criar_reserva(payload, db, usuario)

    assert resultado.valor_total == Decimal("300.00")
    assert resultado.data_limite_cancelamento is None


def test_criar_reserva_quarto_inexistente(
    db, usuario, payload
):
    db.scalar.return_value = None

    with pytest.raises(HTTPException) as erro:
        criar_reserva(payload, db, usuario)

    assert erro.value.status_code == 404
    assert erro.value.detail == "Quarto não encontrado"
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_criar_reserva_excede_limite_de_adultos(
    db, usuario, quarto, payload
):
    payload = payload.model_copy(
        update={"quantidade_adultos": 3}
    )
    db.scalar.return_value = quarto

    with pytest.raises(HTTPException) as erro:
        criar_reserva(payload, db, usuario)

    assert erro.value.status_code == 422
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_criar_reserva_excede_limite_de_criancas(
    db, usuario, quarto, payload
):
    payload = payload.model_copy(
        update={"quantidade_criancas": 2}
    )
    db.scalar.return_value = quarto

    with pytest.raises(HTTPException) as erro:
        criar_reserva(payload, db, usuario)

    assert erro.value.status_code == 422
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_criar_reserva_quarto_indisponivel(
    db, usuario, quarto, payload
):
    reserva_existente = SimpleNamespace(id=uuid.uuid4())
    db.scalar.side_effect = [quarto, reserva_existente]

    with pytest.raises(HTTPException) as erro:
        criar_reserva(payload, db, usuario)

    assert erro.value.status_code == 409
    assert "indisponível" in erro.value.detail
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_usuario_nao_consulta_reserva_de_outra_pessoa(
    db, usuario
):
    reserva = SimpleNamespace(
        id=uuid.uuid4(),
        usuario_id=uuid.uuid4(),
    )
    db.scalar.return_value = reserva

    with pytest.raises(HTTPException) as erro:
        obter_reserva(reserva.id, db, usuario)

    assert erro.value.status_code == 404


def test_administrador_pode_consultar_reserva_alheia(db):
    admin = SimpleNamespace(
        id=uuid.uuid4(),
        is_admin=True,
    )
    reserva = SimpleNamespace(
        id=uuid.uuid4(),
        usuario_id=uuid.uuid4(),
    )
    db.scalar.return_value = reserva

    resultado = obter_reserva(reserva.id, db, admin)

    assert resultado is reserva


def test_listar_reservas_filtra_por_usuario(db, usuario):
    reservas = [SimpleNamespace(id=uuid.uuid4())]
    db.scalars.return_value.all.return_value = reservas

    resultado = listar_reservas(db, usuario)

    assert resultado == reservas
    db.scalars.assert_called_once()


def test_cancelar_reserva_atualiza_status(db, usuario):
    reserva = SimpleNamespace(
        id=uuid.uuid4(),
        usuario_id=usuario.id,
        status="Confirmada",
    )
    db.scalar.return_value = reserva

    resultado = cancelar_reserva(reserva.id, db, usuario)

    assert resultado.status == "Cancelada"
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(reserva)


def test_cancelar_reserva_ja_cancelada_nao_repete_commit(
    db, usuario
):
    reserva = SimpleNamespace(
        id=uuid.uuid4(),
        usuario_id=usuario.id,
        status="Cancelada",
    )
    db.scalar.return_value = reserva

    resultado = cancelar_reserva(reserva.id, db, usuario)

    assert resultado.status == "Cancelada"
    db.commit.assert_not_called()
