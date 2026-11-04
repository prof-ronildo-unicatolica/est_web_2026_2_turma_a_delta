import { useMemo, useState } from 'react'
import { catalogoApi } from '../api/services'
import useFetch from '../hooks/useFetch'
import { Link } from '../router/Router'
import { useSearchParams } from '../router/hooks'
import { asList, normalizeHotel } from '../utils/catalog'
import { brl, formatDate, guestsSummary, todayISO } from '../utils/format'
import { addDays } from '../utils/pricing'
import Counter from '../components/Counter'
import ErrorAlert from '../components/ErrorAlert'
import HotelCover from '../components/HotelCover'
import Stars from '../components/Stars'
import { HotelCardSkeleton } from '../components/Skeletons'

const num = (v, padrao) =>
  v === null || v === '' || Number.isNaN(Number(v))
    ? padrao
    : Number(v)

function lerFiltros(params) {
  return {
    cidade: params.get('cidade') || '',
    checkin: params.get('checkin') || '',
    checkout: params.get('checkout') || '',
    adultos: num(params.get('adultos'), 2),
    criancas: num(params.get('criancas'), 0),
    bebes: num(params.get('bebes'), 0),
    estrelas: params.get('estrelas') || '',
    buscou: params.has('adultos'),
  }
}

function HotelCard({ hotel, query }) {
  const precos = hotel.quartos
    .map((quarto) => quarto.preco_diaria)
    .filter((preco) => !Number.isNaN(preco))

  const aPartirDe = precos.length ? Math.min(...precos) : null

  return (
    <div className="col">
      <article className="card h-100 hotel-card">
        <HotelCover nome={hotel.nome} />

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h3 className="h5 mb-1">{hotel.nome}</h3>

            {hotel.media_avaliacao != null && (
              <span
                className="badge text-bg-light border"
                title="Média das avaliações"
              >
                {Number(hotel.media_avaliacao).toFixed(1)} / 5
              </span>
            )}
          </div>

          <Stars value={hotel.categoria_estrelas} />

          {hotel.cidade && (
            <p className="text-secondary small mb-2 mt-1">
              {hotel.cidade.nome}
              {hotel.cidade.estado ? `, ${hotel.cidade.estado}` : ''}
            </p>
          )}

          <div className="d-flex flex-wrap gap-1 mb-3">
            {hotel.comodidades.slice(0, 3).map((comodidade) => (
              <span key={comodidade} className="chip">
                {comodidade}
              </span>
            ))}

            {hotel.comodidades.length > 3 && (
              <span className="chip">
                +{hotel.comodidades.length - 3}
              </span>
            )}
          </div>

          <div className="mt-auto d-flex justify-content-between align-items-end">
            <div>
              {aPartirDe != null ? (
                <>
                  <span className="text-secondary small d-block">
                    A partir de
                  </span>

                  <span className="fs-5 fw-semibold">
                    {brl(aPartirDe)}
                  </span>

                  <span className="text-secondary small"> / diária</span>
                </>
              ) : (
                <span className="text-secondary small">
                  Sem quartos cadastrados
                </span>
              )}
            </div>

            <Link
              className="btn btn-primary btn-sm"
              to={`/hoteis/${hotel.id}${query}`}
            >
              Ver quartos
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

function HomePageContent({ params, setParams }) {
  const filtros = useMemo(() => lerFiltros(params), [params])

  const [form, setForm] = useState(filtros)
  const [erroForm, setErroForm] = useState('')

  const hoje = todayISO()

  const cidades = useFetch(
    () => catalogoApi.cidades().then((dados) => asList(dados)),
    [],
  )

  const resultado = useFetch(
    () =>
      Promise.all([
        catalogoApi.buscar({
          cidade_id: filtros.cidade,
          checkin: filtros.checkin,
          checkout: filtros.checkout,
          adultos: filtros.buscou ? filtros.adultos : '',
          criancas: filtros.buscou ? filtros.criancas : '',
          estrelas: filtros.estrelas,
        }),
        catalogoApi.quartos(),
      ]).then(([hoteisData, quartosData]) => {
        const quartos = asList(quartosData)

        return asList(hoteisData).map((hotelData) => {
          const hotel = normalizeHotel({
            ...hotelData,
            quartos: quartos.filter(
              (quarto) =>
                String(quarto.hotel_id) === String(hotelData.id),
            ),
          })

          if (!filtros.buscou) return hotel

          return {
            ...hotel,
            quartos: hotel.quartos.filter(
              (quarto) =>
                quarto.max_adultos >= filtros.adultos &&
                quarto.max_criancas >= filtros.criancas,
            ),
          }
        })
      }),
    [params.toString()],
  )

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function onCheckin(valor) {
    setForm((atual) => ({
      ...atual,
      checkin: valor,
      checkout:
        atual.checkout && atual.checkout <= valor
          ? addDays(valor, 1)
          : atual.checkout,
    }))
  }

  function buscar(evento) {
    evento.preventDefault()

    if (
      (form.checkin && !form.checkout) ||
      (!form.checkin && form.checkout)
    ) {
      setErroForm(
        'Informe as datas de check-in e check-out para pesquisar por período.',
      )
      return
    }

    if (form.checkin && form.checkin < hoje) {
      setErroForm('A data de check-in não pode ser anterior à data atual.')
      return
    }

    if (form.checkin && form.checkout <= form.checkin) {
      setErroForm('O check-out deve ocorrer depois do check-in.')
      return
    }

    setErroForm('')

    setParams({
      cidade: form.cidade,
      checkin: form.checkin,
      checkout: form.checkout,
      adultos: form.adultos,
      criancas: form.criancas,
      bebes: form.bebes,
      estrelas: form.estrelas,
    })
  }

  const query = useMemo(() => {
    const parametros = new URLSearchParams()

    ;['checkin', 'checkout'].forEach((campo) => {
      if (filtros[campo]) {
        parametros.set(campo, filtros[campo])
      }
    })

    if (filtros.buscou) {
      parametros.set('adultos', filtros.adultos)
      parametros.set('criancas', filtros.criancas)
      parametros.set('bebes', filtros.bebes)
    }

    const resultadoQuery = parametros.toString()

    return resultadoQuery ? `?${resultadoQuery}` : ''
  }, [filtros])

  const hoteis = resultado.data || []

  const cidadeNome = asList(cidades.data).find(
    (cidade) => String(cidade.id) === String(filtros.cidade),
  )?.nome

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Encontre o hotel ideal para sua próxima viagem
          </h1>

          <p className="hero-sub">
            Escolha seu destino, informe as datas da hospedagem e consulte
            hotéis e quartos disponíveis para sua estadia.
          </p>
        </div>
      </section>

      <div className="container search-wrap">
        <form className="search-panel" onSubmit={buscar} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label htmlFor="f-cidade" className="form-label">
                Cidade de destino
              </label>

              <select
                id="f-cidade"
                className="form-select"
                value={form.cidade}
                onChange={(evento) =>
                  atualizarCampo('cidade', evento.target.value)
                }
                disabled={cidades.loading}
              >
                <option value="">
                  {cidades.loading
                    ? 'Carregando cidades...'
                    : 'Todas as cidades'}
                </option>

                {asList(cidades.data).map((cidade) => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.nome} - {cidade.estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="f-checkin" className="form-label">
                Check-in
              </label>

              <input
                id="f-checkin"
                type="date"
                className="form-control"
                min={hoje}
                value={form.checkin}
                onChange={(evento) => onCheckin(evento.target.value)}
              />
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="f-checkout" className="form-label">
                Check-out
              </label>

              <input
                id="f-checkout"
                type="date"
                className="form-control"
                min={form.checkin ? addDays(form.checkin, 1) : hoje}
                value={form.checkout}
                onChange={(evento) =>
                  atualizarCampo('checkout', evento.target.value)
                }
              />
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label htmlFor="f-estrelas" className="form-label">
                Categoria do hotel
              </label>

              <select
                id="f-estrelas"
                className="form-select"
                value={form.estrelas}
                onChange={(evento) =>
                  atualizarCampo('estrelas', evento.target.value)
                }
              >
                <option value="">Todas as categorias</option>

                {[5, 4, 3, 2, 1].map((quantidade) => (
                  <option key={quantidade} value={quantidade}>
                    {quantidade}{' '}
                    {quantidade === 1 ? 'estrela' : 'estrelas'}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-lg-3 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                Buscar hotéis
              </button>
            </div>

            <div className="col-4">
              <Counter
                id="f-adultos"
                label="Adultos"
                min={1}
                max={8}
                value={form.adultos}
                onChange={(valor) => atualizarCampo('adultos', valor)}
              />
            </div>

            <div className="col-4">
              <Counter
                id="f-criancas"
                label="Crianças"
                hint="6 a 12 anos"
                max={6}
                value={form.criancas}
                onChange={(valor) => atualizarCampo('criancas', valor)}
              />
            </div>

            <div className="col-4">
              <Counter
                id="f-bebes"
                label="Bebês"
                hint="0 a 5 anos, não pagam"
                max={4}
                value={form.bebes}
                onChange={(valor) => atualizarCampo('bebes', valor)}
              />
            </div>
          </div>

          {erroForm && (
            <div
              className="alert alert-warning py-2 mt-3 mb-0"
              role="alert"
            >
              {erroForm}
            </div>
          )}
        </form>
      </div>

      <section
        className="container mt-5"
        aria-live="polite"
        aria-busy={resultado.loading}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-baseline mb-3 gap-2">
          <h2 className="h4 mb-0">
            {resultado.loading
              ? 'Consultando opções de hospedagem...'
              : `${hoteis.length} ${
                  hoteis.length === 1
                    ? 'hotel encontrado'
                    : 'hotéis encontrados'
                }${cidadeNome ? ` em ${cidadeNome}` : ''}`}
          </h2>

          {filtros.checkin && filtros.checkout && (
            <span className="text-secondary small">
              {formatDate(filtros.checkin)} a{' '}
              {formatDate(filtros.checkout)},{' '}
              {guestsSummary(filtros)}
            </span>
          )}
        </div>

        <ErrorAlert
          error={resultado.error}
          onRetry={resultado.reload}
        />

        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {resultado.loading &&
            [1, 2, 3].map((item) => (
              <HotelCardSkeleton key={item} />
            ))}

          {!resultado.loading &&
            hoteis.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                query={query}
              />
            ))}
        </div>

        {!resultado.loading &&
          !resultado.error &&
          hoteis.length === 0 && (
            <div className="empty-state">
              <p className="fw-semibold mb-1">
                Nenhum hotel encontrado para os critérios informados.
              </p>

              <p className="text-secondary mb-0">
                Experimente alterar a cidade, as datas, a categoria ou a
                quantidade de hóspedes.
              </p>
            </div>
          )}
      </section>
    </>
  )
}

export default function HomePage() {
  const [params, setParams] = useSearchParams()

  return (
    <HomePageContent
      key={params.toString()}
      params={params}
      setParams={setParams}
    />
  )
}