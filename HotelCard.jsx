function Estrelas({ quantidade }) {
  return (
    <span className="text-warning" title={`${quantidade} estrelas`}>
      {'★'.repeat(quantidade)}
      <span className="text-secondary">{'★'.repeat(5 - quantidade)}</span>
    </span>
  )
}

export default function HotelCard({ hotel, cidade, aoVerDetalhes }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title text-primary fw-bold mb-0">{hotel.nome}</h5>
            <Estrelas quantidade={hotel.categoria_estrelas} />
          </div>
          <h6 className="card-subtitle mb-3 text-muted">
            {cidade ? `${cidade.nome}/${cidade.estado}` : 'Cidade não informada'}
          </h6>
          <p className="card-text small text-secondary flex-grow-1">{hotel.descricao}</p>
          <button
            className="btn btn-primary btn-sm mt-2 align-self-start"
            type="button"
            onClick={() => aoVerDetalhes(hotel.id)}
          >
            Ver quartos e reservar
          </button>
        </div>
      </div>
    </div>
  )
}
