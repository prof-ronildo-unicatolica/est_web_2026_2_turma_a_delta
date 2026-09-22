import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { obterHotel, listarQuartosDoHotel } from '../services/hoteisService'
import { getCidadeById } from '../data/mockData'
import { formatarMoeda } from '../services/pricing'

export default function DetalheHotelPage() {
  const { hotelId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState(null)
  const [quartos, setQuartos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const checkin = searchParams.get('checkin') || ''
  const checkout = searchParams.get('checkout') || ''

  useEffect(() => {
    setCarregando(true)
    Promise.all([obterHotel(hotelId), listarQuartosDoHotel(hotelId)])
      .then(([h, q]) => {
        setHotel(h)
        setQuartos(q)
      })
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [hotelId])

  function handleReservar(quartoId) {
    const params = new URLSearchParams()
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    navigate(`/checkout/${quartoId}?${params.toString()}`)
  }

  if (carregando) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando hotel...</span>
        </div>
      </div>
    )
  }

  if (erro || !hotel) {
    return <div className="alert alert-danger">{erro || 'Hotel não encontrado.'}</div>
  }

  const cidade = getCidadeById(hotel.cidadeId)

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/hoteis">Hotéis</Link></li>
          <li className="breadcrumb-item active">{hotel.nome}</li>
        </ol>
      </nav>

      <div className="card shadow-sm mb-4">
        <img src={hotel.imagem} className="card-img-top" alt={hotel.nome} style={{ maxHeight: 320, objectFit: 'cover' }} />
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">{hotel.nome}</h2>
              <p className="text-muted mb-2">{cidade?.nome} - {cidade?.estado}</p>
            </div>
            <div className="text-end">
              <div className="text-warning fs-5">{'⭐'.repeat(hotel.estrelas)}</div>
              <div className="small text-secondary">Média {hotel.mediaAvaliacao.toFixed(1)} / 5 ({hotel.totalAvaliacoes} avaliações)</div>
            </div>
          </div>
          <p className="mt-3">{hotel.descricao}</p>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {hotel.comodidadesDetalhadas.map((c) => (
              <span key={c.id} className="badge bg-light text-dark border">{c.nome}</span>
            ))}
          </div>
        </div>
      </div>

      <h4 className="fw-bold mb-3">Quartos disponíveis</h4>
      <div className="row g-3">
        {quartos.map((quarto) => (
          <div className="col-md-6" key={quarto.id}>
            <div className="card h-100 shadow-sm">
              <div className="row g-0 h-100">
                <div className="col-4">
                  <img src={quarto.imagem} alt={quarto.tipo} className="img-fluid rounded-start h-100" style={{ objectFit: 'cover' }} />
                </div>
                <div className="col-8">
                  <div className="card-body d-flex flex-column h-100">
                    <h5 className="card-title mb-1">{quarto.numero} - {quarto.tipo}</h5>
                    <p className="small text-muted mb-2">
                      Até {quarto.capacidadeAdultos} adultos e {quarto.capacidadeCriancas} crianças
                    </p>
                    <p className="fw-bold text-primary mb-2">{formatarMoeda(quarto.precoBase)} / diária</p>
                    <button className="btn btn-primary btn-sm mt-auto align-self-start" onClick={() => handleReservar(quarto.id)}>
                      Reservar este quarto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
