import { Link } from '../router/Router'

export default function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
      <p className="display-1 fw-bold text-primary mb-0">404</p>
      <h1 className="h3">Página não encontrada</h1>
      <p className="text-secondary">O endereço acessado não existe neste sistema.</p>
      <Link className="btn btn-primary" to="/">
        Ir para a busca
      </Link>
    </div>
  )
}
