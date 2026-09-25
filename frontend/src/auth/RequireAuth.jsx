import { useAuth } from './authContext'
import { Redirect } from '../router/Router'
import { useLocation } from '../router/hooks'
import Forbidden from '../pages/Forbidden'
import PageSpinner from '../components/PageSpinner'

/** Guarda de rotas: exige login e, com `admin`, também is_admin (cliente recebe tela 403). */
export default function RequireAuth({ admin = false, children }) {
  const { user, loading } = useAuth()
  const { pathname, search } = useLocation()

  if (loading) return <PageSpinner label="Verificando sessão..." />
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(pathname + search)}`} />
  if (admin && !user.is_admin) return <Forbidden />
  return children
}
