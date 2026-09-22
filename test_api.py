from app.models.usuario import Usuario
from app.core.security import hash_password


def test_health_returns_200(client):
    response = client.get('/api/v1/health')
    assert response.status_code == 200


def test_register_login_and_me(client):
    register = client.post('/api/v1/auth/register', json={
        'nome': 'Hóspede Teste', 'email': 'hospede@test.com', 'senha': 'SenhaSegura123'
    })
    assert register.status_code == 201
    assert register.json()['is_admin'] is False

    login = client.post('/api/v1/auth/login', json={
        'email': 'hospede@test.com', 'senha': 'SenhaSegura123'
    })
    assert login.status_code == 200
    token = login.json()['access_token']

    me = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me.status_code == 200
    assert me.json()['email'] == 'hospede@test.com'


def test_admin_guard_returns_403_for_common_user(client):
    client.post('/api/v1/auth/register', json={
        'nome': 'Cliente', 'email': 'cliente@test.com', 'senha': 'SenhaSegura123'
    })
    login = client.post('/api/v1/auth/login', json={
        'email': 'cliente@test.com', 'senha': 'SenhaSegura123'
    })
    token = login.json()['access_token']
    response = client.get('/api/v1/auth/admin/verificacao', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 403


def test_admin_guard_allows_admin(client, db_session):
    admin = Usuario(nome='Admin', email='admin-test@test.com', senha_hash=hash_password('SenhaSegura123'), is_admin=True)
    db_session.add(admin); db_session.commit()
    login = client.post('/api/v1/auth/login', json={'email': 'admin-test@test.com', 'senha': 'SenhaSegura123'})
    token = login.json()['access_token']
    response = client.get('/api/v1/auth/admin/verificacao', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
