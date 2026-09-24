/**
 * Cliente HTTP do sistema (fetch) — Sprint 1 (baseURL) e Sprint 2 (JWT).
 *
 * - baseURL: VITE_API_URL ou, por padrão, "/api/v1" (o Vite/nginx repassam para o backend).
 * - Interceptor de requisição: injeta "Authorization: Bearer <token>" quando há token.
 * - Interceptor de resposta: em 401 (token ausente/expirado/inválido) limpa o token e
 *   avisa a aplicação (setUnauthorizedHandler) para redirecionar ao login.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '')
const TOKEN_KEY = 'hotel.token'

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* armazenamento indisponível: a sessão vale só até recarregar */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* noop */
    }
  },
}

let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function mensagemDeErro(status, data) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    // Erros de validação do FastAPI (422)
    return detail
      .map((d) => {
        const campo = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : ''
        return campo ? `${campo}: ${d.msg}` : d.msg
      })
      .join(' | ')
  }
  if (status === 401) return 'Sessão inválida ou expirada. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 503) return 'Serviço temporariamente indisponível. Tente novamente em instantes.'
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.'
  return `Falha na requisição (${status}).`
}

export async function request(method, path, { body, params, auth = true, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const headers = { Accept: 'application/json' }
  const token = auth ? tokenStore.get() : null
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('Não foi possível conectar à API. Verifique se o backend está no ar.', 0)
  }

  let data = null
  if (res.status !== 204) {
    const text = await res.text()
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear()
      if (onUnauthorized) onUnauthorized()
    }
    throw new ApiError(mensagemDeErro(res.status, data), res.status, data)
  }
  return data
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body: body ?? {} }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body: body ?? {} }),
  del: (path, opts) => request('DELETE', path, opts),
}
