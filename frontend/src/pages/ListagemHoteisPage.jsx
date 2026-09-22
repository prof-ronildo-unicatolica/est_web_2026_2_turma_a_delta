import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { buscarHoteis, listarCidades } from '../services/hoteisService'
import HotelCard from '../components/HotelCard'

export default function ListagemHoteisPage() {
  const [searchParams] = useSearchParams()
  const [hoteis, setHoteis] = useState([])
  const [cidades, setCidades] = useState([])
  const [carregando, setCarregando] = useState(true)

  const cidadeId = searchParams.get('cidadeId') || undefined
  const estrelas = searchParams.get('estrelas') || undefined
  const checkin = searchParams.get('checkin') || undefined
  const checkout = searchParams.get('checkout') || undefined

  useEffect(() => {
    setCarregando(true)
    Promise.all([
      buscarHoteis({ cidadeId, estrelasMin: estrelas ? Number(estrelas) : undefined, checkin, checkout }),
      listarCidades(),
    ]).then(([resultadoHoteis, listaCidades]) => {
      setHoteis(resultadoHoteis)
      setCidades(listaCidades)
      setCarregando(false)
    })
  }, [cidadeId, estrelas, checkin, checkout])

  function nomeCidade(id) {
    return cidades.find((c) => c.id === id)?.nome || ''
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Resultados da busca</h2>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          Refazer busca
        </Link>
      </div>

      {carregando && (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Buscando hotéis...</span>
          </div>
        </div>
      )}

      {!carregando && hoteis.length === 0 && (
        <div className="alert alert-warning">Nenhum hotel encontrado para os filtros selecionados.</div>
      )}

      {!carregando && hoteis.length > 0 && (
        <div className="row g-4">
          {hoteis.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} cidadeNome={nomeCidade(hotel.cidadeId)} />
          ))}
        </div>
      )}
    </>
  )
}
