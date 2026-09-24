import { useMemo } from 'react'
import { catalogoApi } from '../api/services'
import useFetch from '../hooks/useFetch'
import { Link } from '../router/Router'
import { useParams, useSearchParams } from '../router/hooks'
import { normalizeHotel } from '../utils/catalog'
import { brl, formatDate, guestsSummary } from '../utils/format'
import ErrorAlert from '../components/ErrorAlert'
import HotelCover from '../components/HotelCover'
import Stars from '../components/Stars'
import { BlockSkeleton } from '../components/Skeletons'

const int = (v, d) => (v === null || Number.isNaN(Number(v)) ? d : Number(v))

export default function HotelDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { data: hotel, loading, error, reload } = useFetch(() => catalogoApi.hotel(id).then(normalizeHotel), [id])

  const hospedes = {
    adultos: int(params.get('adultos'), null),
    criancas: int(params.get('criancas'), 0),
    bebes: int(params.get('bebes'), 0),
  }
  const temHospedes = hospedes.adultos !== null
  const checkin = params.get('checkin')
  const checkout = params.get('checkout')

  // Repassa a escolha da busca para o checkout
  const linkCheckout = useMemo(
    () => (quartoId) => {
      const q = new URLSearchParams({ hotel: id, quarto: quartoId })
      ;['checkin', 'checkout', 'adultos', 'criancas', 'bebes'].forEach((k) => params.get(k) && q.set(k, params.get(k)))
      return `/checkout?${q.toString()}`
    },
    [id, params],
  )

  if (loading) {
    return (
      <div className="container py-4">
        <BlockSkeleton height={180} />
        <div className="mt-4">
          <BlockSkeleton height={220} />
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="container py-4">
        <ErrorAlert error={error} onRetry={reload} />
        <Link to="/" className="btn btn-outline-primary">
          Voltar para a busca
        </Link>
      </div>
    )
  }

  const voltar = `/${params.toString() ? `?${params.toString()}` : ''}`

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <Link to={voltar} className="small">
          ← Voltar para os resultados
        </Link>
      </nav>

      <header className="detail-header">
        <HotelCover nome={hotel.nome} className="detail-cover" />
        <div className="detail-info">
          <h1 className="h2 mb-1">{hotel.nome}</h1>
          <Stars value={hotel.categoria_estrelas} size="fs-5" />
          {hotel.cidade && (
            <p className="text-secondary mb-2">
              {hotel.cidade.nome}
              {hotel.cidade.estado ? `, ${hotel.cidade.estado}` : ''}
            </p>
          )}
          <p className="mb-0">
            {hotel.media_avaliacao != null ? (
              <>
                <strong>{Number(hotel.media_avaliacao).toFixed(1)}</strong> de 5 na média das avaliações
              </>
            ) : (
              <span className="text-secondary">Ainda sem avaliações</span>
            )}
          </p>
        </div>
      </header>

      <section className="mt-4" aria-labelledby="h-comodidades">
        <h2 id="h-comodidades" className="h5">
          Comodidades
        </h2>
        {hotel.comodidades.length ? (
          <div className="d-flex flex-wrap gap-2">
            {hotel.comodidades.map((c) => (
              <span key={c} className="chip chip-lg">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-secondary">Nenhuma comodidade informada.</p>
        )}
      </section>

      <section className="mt-4" aria-labelledby="h-quartos">
        <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
          <h2 id="h-quartos" className="h5 mb-0">
            Quartos
          </h2>
          {checkin && checkout && (
            <span className="text-secondary small">
              {formatDate(checkin)} a {formatDate(checkout)}
              {temHospedes && `, ${guestsSummary(hospedes)}`}
            </span>
          )}
        </div>

        {hotel.quartos.length === 0 && (
          <div className="empty-state">
            <p className="mb-0">Este hotel ainda não tem quartos disponíveis para reserva.</p>
          </div>
        )}

        <div className="list-group room-list">
          {hotel.quartos.map((q) => {
            const cabe = !temHospedes || (hospedes.adultos <= q.max_adultos && hospedes.criancas <= q.max_criancas)
            return (
              <div key={q.id} className="list-group-item room-item">
                <div className="room-main">
                  <h3 className="h6 mb-1">
                    Quarto {q.numero}
                    <span className="text-secondary fw-normal"> — {q.tipo}</span>
                  </h3>
                  <p className="mb-0 small">
                    Até {q.max_adultos} {q.max_adultos === 1 ? 'adulto' : 'adultos'} e {q.max_criancas}{' '}
                    {q.max_criancas === 1 ? 'criança' : 'crianças'}
                  </p>
                  <p className="text-secondary small mb-0">Bebês de 0 a 5 anos não contam na capacidade.</p>
                  {!cabe && <span className="badge text-bg-warning mt-2">Não comporta o seu grupo</span>}
                </div>
                <div className="room-price">
                  <span className="fs-5 fw-semibold">{brl(q.preco_diaria)}</span>
                  <span className="text-secondary small d-block">por diária</span>
                </div>
                <div className="room-action">
                  {cabe ? (
                    <Link className="btn btn-primary" to={linkCheckout(q.id)}>
                      Reservar
                    </Link>
                  ) : (
                    <button className="btn btn-primary" type="button" disabled>
                      Reservar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
