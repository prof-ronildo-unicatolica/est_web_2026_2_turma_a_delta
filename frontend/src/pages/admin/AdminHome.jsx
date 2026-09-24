import { catalogoApi } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import { asList } from '../../utils/catalog'
import { Link } from '../../router/Router'

export default function AdminHome() {
  const { data, loading } = useFetch(async () => {
    const [cidades, hoteis] = await Promise.allSettled([catalogoApi.cidades(), catalogoApi.hoteis()])
    return {
      cidades: cidades.status === 'fulfilled' ? asList(cidades.value).length : null,
      hoteis: hoteis.status === 'fulfilled' ? asList(hoteis.value).length : null,
    }
  }, [])

  const cartoes = [
    { to: '/admin/cidades', titulo: 'Cidades', n: data?.cidades },
    { to: '/admin/hoteis', titulo: 'Hotéis', n: data?.hoteis },
  ]

  return (
    <div>
      <h1 className="h4 mb-3">Painel administrativo</h1>
      <p className="text-secondary">Cadastre as cidades e os hotéis que aparecem na busca dos clientes.</p>
      <div className="row g-3">
        {cartoes.map((c) => (
          <div className="col-sm-6" key={c.to}>
            <Link to={c.to} className="panel admin-stat text-decoration-none d-block">
              <span className="text-secondary small">{c.titulo}</span>
              <span className="d-block display-6 fw-semibold text-body">{loading ? '…' : c.n ?? '—'}</span>
              <span className="small">Gerenciar {c.titulo.toLowerCase()}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
