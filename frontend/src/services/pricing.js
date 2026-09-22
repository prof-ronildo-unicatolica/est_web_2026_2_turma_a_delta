import { mockTarifasTemporada, mockServicosOpcionais } from '../data/mockData'

const MS_POR_DIA = 1000 * 60 * 60 * 24

export function calcularDiarias(checkin, checkout) {
  if (!checkin || !checkout) return 0
  const inicio = new Date(checkin)
  const fim = new Date(checkout)
  const diff = Math.round((fim - inicio) / MS_POR_DIA)
  return diff > 0 ? diff : 0
}

/** Retorna o multiplicador de alta temporada que incide sobre o período (o maior, se houver mais de um). */
export function obterMultiplicadorTemporada(checkin, checkout) {
  if (!checkin || !checkout) return { multiplicador: 1, tarifa: null }
  const inicio = new Date(checkin)
  const fim = new Date(checkout)

  const tarifaAplicavel = mockTarifasTemporada
    .filter((t) => new Date(t.inicio) <= fim && new Date(t.fim) >= inicio)
    .sort((a, b) => b.multiplicador - a.multiplicador)[0]

  return tarifaAplicavel
    ? { multiplicador: tarifaAplicavel.multiplicador, tarifa: tarifaAplicavel }
    : { multiplicador: 1, tarifa: null }
}

/**
 * Calcula o valor estimado da reserva no front-end, espelhando as regras
 * descritas em docs/03_arquitetura_tecnica/arquitetura_frontend.md (seção 3.4).
 *
 * @param {object} params
 * @param {object} params.quarto - quarto selecionado (precoBase, capacidadeAdultos, capacidadeCriancas)
 * @param {string} params.checkin
 * @param {string} params.checkout
 * @param {'reembolsavel'|'nao_reembolsavel'} params.tipoTarifa
 * @param {{ adultos: number, criancas: number[] }} params.hospedes - idades das crianças em `criancas`
 * @param {{ earlyCheckin: boolean, lateCheckout: boolean, bercoNecessario: boolean }} params.adicionais
 * @param {string[]} params.servicosSelecionados - ids de mockServicosOpcionais
 */
export function calcularOrcamento({
  quarto,
  checkin,
  checkout,
  tipoTarifa = 'reembolsavel',
  hospedes = { adultos: 1, criancas: [] },
  adicionais = { earlyCheckin: false, lateCheckout: false, bercoNecessario: false },
  servicosSelecionados = [],
}) {
  const diarias = calcularDiarias(checkin, checkout)
  const { multiplicador, tarifa } = obterMultiplicadorTemporada(checkin, checkout)

  const diariaBase = quarto?.precoBase || 0
  const diariaAjustada = diariaBase * multiplicador
  const subtotalDiarias = diariaAjustada * diarias

  // Hóspedes extras além da capacidade padrão do quarto
  const adultosExtras = Math.max(0, (hospedes.adultos || 0) - (quarto?.capacidadeAdultos || 0))
  const criancasMenores6 = hospedes.criancas.filter((idade) => idade < 6).length
  const criancas6a12 = hospedes.criancas.filter((idade) => idade >= 6 && idade <= 12).length

  const taxaAdultoExtra = adultosExtras * (diariaAjustada * 0.5) * diarias
  const taxaCriancaMenor6 = 0 // isentas
  const taxaCrianca6a12 = criancas6a12 * (diariaAjustada * 0.5) * diarias
  const totalHospedesExtras = taxaAdultoExtra + taxaCriancaMenor6 + taxaCrianca6a12

  const valorEarlyCheckin = adicionais.earlyCheckin ? diariaAjustada * 0.3 : 0
  const valorLateCheckout = adicionais.lateCheckout ? diariaAjustada * 0.3 : 0
  const valorBerco = adicionais.bercoNecessario ? 0 : 0 // berço grátis para bebês de 0 a 5 anos

  const servicos = mockServicosOpcionais.filter((s) => servicosSelecionados.includes(s.id))
  const valorServicos = servicos.reduce((soma, s) => {
    if (s.preco == null) return soma // ex.: early/late já calculados acima
    if (s.unidade === 'por diária') return soma + s.preco * diarias
    return soma + s.preco
  }, 0)

  const subtotal =
    subtotalDiarias + totalHospedesExtras + valorEarlyCheckin + valorLateCheckout + valorBerco + valorServicos

  const descontoNaoReembolsavel = tipoTarifa === 'nao_reembolsavel' ? subtotal * 0.1 : 0
  const total = subtotal - descontoNaoReembolsavel

  return {
    diarias,
    diariaBase,
    diariaAjustada,
    multiplicadorTemporada: multiplicador,
    tarifaTemporadaAplicada: tarifa,
    subtotalDiarias,
    adultosExtras,
    criancasMenores6,
    criancas6a12,
    totalHospedesExtras,
    valorEarlyCheckin,
    valorLateCheckout,
    servicosSelecionadosDetalhados: servicos,
    valorServicos,
    subtotal,
    descontoNaoReembolsavel,
    total: Math.max(0, Number(total.toFixed(2))),
  }
}

export function formatarMoeda(valor) {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
