export default function QuartoCard({ quarto, aoReservar }) {
  return (
    <div className="col-md-6">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title fw-bold mb-1">{quarto.tipo}</h5>
            <span className="badge bg-secondary">Nº {quarto.numero}</span>
          </div>
          <p className="text-muted small mb-2">
            Até {quarto.max_adultos} adulto(s)
            {quarto.max_criancas > 0 ? ` e ${quarto.max_criancas} criança(s)` : ''}
          </p>
          <p className="fs-4 fw-bold text-primary mb-3">
            R$ {Number(quarto.preco_diaria).toFixed(2)}
            <span className="fs-6 fw-normal text-secondary"> / diária</span>
          </p>
          <button
            className="btn btn-primary btn-sm mt-auto align-self-start"
            type="button"
            onClick={() => aoReservar(quarto)}
          >
            Reservar este quarto
          </button>
        </div>
      </div>
    </div>
  )
}
