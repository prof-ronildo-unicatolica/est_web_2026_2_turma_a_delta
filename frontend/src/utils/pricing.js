/**
 * Motor de precificação do front (Sprint 5) — ESPELHA a regra do backend
 * (reserva_service.calcular_preco_final). Se a regra mudar lá, mude aqui.
 *
 * Regras (RFO07, RFO08, RFO09, RFO10):
 *  - diária = preço base do quarto × multiplicador da TarifaTemporada que cobre a noite (RFO08);
 *  - bebê (0–5 anos): grátis; não conta na capacidade (RFO07);
 *  - criança (6–12): 50% da diária da noite, por criança, por noite (RFO07);
 *  - Early check-in / Late checkout: +30% de UMA diária base cada (RFO09);
 *  - serviços adicionais: preço × quantidade;
 *  - tarifa Não Reembolsável: −10% sobre o total (RFO10).
 * Todo o cálculo é feito em CENTAVOS (inteiros) e arredondado por componente,
 * para o total bater ao centavo com o do backend.
 */
export const TARIFA = { REEMBOLSAVEL: 'Reembolsavel', NAO_REEMBOLSAVEL: 'Nao Reembolsavel' }

export const REGRAS = {
  PERCENTUAL_CRIANCA: 0.5,
  PERCENTUAL_EARLY_LATE: 0.3,
  DESCONTO_NAO_REEMBOLSAVEL: 0.1,
  ANTECEDENCIA_CANCELAMENTO_DIAS: 2, // 48h
}

const DAY = 86400000
const pad = (n) => String(n).padStart(2, '0')

export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
export const toISO = (ms) => {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
export const addDays = (iso, n) => toISO(parseISO(iso) + n * DAY)
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / DAY)

const toCents = (reais) => Math.round(Number(reais) * 100)
const toReais = (cents) => cents / 100

export function tarifaNaData(dataISO, tarifas = []) {
  return tarifas.find((t) => t.data_inicio <= dataISO && dataISO <= t.data_fim) || null
}

/** Data limite para cancelar sem multa: check-in − 48h (só tarifa reembolsável). */
export function dataLimiteCancelamento(checkin, tarifaTipo) {
  if (!checkin || tarifaTipo === TARIFA.NAO_REEMBOLSAVEL) return null
  return addDays(checkin, -REGRAS.ANTECEDENCIA_CANCELAMENTO_DIAS)
}

/**
 * @param servicos [{ servico: {id, nome, preco}, quantidade }]
 * @returns null se as datas forem inválidas; senão o orçamento detalhado (valores em R$).
 */
export function calcularOrcamento({
  quarto,
  checkin,
  checkout,
  criancas = 0,
  earlyCheckin = false,
  lateCheckout = false,
  tarifaTipo = TARIFA.REEMBOLSAVEL,
  tarifas = [],
  servicos = [],
}) {
  if (!quarto || !checkin || !checkout) return null
  const noites = diffDays(checkin, checkout)
  if (!(noites > 0)) return null

  const base = toCents(quarto.preco_diaria)

  const detalhe = []
  for (let i = 0; i < noites; i += 1) {
    const data = addDays(checkin, i)
    const tarifa = tarifaNaData(data, tarifas)
    const multiplicador = tarifa ? Number(tarifa.multiplicador) : 1
    detalhe.push({ data, tarifa, multiplicador, valor: Math.round(base * multiplicador) })
  }

  // Agrupa noites consecutivas com a mesma diária (para exibir "3 noites × R$ 260,00")
  const grupos = []
  detalhe.forEach((n) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.valor === n.valor && ultimo.tarifa?.id === n.tarifa?.id) ultimo.noites += 1
    else grupos.push({ noites: 1, valor: n.valor, tarifa: n.tarifa, multiplicador: n.multiplicador })
  })

  const diarias = detalhe.reduce((s, n) => s + n.valor, 0)
  const porCrianca = detalhe.reduce((s, n) => s + Math.round(n.valor * REGRAS.PERCENTUAL_CRIANCA), 0)
  const taxaCriancas = porCrianca * criancas
  const early = earlyCheckin ? Math.round(base * REGRAS.PERCENTUAL_EARLY_LATE) : 0
  const late = lateCheckout ? Math.round(base * REGRAS.PERCENTUAL_EARLY_LATE) : 0

  const itensServico = servicos
    .filter((s) => s.quantidade > 0)
    .map((s) => ({
      id: s.servico.id,
      nome: s.servico.nome,
      quantidade: s.quantidade,
      total: toCents(s.servico.preco) * s.quantidade,
    }))
  const totalServicos = itensServico.reduce((s, i) => s + i.total, 0)

  const subtotal = diarias + taxaCriancas + early + late + totalServicos
  const desconto =
    tarifaTipo === TARIFA.NAO_REEMBOLSAVEL ? Math.round(subtotal * REGRAS.DESCONTO_NAO_REEMBOLSAVEL) : 0
  const total = subtotal - desconto

  return {
    noites,
    base: toReais(base),
    grupos: grupos.map((g) => ({ ...g, valor: toReais(g.valor) })),
    diarias: toReais(diarias),
    taxaCriancas: toReais(taxaCriancas),
    early: toReais(early),
    late: toReais(late),
    servicos: itensServico.map((i) => ({ ...i, total: toReais(i.total) })),
    totalServicos: toReais(totalServicos),
    subtotal: toReais(subtotal),
    desconto: toReais(desconto),
    total: toReais(total),
    dataLimiteCancelamento: dataLimiteCancelamento(checkin, tarifaTipo),
  }
}

/**
 * Sprint 8 — prévia do cancelamento (RFO10), usada para avisar a multa ANTES de confirmar.
 * O valor definitivo da multa é sempre o devolvido pelo backend.
 * Cenários: 'gratuito' | 'tardio' (1 diária) | 'nao_reembolsavel' (100%).
 */
export function simularCancelamento(reserva, hojeISO) {
  const total = Number(reserva.valor_total) || 0
  if (reserva.tarifa_tipo === TARIFA.NAO_REEMBOLSAVEL) {
    return { cenario: 'nao_reembolsavel', multa: total }
  }
  const limite = reserva.data_limite_cancelamento || dataLimiteCancelamento(reserva.data_checkin, reserva.tarifa_tipo)
  if (!limite || hojeISO <= limite) return { cenario: 'gratuito', multa: 0, limite }
  const diaria = reserva.preco_diaria != null ? Number(reserva.preco_diaria) : null
  return { cenario: 'tardio', multa: diaria, limite }
}
