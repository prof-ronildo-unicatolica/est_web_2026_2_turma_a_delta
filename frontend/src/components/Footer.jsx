import { healthApi } from '../api/services'
import useFetch from '../hooks/useFetch'

export default function Footer() {
  const { data, loading, error } = useFetch(() => healthApi.check(), [])
  const online = !loading && !error && data
  const estado = loading ? 'verificando API' : online ? 'API online' : 'API indisponível'
  return (
    <footer className="app-footer py-4 mt-5">
      <div className="container d-flex flex-wrap justify-content-between gap-2 small text-secondary">
        <span>&copy; {new Date().getFullYear()} Rede Hoteleira — Estágio II</span>
        <span className="d-inline-flex align-items-center gap-2" role="status">
          <span className={`dot ${loading ? 'dot-wait' : online ? 'dot-ok' : 'dot-off'}`} aria-hidden="true"></span>
          {estado}
        </span>
      </div>
    </footer>
  )
}
