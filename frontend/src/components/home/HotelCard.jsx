import { Link } from 'react-router-dom'
import { formatarMoeda, menorPreco, nomeCidade, nomeEstado, nomeHotel, quantidadeEstrelas } from '../../utils/home'

export default function HotelCard({ hotel, quartos, query }) {
  const estrelas = quantidadeEstrelas(hotel)
  const preco = menorPreco(hotel, quartos)
  const cidade = nomeCidade(hotel)
  const estado = nomeEstado(hotel)
  const comodidades = Array.isArray(hotel?.comodidades) ? hotel.comodidades : Array.isArray(hotel?.facilidades) ? hotel.facilidades : []
  const localizacao = estado ? `${cidade} - ${estado}` : cidade

  return (
    <article className="card hotel-card h-100 border-0 shadow-sm">
      <div className="hotel-card-cover d-flex align-items-center justify-content-center" style={{ minHeight: '190px', background: '#eaf1f7' }}>
        {hotel?.imagem_url || hotel?.foto_url || hotel?.imagem ? (
          <img src={hotel.imagem_url || hotel.foto_url || hotel.imagem} alt={`Imagem do ${nomeHotel(hotel)}`} className="w-100 h-100" style={{ minHeight: '190px', maxHeight: '220px', objectFit: 'cover' }} />
        ) : <div className="text-center text-secondary p-4"><div className="fs-1 mb-2" aria-hidden="true">🏨</div><span>Imagem não disponível</span></div>}
      </div>
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div><h2 className="h5 fw-bold mb-1">{nomeHotel(hotel)}</h2><p className="text-secondary small mb-0">{localizacao}</p></div>
          {estrelas > 0 && <span className="badge bg-warning text-dark" aria-label={`${estrelas} estrelas`}>{'★'.repeat(Math.min(estrelas, 5))}</span>}
        </div>
        {comodidades.length > 0 && <div className="d-flex flex-wrap gap-2 my-3">{comodidades.slice(0, 4).map((item, indice) => <span key={`${String(item)}-${indice}`} className="badge bg-light text-secondary border">{typeof item === 'string' ? item : item?.nome}</span>)}</div>}
        <div className="mt-auto pt-3 border-top">
          <div className="mb-3"><span className="text-secondary small d-block">Diária a partir de</span><strong className="fs-5 text-primary">{preco !== null ? formatarMoeda(preco) : 'Consulte os valores'}</strong></div>
          <Link to={`/hoteis/${hotel.id}${query}`} className="btn btn-primary w-100">Ver quartos disponíveis</Link>
        </div>
      </div>
    </article>
  )
}
