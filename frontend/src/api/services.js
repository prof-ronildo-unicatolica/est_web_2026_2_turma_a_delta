/**
 * Contrato de API consumido pelo front (todos os caminhos relativos a /api/v1).
 * Centralizado aqui: se o backend usar outro nome de rota, ajuste apenas este arquivo.
 *
 *  Auth      POST /auth/register · POST /auth/login · GET /auth/me
 *  Público   GET /cidades · GET /hoteis/{id} · GET /busca · GET /hoteis/{id}/tarifas-temporada
 *            GET /servicos-adicionais · GET /comodidades
 *  Reservas  POST /reservas (202) · GET /reservas · GET /reservas/{id} · POST /reservas/{id}/cancelar
 *  Admin     POST|PUT|DELETE /cidades[/{id}] · POST|PUT|DELETE /hoteis[/{id}]  (is_admin)
 */
import { api, ApiError } from './http'

// Catálogos auxiliares podem ainda não existir no backend (sprints futuras): não quebram a tela.
async function opcional(promise) {
  try {
    return await promise
  } catch (err) {
    if (err instanceof ApiError && [404, 405, 501].includes(err.status)) return []
    throw err
  }
}

export const healthApi = {
  check: () => api.get('/health', { auth: false }),
}

export const authApi = {
  login: (email, senha) => api.post('/auth/login', { email, senha }, { auth: false }),
  register: (nome, email, senha) => api.post('/auth/register', { nome, email, senha }, { auth: false }),
  me: () => api.get('/auth/me'),
}

export const catalogoApi = {
  cidades: () => api.get('/cidades', { auth: false }),
  hoteis: () => api.get('/hoteis', { auth: false }),
  hotel: (id) => api.get(`/hoteis/${id}`, { auth: false }),
  buscar: (params) => api.get('/busca', { params, auth: false }),
  tarifas: (hotelId) => opcional(api.get(`/hoteis/${hotelId}/tarifas-temporada`, { auth: false })),
  servicos: () => opcional(api.get('/servicos-adicionais', { auth: false })),
  comodidades: () => opcional(api.get('/comodidades', { auth: false })),
}

export const reservasApi = {
  criar: (payload) => api.post('/reservas', payload),
  listar: () => api.get('/reservas'),
  obter: (id) => api.get(`/reservas/${id}`),
  cancelar: (id) => api.post(`/reservas/${id}/cancelar`, {}),
}

export const adminApi = {
  cidades: {
    criar: (v) => api.post('/cidades', v),
    atualizar: (id, v) => api.put(`/cidades/${id}`, v),
    remover: (id) => api.del(`/cidades/${id}`),
  },
  hoteis: {
    criar: (v) => api.post('/hoteis', v),
    atualizar: (id, v) => api.put(`/hoteis/${id}`, v),
    remover: (id) => api.del(`/hoteis/${id}`),
  },
}
