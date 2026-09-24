import { NavLink } from '../../router/Router'

const ITENS = [
  { to: '/admin', label: 'Visão geral', end: true },
  { to: '/admin/cidades', label: 'Cidades' },
  { to: '/admin/hoteis', label: 'Hotéis' },
]

export default function AdminLayout({ children }) {
  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-3">
          <nav className="admin-nav" aria-label="Painel administrativo">
            {ITENS.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className="admin-link">
                {i.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="col-lg-9">{children}</div>
      </div>
    </div>
  )
}
