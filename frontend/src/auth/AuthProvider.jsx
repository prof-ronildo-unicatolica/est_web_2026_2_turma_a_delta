import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/services'
import { setUnauthorizedHandler, tokenStore } from '../api/http'
import { useNavigate } from '../router/hooks'
import { AuthContext } from './authContext'

const normalizeUser = (u, extra = {}) => ({
  nome: u.nome,
  email: u.email,
  is_admin: Boolean(u.is_admin ?? extra.is_admin),
})

export default function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  // Se já existe token guardado, começa "carregando" até validar em /auth/me
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  // Interceptor de 401: o cliente HTTP já limpou o token; aqui limpamos o estado e vamos ao login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      navigate('/login?expirou=1', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then((u) => setUser(normalizeUser(u)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, senha) => {
    const data = await authApi.login(email, senha)
    tokenStore.set(data.access_token)
    try {
      const me = normalizeUser(await authApi.me(), data)
      setUser(me)
      return me
    } catch (err) {
      tokenStore.clear()
      throw err
    }
  }, [])

  const register = useCallback(
    async (nome, email, senha) => {
      await authApi.register(nome, email, senha)
      return login(email, senha)
    },
    [login],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
