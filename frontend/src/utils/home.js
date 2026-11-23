export function numero(valor, padrao = 0) {
  const convertido = Number(valor)
  return Number.isFinite(convertido) ? convertido : padrao
}

export function hojeISO() {
  const data = new Date()
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function adicionarDias(data, quantidade) {
  if (!data) return ''
  const resultado = new Date(`${data}T12:00:00`)
  resultado.setDate(resultado.getDate() + quantidade)
  const ano = resultado.getFullYear()
  const mes = String(resultado.getMonth() + 1).padStart(2, '0')
  const dia = String(resultado.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function formatarMoeda(valor) {
  return numero(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function extrairLista(resposta) {
  if (Array.isArray(resposta)) return resposta
  if (Array.isArray(resposta?.items)) return resposta.items
  if (Array.isArray(resposta?.results)) return resposta.results
  if (Array.isArray(resposta?.data)) return resposta.data
  return []
}

export function lerFiltros(params) {
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''
  return {
    cidade: params.get('cidade') || '', checkin, checkout,
    adultos: Math.max(1, numero(params.get('adultos'), 2)),
    criancas: Math.max(0, numero(params.get('criancas'), 0)),
    bebes: Math.max(0, numero(params.get('bebes'), 0)),
    estrelas: params.get('estrelas') || '',
  }
}

export function nomeCidade(hotel) {
  return hotel?.cidade?.nome || hotel?.cidade_nome || hotel?.nome_cidade || hotel?.cidade || 'Localização não informada'
}
export function nomeEstado(hotel) { return hotel?.cidade?.estado || hotel?.estado || hotel?.uf || '' }
export function nomeHotel(hotel) { return hotel?.nome || hotel?.name || 'Hotel sem nome' }
export function quantidadeEstrelas(hotel) {
  return numero(hotel?.categorias_estrelas ?? hotel?.categoria_estrelas ?? hotel?.estrelas ?? hotel?.categoria)
}
export function menorPreco(hotel, quartos) {
  const precoDireto = hotel?.menor_preco ?? hotel?.preco_diaria ?? hotel?.valor_diaria ?? hotel?.preco
  if (precoDireto !== undefined && precoDireto !== null) return numero(precoDireto)
  const quartosDoHotel = quartos.filter((quarto) => String(quarto?.hotel_id || quarto?.hotel?.id || '') === String(hotel?.id || ''))
  const precos = quartosDoHotel.map((quarto) => numero(quarto?.preco_diaria ?? quarto?.valor_diaria ?? quarto?.preco, -1)).filter((preco) => preco >= 0)
  return precos.length ? Math.min(...precos) : null
}

export function validarFiltrosBusca(form, hoje) {
  if (form.checkin && !form.checkout) return 'Informe a data de saída.'
  if (!form.checkin && form.checkout) return 'Informe a data de entrada.'
  if (form.checkin && form.checkin < hoje) return 'A data de entrada não pode ser anterior a hoje.'
  if (form.checkin && form.checkout && form.checkout <= form.checkin) return 'A data de saída deve ser posterior à entrada.'
  return ''
}

export function criarParametrosBusca(form) {
  const parametros = new URLSearchParams()
  Object.entries(form).forEach(([chave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) parametros.set(chave, String(valor))
  })
  parametros.set('buscou', 'true')
  return parametros
}
