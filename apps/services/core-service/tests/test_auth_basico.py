from datetime import datetime, timedelta, timezone

import jwt
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.config import settings


def test_hash_e_verify_password():
    senha = "SenhaSegura123!"
    senha_hash = hash_password(senha)

    assert senha_hash != senha
    assert verify_password(senha, senha_hash) is True
    assert verify_password("senha-errada", senha_hash) is False


def test_create_e_decode_token():
    token = create_access_token("00000000-0000-0000-0000-000000000001")
    payload = decode_token(token)

    assert payload["sub"] == "00000000-0000-0000-0000-000000000001"
    assert "exp" in payload
    assert "iat" in payload


def test_token_expirado_e_rejeitado():
    token = jwt.encode(
        {
            "sub": "00000000-0000-0000-0000-000000000001",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    try:
        decode_token(token)
        assert False, "Token expirado deveria ser rejeitado"
    except jwt.ExpiredSignatureError:
        pass
