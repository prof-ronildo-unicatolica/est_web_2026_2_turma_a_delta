export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function mensagemDosErrosDeValidacao(detail) {
  if (!Array.isArray(detail) || detail.length === 0) return ''

  return detail
    .map((item) => {
      const campo = Array.isArray(item.loc)
        ? item.loc.filter((parte) => parte !== 'body').join('.')
        : ''

      return campo ? `${campo}: ${item.msg}` : item.msg
    })
    .join(' | ')
}

export function mensagemDeErro(status, data) {
  const detail = data?.detail

  if (typeof detail === 'string') return detail

  const mensagemValidacao = mensagemDosErrosDeValidacao(detail)
  if (mensagemValidacao) return mensagemValidacao

  const mensagensPorStatus = {
    401: 'Sessão inválida ou expirada. Entre novamente.',
    403: 'Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
  }

  if (mensagensPorStatus[status]) return mensagensPorStatus[status]
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.'

  return `Falha na requisição (${status}).`
}

export function mensagemDeFalhaDeConexao() {
  return 'Não foi possível conectar à API. Verifique se o backend está no ar.'
}
