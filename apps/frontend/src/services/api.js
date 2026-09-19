// Camada única de acesso a dados do frontend.
//
// Hoje (Sprint atual) o backend (apps/services/core-service) só expõe
// /api/v1/auth, /api/v1/health e /api/v1/sobre — as rotas de domínio
// (hotéis, quartos, reservas, cidades) ainda não existem, embora os modelos
// já estejam em app/models/*.py.
//
// Para não travar o desenvolvimento do frontend, cada função abaixo:
//   1. tenta chamar o endpoint REST esperado (documentado no comentário);
//   2. se a chamada falhar (404, rede indisponível, etc.), usa os dados de
//      apps/frontend/src/mocks/data.js como fallback.
//
// Quando o time do backend implementar a rota real, BASTA apagar o
// try/catch correspondente (ou deixar como está — ele já vai parar de cair
// no fallback assim que o endpoint responder 2xx).

import {
  cidadesMock,
  comodidadesMock,
  hoteisMock,
  quartosMock,
  avaliacoesMock,
  usuarioAtualMock,
  reservasMock,
  adicionarReservaMock,
  atualizarStatusReservaMock,
} from '../mocks/data'

export const API_BASE_URL = 'http://localhost:8000/api/v1'

async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
  return res.json()
}

async function sendJson(path, method, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
  return res.json()
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

// GET /api/v1/usuarios/me  (depende de app/api/v1/auth.py)
export async function obterUsuarioAtual() {
  try {
    return await getJson('/usuarios/me')
  } catch {
    return usuarioAtualMock
  }
}

// GET /api/v1/usuarios/{id}/reservas
export async function listarReservasDoUsuario(usuarioId) {
  try {
    return await getJson(`/usuarios/${usuarioId}/reservas`)
  } catch {
    return reservasMock.filter((r) => r.usuario_id === usuarioId)
  }
}

// POST /api/v1/reservas
export async function criarReserva(payload) {
  try {
    return await sendJson('/reservas', 'POST', payload)
  } catch {
    const novaReserva = {
      id: `res-${Date.now()}`,
      status: 'Pendente',
      valor_multa_cancelamento: 0,
      quantidade_criancas: 0,
      quantidade_bebes: 0,
      early_checkin: false,
      late_checkout: false,
      necessita_berco: false,
      tarifa_tipo: 'Reembolsavel',
      ...payload,
    }
    return adicionarReservaMock(novaReserva)
  }
}

// PATCH /api/v1/reservas/{id}/cancelar
export async function cancelarReserva(reservaId) {
  try {
    return await sendJson(`/reservas/${reservaId}/cancelar`, 'PATCH', {})
  } catch {
    return atualizarStatusReservaMock(reservaId, 'Cancelada')
  }
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
