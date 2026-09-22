# Entrega Sprints 1–8 — Sistema de Reservas Hoteleiras

## Fluxo final
Login/Cadastro → JWT/RBAC → catálogo → quartos → busca MongoDB → preview de preço → reserva `202 Pendente` → RabbitMQ → Reservation Worker → Confirmada/Cancelada → Minhas Reservas → Cancelamento → Auditoria MongoDB.

## Checklist
- [x] S1 Docker/PostgreSQL/MongoDB/RabbitMQ, modelos e Alembic.
- [x] S2 bcrypt + JWT + `get_current_user` + `get_current_admin` + register/login/me.
- [x] S3 Cidade/Hotel/Comodidade, relações e CRUD administrativo.
- [x] S4 Quarto, projeção `catalogo_hoteis` e busca pública no MongoDB.
- [x] S5 cálculo centralizado de preço e testes das regras principais.
- [x] S6 Reserva pendente, fila `solicitacoes-reserva`, worker e serialização por quarto.
- [x] S7 minhas reservas e autorização por proprietário.
- [x] S8 cancelamento via POST, regra de 48h, multa de diária/100% e auditoria.

## Comandos
```bash
docker compose up -d --build

docker compose ps

docker compose logs -f core-service reservation-worker audit-worker
```

API: `http://localhost:8000/docs`
Frontend: `http://localhost:5173`
RabbitMQ: `http://localhost:15672`

Admin inicial criado pelo seed PostgreSQL:
- e-mail: `admin@hotel.com`
- senha: `admin123`

> Troque a senha e `JWT_SECRET_KEY` antes de qualquer uso fora do ambiente acadêmico/local.

## Testes
O PostgreSQL de testes é `hotel_db_test`. Em ambiente limpo ele é criado por `docker/postgres/init/01-create-test-db.sql`.

```bash
docker compose exec core-service poetry run pytest -q
```

## Evidências importantes para a apresentação
1. Cadastro e login retornam JWT.
2. Usuário comum recebe 403 ao acessar rota administrativa.
3. Busca de hotéis consulta `catalogo_hoteis` no MongoDB.
4. `POST /api/v1/reservas` retorna 202 e status Pendente.
5. RabbitMQ mostra a mensagem em `solicitacoes-reserva`.
6. Worker muda Pendente para Confirmada ou Cancelada.
7. Dois pedidos simultâneos para o mesmo quarto não são confirmados juntos.
8. `POST /api/v1/reservas/{id}/cancelar` calcula a multa.
9. MongoDB contém `historico_auditoria`.
