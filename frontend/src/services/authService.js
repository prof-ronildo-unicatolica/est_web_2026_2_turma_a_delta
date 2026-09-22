import { apiFetch, setStoredToken } from './apiClient'

/**
 * Estes três endpoints (login, me, admin/verificacao) JÁ EXISTEM no
 * core-service (versão básica, ver app/api/v1/auth.py), então aqui
 * chamamos a API de verdade em vez de usar mock.
 *
 * Usuários de demonstração cadastrados no backend:
 *   admin@hotel.com   / admin123   (is_admin = true)
 *   cliente@hotel.com / cliente123 (is_admin = false)
 */

export async function login(email, senha) {
  const { access_token: token } = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, senha },
  })
  setStoredToken(token)
  const usuario = await apiFetch('/auth/me')
  return usuario
}

export function logout() {
  setStoredToken(null)
}

export async function getUsuarioAtual() {
  return apiFetch('/auth/me')
}

// TODO: quando existir POST /auth/cadastro no backend, trocar este mock
// pela chamada real. Por enquanto simulamos um cadastro bem-sucedido
// para não travar o fluxo de UI (a atividade real é da Sprint 2 - JWT).
export async function cadastrar({ nome, email, senha }) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return { nome, email, is_admin: false }
}
