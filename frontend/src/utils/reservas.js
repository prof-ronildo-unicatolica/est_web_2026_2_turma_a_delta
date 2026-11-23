import { loadReservaSnapshot, normalizeReserva } from './catalog'


export function enriquecerReserva(reserva) {
  const normalizada = normalizeReserva(reserva)
  if (normalizada.hotel_nome && normalizada.quarto_numero) return normalizada
  const snapshot = loadReservaSnapshot(normalizada.id)
  if (!snapshot) return normalizada
  return {
    ...normalizada,
    hotel_id: normalizada.hotel_id ?? snapshot.hotel_id,
    hotel_nome: normalizada.hotel_nome ?? snapshot.hotel_nome,
    quarto_numero: normalizada.quarto_numero ?? snapshot.quarto_numero,
    quarto_tipo: normalizada.quarto_tipo ?? snapshot.quarto_tipo,
    preco_diaria: normalizada.preco_diaria ?? snapshot.preco_diaria,
  }
}

export function removerValoresNulos(objeto) {
  return Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== null && valor !== undefined))
}

export function podeCancelarReserva(reserva, hoje) {
  return (reserva.status === 'Pendente' || reserva.status === 'Confirmada') && String(reserva.data_checkin).slice(0, 10) >= hoje
}
