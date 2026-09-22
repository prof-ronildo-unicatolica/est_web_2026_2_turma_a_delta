import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/authService'
import { getStoredToken } from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Ao montar a aplicação, se já existe um token salvo, tenta recuperar o usuário.
  useEffect(() => {
    async function restaurarSessao() {
      const token = getStoredToken()
      if (!token) {
        setCarregando(false)
        return
      }
      try {
        const usuarioAtual = await authService.getUsuarioAtual()
        setUsuario(usuarioAtual)
      } catch {
        authService.logout()
      } finally {
        setCarregando(false)
      }
    }
    restaurarSessao()
  }, [])

  const login = useCallback(async (email, senha) => {
    const usuarioLogado = await authService.login(email, senha)
    setUsuario(usuarioLogado)
    return usuarioLogado
  }, [])

  const cadastrar = useCallback(async (dados) => {
    return authService.cadastrar(dados)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUsuario(null)
  }, [])

  const value = {
    usuario,
    autenticado: Boolean(usuario),
    isAdmin: Boolean(usuario?.is_admin),
    carregando,
    login,
    logout,
    cadastrar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  return ctx
}
