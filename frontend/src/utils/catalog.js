/** Normalizadores: aceitam o formato do Mongo (`_id`, `quarto_id`) e o do Postgres (`id`). */

export const STATUS = { PENDENTE: 'Pendente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada' }

export const asList = (d) => (Array.isArray(d) ? d : d?.items ?? d?.results ?? d?.data ?? [])

export function normalizeQuarto(q) {
  return {
    id: q.quarto_id ?? q.id,
    numero: q.numero,
    tipo: q.tipo,
    preco_diaria: Number(q.preco_diaria),
    max_adultos: Number(q.max_adultos ?? 1),
    max_criancas: Number(q.max_criancas ?? 0),
  }
}

export function normalizeHotel(h) {
  const cidade = h.cidade
    ? typeof h.cidade === 'string'
      ? { id: h.cidade_id, nome: h.cidade, estado: '' }
      : { id: h.cidade.cidade_id ?? h.cidade.id ?? h.cidade_id, nome: h.cidade.nome, estado: h.cidade.estado }
    : null
  return {
    id: h._id ?? h.id ?? h.hotel_id,
    nome: h.nome,
    categoria_estrelas: Number(h.categoria_estrelas ?? 0),
    cidade,
    comodidades: (h.comodidades ?? []).map((c) => (typeof c === 'string' ? c : c.nome)),
    quartos: (h.quartos ?? []).map(normalizeQuarto),
    media_avaliacao: h.media_avaliacao ?? null,
  }
}

export const normalizeTarifa = (t) => ({
  id: t.id,
  nome: t.nome,
  data_inicio: String(t.data_inicio).slice(0, 10),
  data_fim: String(t.data_fim).slice(0, 10),
  multiplicador: Number(t.multiplicador),
})

export const normalizeServico = (s) => ({ id: s.id, nome: s.nome, preco: Number(s.preco) })

/** Achata a reserva vinda da API (campos do hotel/quarto podem vir aninhados ou soltos). */
export function normalizeReserva(r) {
  const quarto = r.quarto ?? {}
  const hotel = r.hotel ?? quarto.hotel ?? {}
  return {
    ...r,
    hotel_id: r.hotel_id ?? hotel.id ?? quarto.hotel_id ?? null,
    hotel_nome: r.hotel_nome ?? hotel.nome ?? null,
    quarto_numero: r.quarto_numero ?? quarto.numero ?? null,
    quarto_tipo: r.quarto_tipo ?? quarto.tipo ?? null,
    preco_diaria: r.preco_diaria ?? r.quarto_preco_diaria ?? quarto.preco_diaria ?? null,
    quantidade_bebes: r.quantidade_bebes ?? 0,
    quantidade_criancas: r.quantidade_criancas ?? 0,
    valor_multa_cancelamento: Number(r.valor_multa_cancelamento ?? 0),
  }
}

/* O voucher precisa do nome do hotel/quarto; guardamos um resumo no momento do checkout
   caso o GET /reservas/{id} não devolva esses campos. */
const snapKey = (id) => `hotel.reserva.${id}`
export function saveReservaSnapshot(id, data) {
  try {
    sessionStorage.setItem(snapKey(id), JSON.stringify(data))
  } catch {
    /* noop */
  }
}
export function loadReservaSnapshot(id) {
  try {
    return JSON.parse(sessionStorage.getItem(snapKey(id))) || null
  } catch {
    return null
  }
}
