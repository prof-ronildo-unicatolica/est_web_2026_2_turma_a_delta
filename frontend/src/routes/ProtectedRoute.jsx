import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protege rotas que exigem usuário autenticado (e opcionalmente admin).
 * Regras de rota conforme docs/03_arquitetura_tecnica/arquitetura_frontend.md §4.2:
 *  - Pública: "/"
 *  - Cliente: /checkout, /minhas-reservas (token JWT padrão)
 *  - Admin: /admin/* (token + is_admin === true)
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { autenticado, isAdmin, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verificando sessão...</span>
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning shadow-sm">
          <h4 className="alert-heading">Acesso restrito</h4>
          <p className="mb-0">Esta área é exclusiva para administradores.</p>
        </div>
      </div>
    )
  }

  return children
}
