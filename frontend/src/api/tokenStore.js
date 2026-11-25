
const TOKEN_KEY = 'hotel.token'

/**
 * Gerencia o armazenamento do token de autenticação.
 * A aplicação continua funcionando caso o navegador bloqueie o storage.
 */
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
      return
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      return
    }
  },
}
