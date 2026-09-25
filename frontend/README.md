# Frontend — Sistema de Reservas de Rede Hoteleira

React 18 + Vite + Bootstrap 5. Sem dependências além das já listadas em `package.json`
(o roteador é próprio, em `src/router`, com API parecida com a do react-router).

```bash
npm install
npm run dev        # http://localhost:5173  (proxy /api -> http://localhost:8000)
npm run build
```

Variáveis: `VITE_API_URL` (padrão `/api/v1`) e `VITE_PROXY_TARGET` (alvo do proxy no `npm run dev`).
Com `docker compose up`, o nginx do container repassa `/api/` ao `core-service`.

## Estrutura

| Pasta | Responsabilidade |
| :-- | :-- |
| `src/api/http.js` | Cliente HTTP: baseURL, `Authorization: Bearer`, tratamento de 401 |
| `src/api/services.js` | **Contrato de API** (todos os caminhos em um só lugar) |
| `src/auth/` | Login/cadastro, token, guarda de rotas (cliente × admin) |
| `src/router/` | Roteador (Router, Routes, Link, NavLink, hooks) |
| `src/utils/pricing.js` | Cálculo de preço e prévia de multa (espelha `reserva_service`) |
| `src/pages/` | Telas: Home, Detalhes, Checkout, Status/Voucher, Minhas Reservas, Login, Admin |

## Rotas

| Rota | Acesso |
| :-- | :-- |
| `/`, `/hoteis/:id`, `/login` | Público |
| `/checkout`, `/reservas/:id`, `/minhas-reservas` | Cliente autenticado (JWT) |
| `/admin/*` | JWT + `is_admin` (cliente vê 403) |

## Endpoints esperados da API

`POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /cidades`, `GET /hoteis`,
`GET /hoteis/{id}`, `GET /busca`, `GET /hoteis/{id}/tarifas-temporada`, `GET /servicos-adicionais`,
`GET /comodidades`, `POST /reservas` (202), `GET /reservas`, `GET /reservas/{id}`,
`POST /reservas/{id}/cancelar`, e `POST|PUT|DELETE` em `/cidades` e `/hoteis` (admin).
Se o backend usar outros nomes, altere só `src/api/services.js`.
