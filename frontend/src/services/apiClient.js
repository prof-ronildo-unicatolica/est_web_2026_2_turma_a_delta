// URL base do core-service (FastAPI). Ajuste via variável de ambiente se necessário.
export const API_BASE_URL = 'http://localhost:8000/api/v1'

const TOKEN_STORAGE_KEY = 'delta:auth_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

/**
 * Wrapper de fetch que:
 * - Monta a URL a partir de API_BASE_URL
 * - Injeta o header Authorization quando há token salvo
 * - Lança um erro padronizado em respostas não-OK
 * - Em 401, limpa o token salvo (quem estiver ouvindo `onUnauthorized` decide o redirect)
 */
export async function apiFetch(path, { method = 'GET', body, headers, onUnauthorized } = {}) {
  const token = getStoredToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    setStoredToken(null)
    if (onUnauthorized) onUnauthorized()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!response.ok) {
    let detail = `Erro HTTP ${response.status}`
    try {
      const json = await response.json()
      detail = json.detail || detail
    } catch {
      // corpo não era JSON, mantém a mensagem padrão
    }
    throw new Error(detail)
  }

  if (response.status === 204) return null
  return response.json()
}

/** Pequeno helper para simular latência de rede nos serviços que ainda usam mock. */
export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
