// Camada única de acesso a dados do frontend.
//
// O backend (apps/services/core-service) já expõe /api/v1/auth e
// /api/v1/reservas (login, registro e o CRUD de reservas). Essas funções
// chamam a API real e propagam qualquer erro (401, 404, 409, 422...) para
// quem chamou — não há fallback mock para login/reservas, pois o usuário
// precisa ver o erro de verdade (ex.: "quarto indisponível", "senha
// incorreta").
//
// As rotas de catálogo (hotéis por id, quartos por hotel, avaliações)
// ainda não existem no backend, então essas funções continuam com o
// padrão antigo: tentam a rota REST documentada no comentário e, se
// falhar, caem para os dados de apps/frontend/src/mocks/data.js.

import {
  cidadesMock,
  comodidadesMock,
  hoteisMock,
  quartosMock,
  avaliacoesMock,
} from '../mocks/data'

export const API_BASE_URL = 'http://localhost:8000/api/v1'

// --- Sessão (JWT emitido por POST /auth/login) ------------------------
// As rotas de auth e de reservas já existem no backend, então essas duas
// áreas conversam com a API de verdade (sem fallback mock): um erro aqui
// (401, 409, 422...) deve aparecer para quem está usando o app.
const TOKEN_KEY = 'rede-hoteleira:token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function extrairErro(res, fallback) {
  try {
    const dados = await res.json()
    return dados?.detail || fallback
  } catch {
    return fallback
  }
}

async function getJson(path, { autenticado = false } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: autenticado ? authHeaders() : {},
  })
  if (!res.ok) {
    throw new Error(await extrairErro(res, `GET ${path} -> ${res.status}`))
  }
  return res.json()
}

async function sendJson(path, method, body, { autenticado = false } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(autenticado ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(await extrairErro(res, `${method} ${path} -> ${res.status}`))
  }
  return res.json()
}

// POST /api/v1/auth/login
export async function login({ email, senha }) {
  const dados = await sendJson('/auth/login', 'POST', { email, senha })
  setToken(dados.access_token)
  return dados
}

// POST /api/v1/auth/register
export async function registrar({ nome, email, senha }) {
  return sendJson('/auth/register', 'POST', { nome, email, senha })
}

// GET /api/v1/cidades
export async function listarCidades() {
  try {
    return await getJson('/cidades')
  } catch {
    return cidadesMock
  }
}

// GET /api/v1/comodidades
export async function listarComodidades() {
  try {
    return await getJson('/comodidades')
  } catch {
    return comodidadesMock
  }
}

// GET /api/v1/hoteis?cidade_id=&estrelas_min=&busca=
export async function listarHoteis(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros)
    return await getJson(`/hoteis?${params.toString()}`)
  } catch {
    let resultado = hoteisMock
    if (filtros.cidade_id) {
      resultado = resultado.filter((h) => h.cidade_id === filtros.cidade_id)
    }
    if (filtros.estrelas_min) {
      resultado = resultado.filter((h) => h.categoria_estrelas >= Number(filtros.estrelas_min))
    }
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase()
      resultado = resultado.filter((h) => h.nome.toLowerCase().includes(termo))
    }
    return resultado
  }
}

// GET /api/v1/hoteis/{id}
export async function obterHotel(hotelId) {
  try {
    return await getJson(`/hoteis/${hotelId}`)
  } catch {
    return hoteisMock.find((h) => h.id === hotelId) || null
  }
}

// GET /api/v1/hoteis/{id}/quartos
export async function listarQuartosPorHotel(hotelId) {
  try {
    return await getJson(`/hoteis/${hotelId}/quartos`)
  } catch {
    return quartosMock.filter((q) => q.hotel_id === hotelId)
  }
}

// GET /api/v1/hoteis/{id}/avaliacoes
export async function listarAvaliacoesPorHotel(hotelId) {
  try {
    return await getJson(`/hoteis/${hotelId}/avaliacoes`)
  } catch {
    return avaliacoesMock.filter((a) => a.hotel_id === hotelId)
  }
}

// GET /api/v1/auth/me — retorna null se não houver sessão ativa.
export async function obterUsuarioAtual() {
  if (!getToken()) return null
  try {
    return await getJson('/auth/me', { autenticado: true })
  } catch {
    logout()
    return null
  }
}

// GET /api/v1/reservas — o backend filtra automaticamente pelo usuário
// autenticado a partir do token (o parâmetro é mantido só por
// compatibilidade com quem já chamava esta função com um id).
export async function listarReservasDoUsuario() {
  return getJson('/reservas', { autenticado: true })
}

// GET /api/v1/reservas/{id}
export async function obterReserva(reservaId) {
  return getJson(`/reservas/${reservaId}`, { autenticado: true })
}

// POST /api/v1/reservas
export async function criarReserva(payload) {
  return sendJson('/reservas', 'POST', payload, { autenticado: true })
}

// PATCH /api/v1/reservas/{id}/cancelar
export async function cancelarReserva(reservaId) {
  return sendJson(`/reservas/${reservaId}/cancelar`, 'PATCH', {}, { autenticado: true })
}

// Utilitário de cálculo de diária usado no formulário de reserva.
// Réplica simplificada da regra que o backend deverá aplicar (ver
// TarifaTemporada.multiplicador em app/models/tarifa_temporada.py).
export function calcularValorTotal({ precoDiaria, dataCheckin, dataCheckout }) {
  const inicio = new Date(dataCheckin)
  const fim = new Date(dataCheckout)
  const diarias = Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)))
  return { diarias, valorTotal: Number((diarias * precoDiaria).toFixed(2)) }
}
