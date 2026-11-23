const TOKEN_KEY = 'hotel.token'

/** Armazena o token sem interromper a aplicação quando o storage estiver bloqueado. */
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
      // O armazenamento pode estar indisponível no navegador.
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // A limpeza do storage não deve interromper o logout.
    }
  },
}
