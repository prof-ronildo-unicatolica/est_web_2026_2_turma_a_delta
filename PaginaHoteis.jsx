import { useEffect, useState } from 'react'
import { listarCidades, listarHoteis } from '../../services/api'
import FiltrosHoteis from './FiltrosHoteis'
import HotelCard from './HotelCard'

export default function PaginaHoteis({ aoNavegar }) {
  const [cidades, setCidades] = useState([])
  const [hoteis, setHoteis] = useState([])
  const [filtros, setFiltros] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listarCidades().then(setCidades)
  }, [])

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    listarHoteis(filtros)
      .then(setHoteis)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [filtros])

  function cidadeDoHotel(hotel) {
    return cidades.find((c) => c.id === hotel.cidade_id)
  }

  return (
    <div className="row g-4">
      <div className="col-md-3">
        <FiltrosHoteis cidades={cidades} filtros={filtros} aoMudarFiltros={setFiltros} />
      </div>

      <div className="col-md-9">
        <h2 className="text-secondary mb-3 fs-4">Hotéis disponíveis</h2>

        {carregando && (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando hotéis...</span>
            </div>
          </div>
        )}

        {erro && (
          <div className="alert alert-danger shadow-sm" role="alert">
            Não foi possível carregar os hotéis: {erro}
          </div>
        )}

        {!carregando && !erro && hoteis.length === 0 && (
          <div className="alert alert-info shadow-sm">
            Nenhum hotel encontrado para os filtros selecionados.
          </div>
        )}

        <div className="row g-3">
          {!carregando &&
            hoteis.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                cidade={cidadeDoHotel(hotel)}
                aoVerDetalhes={(hotelId) => aoNavegar({ pagina: 'hotel-detalhe', hotelId })}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
