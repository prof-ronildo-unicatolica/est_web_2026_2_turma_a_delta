
export const TARIFA = {
  REEMBOLSAVEL: 'Reembolsavel',
  NAO_REEMBOLSAVEL: 'Nao Reembolsavel',
}

export const REGRAS = { ANTECEDENCIA_CANCELAMENTO_DIAS: 2 }

const DAY = 86400000
const pad = (n) => String(n).padStart(2, '0')

export const parseISO = (s) => {
  const [year, month, day] = s.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}
export const toISO = (ms) => {
  const date = new Date(ms)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}
export const addDays = (iso, n) => toISO(parseISO(iso) + n * DAY)
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / DAY)

export function tarifaNaData(dataISO, tarifas = []) {
  return tarifas.find((tarifa) => tarifa.data_inicio <= dataISO && dataISO <= tarifa.data_fim) || null
}

export function dataLimiteCancelamento(checkin, tarifaTipo) {
  if (!checkin || tarifaTipo === TARIFA.NAO_REEMBOLSAVEL) return null
  return addDays(checkin, -REGRAS.ANTECEDENCIA_CANCELAMENTO_DIAS)
}

export function calcularOrcamento({ quarto, checkin, checkout, tarifaTipo = TARIFA.REEMBOLSAVEL }) {
  if (!quarto || !checkin || !checkout) return null
  const noites = diffDays(checkin, checkout)
  if (!(noites > 0)) return null

  const base = Number(quarto.preco_diaria)
  const total = base * noites

  return {
    noites,
    base,
    grupos: [{ noites, valor: base, tarifa: null, multiplicador: 1 }],
    diarias: total,
    taxaCriancas: 0,
    early: 0,
    late: 0,
    servicos: [],
    totalServicos: 0,
    subtotal: total,
    desconto: 0,
    total,
    dataLimiteCancelamento: dataLimiteCancelamento(checkin, tarifaTipo),
  }
}


export function simularCancelamento() {
  return { cenario: 'sem_calculo_no_backend', multa: 0, limite: null }
}
