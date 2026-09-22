import { delay } from './apiClient'
import {
  mockHoteis,
  mockCidades,
  getHotelById,
  getQuartosByHotelId,
  getComodidadesByIds,
} from '../data/mockData'

/**
 * Camada de serviço de Hotéis.
 *
 * Hoje todas as funções abaixo usam `mockData.js`. Quando o backend
 * expuser as rotas reais, basta substituir o corpo de cada função pela
 * chamada equivalente via `apiFetch`, mantendo a MESMA assinatura para
 * não quebrar as páginas que já consomem este serviço. Exemplo de troca:
 *
 *   export async function listarCidades() {
 *     return apiFetch('/cidades')
 *   }
 */

export async function listarCidades() {
  // TODO: substituir por chamada real -> GET /api/v1/cidades
  await delay(200)
  return mockCidades
}

export async function buscarHoteis({ cidadeId, estrelasMin, checkin, checkout } = {}) {
  // TODO: substituir por chamada real -> GET /api/v1/hoteis?cidade_id=&estrelas_min=&checkin=&checkout=
  await delay(500)
  return mockHoteis.filter((hotel) => {
    if (cidadeId && hotel.cidadeId !== cidadeId) return false
    if (estrelasMin && hotel.estrelas < estrelasMin) return false
    return true
  })
}

export async function obterHotel(hotelId) {
  // TODO: substituir por chamada real -> GET /api/v1/hoteis/{id}
  await delay(400)
  const hotel = getHotelById(hotelId)
  if (!hotel) throw new Error('Hotel não encontrado')
  return {
    ...hotel,
    comodidadesDetalhadas: getComodidadesByIds(hotel.comodidades),
  }
}

export async function listarQuartosDoHotel(hotelId) {
  // TODO: substituir por chamada real -> GET /api/v1/hoteis/{id}/quartos
  await delay(400)
  return getQuartosByHotelId(hotelId)
}
