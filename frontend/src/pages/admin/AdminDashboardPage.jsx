import { NavLink, Outlet } from 'react-router-dom'

const SECOES = [
  { to: '/admin/cidades', label: 'Cidades' },
  { to: '/admin/hoteis', label: 'Hotéis' },
  { to: '/admin/quartos', label: 'Quartos' },
  { to: '/admin/tarifas', label: 'Tarifas de Temporada' },
  { to: '/admin/comodidades', label: 'Comodidades e Serviços' },
  { to: '/admin/auditoria', label: 'Trilha de Auditoria' },
]

export default function AdminDashboardPage() {
  return (
    <>
      <h2 className="fw-bold mb-4">Painel Administrativo</h2>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="list-group shadow-sm">
            {SECOES.map((secao) => (
              <NavLink
                key={secao.to}
                to={secao.to}
                className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
              >
                {secao.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="col-md-9">
          <Outlet />
        </div>
      </div>
    </>
  )
}
