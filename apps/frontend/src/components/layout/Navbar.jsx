export default function Navbar({ pagina, aoNavegar, usuario }) {
  const linkClasse = (alvo) => `nav-link ${pagina === alvo ? 'active' : ''}`

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4 sticky-top">
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            aoNavegar({ pagina: 'hoteis' })
          }}
        >
          <span className="fs-4 fw-bold text-primary">Rede Hoteleira</span>
          <span className="ms-2 badge bg-secondary text-wrap small">Estágio II</span>
        </a>
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
              <a
                className={linkClasse('hoteis')}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  aoNavegar({ pagina: 'hoteis' })
                }}
              >
                Hotéis
              </a>
            </li>
            <li className="nav-item">
              <a
                className={linkClasse('minhas-reservas')}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  aoNavegar({ pagina: 'minhas-reservas' })
                }}
              >
                Minhas Reservas
              </a>
            </li>
            <li className="nav-item">
              <a
                className={linkClasse('sobre')}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  aoNavegar({ pagina: 'sobre' })
                }}
              >
                Sobre o Projeto
              </a>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            <span className="text-light small d-none d-md-inline">
              Olá, {usuario?.nome || 'Convidado(a)'}
            </span>
            <button className="btn btn-outline-primary btn-sm px-3" type="button">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
