import { tokenStore } from './tokenStore'
import {
  ApiError,
  mensagemDeErro,
  mensagemDeFalhaDeConexao,
} from './errorHandler'

const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '')

// Mantém os exports históricos para não quebrar os imports existentes.
export { tokenStore, ApiError, mensagemDeErro }

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

function criarUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (!params) return url

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, value)
  })

  return url
}

function criarCabecalhos({ auth, body }) {
  const headers = { Accept: 'application/json' }
  const token = auth ? tokenStore.get() : null

  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  return { headers, token }
}

async function executarFetch(url, method, headers, body, signal) {
  try {
    return await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(mensagemDeFalhaDeConexao(), 0)
  }
}

async function lerResposta(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function tratarNaoAutorizado(status, token) {
  if (status !== 401 || !token) return

  tokenStore.clear()
  onUnauthorized?.()
}

export async function request(
  method,
  path,
  { body, params, auth = true, signal } = {},
) {
  const url = criarUrl(path, params)
  const { headers, token } = criarCabecalhos({ auth, body })
  const response = await executarFetch(url, method, headers, body, signal)
  const data = await lerResposta(response)

  if (!response.ok) {
    tratarNaoAutorizado(response.status, token)
    throw new ApiError(
      mensagemDeErro(response.status, data),
      response.status,
      data,
    )
  }

  return data
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) =>
    request('POST', path, { ...options, body: body ?? {} }),
  put: (path, body, options) =>
    request('PUT', path, { ...options, body: body ?? {} }),
  patch: (path, body, options) =>
    request('PATCH', path, { ...options, body: body ?? {} }),
  del: (path, options) => request('DELETE', path, options),
}
