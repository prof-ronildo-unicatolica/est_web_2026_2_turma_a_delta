import { delay } from './apiClient'
import { mockReservas, STATUS_RESERVA } from '../data/mockData'

// "Banco" em memória para as reservas criadas durante a sessão do navegador.
const reservasEmMemoria = [...mockReservas]

/**
 * TODO: quando o backend implementar o fluxo real (POST /api/v1/reservas
 * publicando na fila "solicitacoes-reserva" do RabbitMQ, worker validando
 * e o GET /api/v1/reservas/{id} refletindo o status atualizado), troque
 * as duas funções abaixo por chamadas via apiFetch, mantendo a mesma
 * assinatura. O restante da tela de Checkout/Processando não muda,
 * pois o polling já está implementado do lado do front (ver
 * src/pages/ProcessandoReservaPage.jsx).
 */

export async function criarReserva(payload) {
  // TODO: substituir por chamada real -> POST /api/v1/reservas (retorna HTTP 202 + status "Pendente")
  await delay(300)
  const novaReserva = {
    id: `reserva-${Math.random().toString(36).slice(2, 8)}`,
    status: STATUS_RESERVA.PENDENTE,
    avaliada: false,
    ...payload,
  }
  reservasEmMemoria.unshift(novaReserva)

  // Simula o worker assíncrono: depois de ~4s decide aleatoriamente
  // (com alta probabilidade de sucesso) se a reserva é confirmada.
  setTimeout(() => {
    const reserva = reservasEmMemoria.find((r) => r.id === novaReserva.id)
    if (reserva) {
      reserva.status = Math.random() < 0.9 ? STATUS_RESERVA.CONFIRMADA : STATUS_RESERVA.CANCELADA
    }
  }, 4000)

  return novaReserva
}

export async function consultarReserva(reservaId) {
  // TODO: substituir por chamada real -> GET /api/v1/reservas/{id}
  await delay(150)
  const reserva = reservasEmMemoria.find((r) => r.id === reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  return reserva
}

export async function listarMinhasReservas(usuarioEmail) {
  // TODO: substituir por chamada real -> GET /api/v1/reservas?usuario=me
  await delay(400)
  return reservasEmMemoria.filter((r) => r.usuarioEmail === usuarioEmail)
}

export async function cancelarReserva(reservaId) {
  // TODO: substituir por chamada real -> POST /api/v1/reservas/{id}/cancelar
  await delay(400)
  const reserva = reservasEmMemoria.find((r) => r.id === reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  reserva.status = STATUS_RESERVA.CANCELADA
  return reserva
}

export async function avaliarHotel(reservaId, { nota, comentario }) {
  // TODO: substituir por chamada real -> POST /api/v1/avaliacoes
  await delay(400)
  const reserva = reservasEmMemoria.find((r) => r.id === reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  reserva.avaliada = true
  return { reservaId, nota, comentario }
}
