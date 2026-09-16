import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { autenticado, isAdmin, usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4 sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-4 fw-bold text-primary">Rede Hoteleira</span>
          <span className="ms-2 badge bg-secondary text-wrap small">Estágio II</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Buscar Hotéis
              </NavLink>
            </li>
            {autenticado && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/minhas-reservas">
                  Minhas Reservas
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Painel Admin
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink className="nav-link" to="/tutorial">
                Tutorial
              </NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {autenticado ? (
              <>
                <span className="text-white-50 small d-none d-md-inline">
                  Olá, {usuario?.nome?.split(' ')[0]}
                </span>
                <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <Link className="btn btn-outline-primary btn-sm px-3" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
