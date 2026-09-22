import { useEffect, useState } from 'react'
import {
  obterHotel,
  listarQuartosPorHotel,
  listarAvaliacoesPorHotel,
  listarCidades,
  listarComodidades,
} from '../../services/api'
import MapComponent from '../common/MapComponent'
import QuartoCard from './QuartoCard'
import AvaliacoesHotel from './AvaliacoesHotel'

export default function PaginaHotelDetalhe({ hotelId, aoNavegar }) {
  const [hotel, setHotel] = useState(null)
  const [cidade, setCidade] = useState(null)
  const [quartos, setQuartos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [comodidades, setComodidades] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    Promise.all([
      obterHotel(hotelId),
      listarQuartosPorHotel(hotelId),
      listarAvaliacoesPorHotel(hotelId),
      listarCidades(),
      listarComodidades(),
    ]).then(([hotelData, quartosData, avaliacoesData, cidadesData, comodidadesData]) => {
      setHotel(hotelData)
      setQuartos(quartosData)
      setAvaliacoes(avaliacoesData)
      setCidade(cidadesData.find((c) => c.id === hotelData?.cidade_id) || null)
      setComodidades(comodidadesData)
      setCarregando(false)
    })
  }, [hotelId])

  if (carregando) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando hotel...</span>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="alert alert-warning shadow-sm">
        Hotel não encontrado.{' '}
        <button className="btn btn-link p-0" onClick={() => aoNavegar({ pagina: 'hoteis' })}>
          Voltar para a lista de hotéis
        </button>
      </div>
    )
  }

  const comodidadesDoHotel = comodidades.filter((c) => hotel.comodidades?.includes(c.id))

  return (
    <div>
      <button
        className="btn btn-sm btn-outline-secondary mb-3"
        type="button"
        onClick={() => aoNavegar({ pagina: 'hoteis' })}
      >
        &larr; Voltar para hotéis
      </button>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h2 className="text-primary fw-bold mb-1">{hotel.nome}</h2>
              <p className="text-muted mb-0">
                {cidade ? `${cidade.nome}/${cidade.estado}` : 'Cidade não informada'}
              </p>
            </div>
            <span className="text-warning fs-5">
              {'★'.repeat(hotel.categoria_estrelas)}
              <span className="text-secondary">{'★'.repeat(5 - hotel.categoria_estrelas)}</span>
            </span>
          </div>
          <p className="mt-3 mb-3">{hotel.descricao}</p>

          {comodidadesDoHotel.length > 0 && (
            <div className="mb-2">
              {comodidadesDoHotel.map((c) => (
                <span key={c.id} className="badge bg-secondary me-1 mb-1">
                  {c.nome}
                </span>
              ))}
            </div>
          )}

          {hotel.localizacao && <MapComponent geojson={hotel.localizacao} />}
        </div>
      </div>

      <section className="mb-4">
        <h3 className="text-secondary mb-3 fs-4">Quartos disponíveis</h3>
        <div className="row g-3">
          {quartos.map((quarto) => (
            <QuartoCard
              key={quarto.id}
              quarto={quarto}
              aoReservar={(q) =>
                aoNavegar({ pagina: 'nova-reserva', hotel, quarto: q })
              }
            />
          ))}
          {quartos.length === 0 && (
            <p className="text-muted small">Nenhum quarto cadastrado para este hotel ainda.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-secondary mb-3 fs-4">Avaliações de hóspedes</h3>
        <AvaliacoesHotel avaliacoes={avaliacoes} />
      </section>
    </div>
  )
}
