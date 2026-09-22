import { Link } from 'react-router-dom'

export default function HotelCard({ hotel, cidadeNome }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm">
        <img src={hotel.imagem} className="card-img-top" alt={hotel.nome} style={{ height: 180, objectFit: 'cover' }} />
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-1">{hotel.nome}</h5>
            <span className="text-warning small text-nowrap">{'⭐'.repeat(hotel.estrelas)}</span>
          </div>
          <p className="text-muted small mb-2">{cidadeNome}</p>
          <p className="card-text small text-secondary flex-grow-1">{hotel.descricao}</p>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="badge bg-light text-dark border">
              ⭐ {hotel.mediaAvaliacao.toFixed(1)} ({hotel.totalAvaliacoes})
            </span>
            <Link to={`/hoteis/${hotel.id}`} className="btn btn-primary btn-sm">
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
