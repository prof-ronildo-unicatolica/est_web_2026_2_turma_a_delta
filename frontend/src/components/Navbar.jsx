import { useEffect, useState } from 'react'
import { Link, NavLink } from '../router/Router'
import { useLocation } from '../router/hooks'
import { useAuth } from '../auth/authContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [aberto, setAberto] = useState(false)

  useEffect(() => setAberto(false), [pathname])

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand brand" to="/">
          Rede Hoteleira
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={aberto}
          aria-label="Alternar menu"
          onClick={() => setAberto((v) => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${aberto ? 'show' : ''}`} id="menu-principal">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Buscar hotéis
              </NavLink>
            </li>
            {user && !user.is_admin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/minhas-reservas">
                  Minhas reservas
                </NavLink>
              </li>
            )}
            {user?.is_admin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Painel administrativo
                </NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0">
            {user ? (
              <>
                <span className="text-white-50 small me-1">
                  {user.nome}
                  {user.is_admin && <span className="badge text-bg-light ms-2">admin</span>}
                </span>
                <button type="button" className="btn btn-outline-light btn-sm" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Entrar
                </Link>
                <Link className="btn btn-light btn-sm" to="/login?modo=cadastro">
                  Cadastrar-se
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
