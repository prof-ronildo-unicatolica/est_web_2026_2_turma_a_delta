# Frontend — Equipe Delta (Rede Hoteleira)

Este frontend foi construído a partir do boilerplate do monorepo
(`Main`/`estagio-desenvolvimento-web-main`), mantendo a stack **React +
Vite + Bootstrap 5** e adicionando o fluxo de telas do **Sistema de
Reservas de Rede Hoteleira**, conforme especificado em
`docs/03_arquitetura_tecnica/arquitetura_frontend.md`.

## O que foi feito

1. **Roteamento** com `react-router-dom` (novo — precisa `npm install`).
2. **Autenticação real** (`src/services/authService.js`): usa os
   endpoints que já existem no backend (`POST /auth/login`,
   `GET /auth/me`). Usuários de demonstração:
   - `admin@hotel.com` / `admin123` (administrador)
   - `cliente@hotel.com` / `cliente123` (cliente)
3. **Dados de hotéis/quartos/reservas/admin: MOCK.** O backend ainda não
   expõe rotas para essas entidades (só existem os *models* no banco).
   Todos os dados ficam em `src/data/mockData.js` e são consumidos pelos
   serviços em `src/services/*.js`. Cada função de serviço tem um
   comentário `// TODO: substituir por chamada real -> <verbo> <rota>`
   indicando exatamente onde plugar a API assim que ela existir — a
   assinatura da função não muda, então as páginas não precisam ser
   tocadas.
4. **Todas as telas do fluxo** descrito no documento de arquitetura:
   - Login / Cadastro (`/login`)
   - Home / Busca (`/`)
   - Listagem de hotéis (`/hoteis`)
   - Detalhe do hotel e quartos (`/hoteis/:hotelId`)
   - Checkout com cálculo dinâmico de preço (`/checkout/:quartoId`)
   - Processamento com *short polling* simulado (`/reservas/:id/processando`)
   - Voucher de sucesso (`/reservas/:id/sucesso`)
   - Minhas Reservas, com cancelamento e avaliação (`/minhas-reservas`)
   - Painel Administrativo com CRUDs de Cidades, Hotéis, Quartos, Tarifas
     de Temporada, Comodidades e Auditoria (`/admin/*`)
   - `/tutorial`: a demonstração original do boilerplate (Sobre/Disciplinas)
     foi preservada aqui, para não perder os componentes de exemplo.

## Como rodar

```bash
cd apps/frontend
npm install   # instala também react-router-dom, adicionado ao package.json
npm run dev
```

## Próximos passos sugeridos para a equipe

- Implementar no `core-service` as rotas reais de `cidades`, `hoteis`,
  `quartos`, `reservas`, `tarifas-temporada`, `comodidades` e
  `avaliacoes` (os *models* SQLAlchemy já existem em `app/models/`).
- Trocar as funções mock em `src/services/hoteisService.js`,
  `reservasService.js` e `adminService.js` pelas chamadas reais via
  `apiFetch` (`src/services/apiClient.js`), mantendo as assinaturas.
- Implementar JWT de verdade no backend (Atividade da Sprint 2) — o
  frontend já está pronto para isso, pois já envia
  `Authorization: Bearer <token>` em todas as chamadas autenticadas.
