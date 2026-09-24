import { Link } from '../router/Router'

export default function Forbidden() {
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
      <p className="display-1 fw-bold text-primary mb-0">403</p>
      <h1 className="h3">Acesso restrito a administradores</h1>
      <p className="text-secondary">Sua conta de cliente não tem permissão para abrir esta área.</p>
      <Link className="btn btn-primary" to="/">
        Voltar para a busca
      </Link>
    </div>
  )
}
