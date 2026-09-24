import { useEffect, useMemo, useState } from 'react'
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

const num = (v, padrao) => (v === null || v === '' || Number.isNaN(Number(v)) ? padrao : Number(v))

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
  const precos = hotel.quartos.map((q) => q.preco_diaria).filter((p) => !Number.isNaN(p))
  const aPartirDe = precos.length ? Math.min(...precos) : null
  return (
    <div className="col">
      <article className="card h-100 hotel-card">
        <HotelCover nome={hotel.nome} />
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h3 className="h5 mb-1">{hotel.nome}</h3>
            {hotel.media_avaliacao != null && (
              <span className="badge text-bg-light border" title="Média das avaliações">
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
            {hotel.comodidades.slice(0, 3).map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
            {hotel.comodidades.length > 3 && <span className="chip">+{hotel.comodidades.length - 3}</span>}
          </div>
          <div className="mt-auto d-flex justify-content-between align-items-end">
            <div>
              {aPartirDe != null ? (
                <>
                  <span className="text-secondary small d-block">a partir de</span>
                  <span className="fs-5 fw-semibold">{brl(aPartirDe)}</span>
                  <span className="text-secondary small"> / diária</span>
                </>
              ) : (
                <span className="text-secondary small">Sem quartos cadastrados</span>
              )}
            </div>
            <Link className="btn btn-primary btn-sm" to={`/hoteis/${hotel.id}${query}`}>
              Ver quartos
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

export default function HomePage() {
  const [params, setParams] = useSearchParams()
  const filtros = useMemo(() => lerFiltros(params), [params])
  const [form, setForm] = useState(filtros)
  const [erroForm, setErroForm] = useState('')
  const hoje = todayISO()

  useEffect(() => setForm(filtros), [filtros])

  const cidades = useFetch(() => catalogoApi.cidades().then((d) => asList(d)), [])
  const resultado = useFetch(
    () =>
      catalogoApi
        .buscar({
          cidade_id: filtros.cidade,
          checkin: filtros.checkin,
          checkout: filtros.checkout,
          adultos: filtros.buscou ? filtros.adultos : '',
          criancas: filtros.buscou ? filtros.criancas : '',
          estrelas: filtros.estrelas,
        })
        .then((d) => asList(d).map(normalizeHotel)),
    [params.toString()],
  )

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  function onCheckin(valor) {
    setForm((f) => ({
      ...f,
      checkin: valor,
      checkout: f.checkout && f.checkout <= valor ? addDays(valor, 1) : f.checkout,
    }))
  }

  function buscar(e) {
    e.preventDefault()
    if ((form.checkin && !form.checkout) || (!form.checkin && form.checkout)) {
      setErroForm('Informe check-in e check-out para filtrar por período.')
      return
    }
    if (form.checkin && form.checkin < hoje) {
      setErroForm('O check-in não pode ser no passado.')
      return
    }
    if (form.checkin && form.checkout <= form.checkin) {
      setErroForm('O check-out deve ser depois do check-in.')
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

  // Carrega para as próximas telas o que o usuário já informou
  const query = useMemo(() => {
    const q = new URLSearchParams()
    ;['checkin', 'checkout'].forEach((k) => filtros[k] && q.set(k, filtros[k]))
    if (filtros.buscou) {
      q.set('adultos', filtros.adultos)
      q.set('criancas', filtros.criancas)
      q.set('bebes', filtros.bebes)
    }
    const s = q.toString()
    return s ? `?${s}` : ''
  }, [filtros])

  const hoteis = resultado.data || []
  const cidadeNome = asList(cidades.data).find((c) => String(c.id) === String(filtros.cidade))?.nome

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Escolha a cidade, as datas e quem vai com você.</h1>
          <p className="hero-sub">Mostramos só os quartos livres no período e que comportam o seu grupo.</p>
        </div>
      </section>

      <div className="container search-wrap">
        <form className="search-panel" onSubmit={buscar} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label htmlFor="f-cidade" className="form-label">
                Cidade
              </label>
              <select
                id="f-cidade"
                className="form-select"
                value={form.cidade}
                onChange={(e) => set('cidade', e.target.value)}
                disabled={cidades.loading}
              >
                <option value="">{cidades.loading ? 'Carregando...' : 'Todas as cidades'}</option>
                {asList(cidades.data).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="f-checkin" className="form-label">
                Check-in
              </label>
              <input id="f-checkin" type="date" className="form-control" min={hoje} value={form.checkin} onChange={(e) => onCheckin(e.target.value)} />
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
                onChange={(e) => set('checkout', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label htmlFor="f-estrelas" className="form-label">
                Categoria
              </label>
              <select id="f-estrelas" className="form-select" value={form.estrelas} onChange={(e) => set('estrelas', e.target.value)}>
                <option value="">Qualquer</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'estrela' : 'estrelas'}
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
              <Counter id="f-adultos" label="Adultos" min={1} max={8} value={form.adultos} onChange={(v) => set('adultos', v)} />
            </div>
            <div className="col-4">
              <Counter id="f-criancas" label="Crianças" hint="6 a 12 anos" max={6} value={form.criancas} onChange={(v) => set('criancas', v)} />
            </div>
            <div className="col-4">
              <Counter id="f-bebes" label="Bebês" hint="0 a 5 anos, não pagam" max={4} value={form.bebes} onChange={(v) => set('bebes', v)} />
            </div>
          </div>
          {erroForm && (
            <div className="alert alert-warning py-2 mt-3 mb-0" role="alert">
              {erroForm}
            </div>
          )}
        </form>
      </div>

      <section className="container mt-5" aria-live="polite" aria-busy={resultado.loading}>
        <div className="d-flex flex-wrap justify-content-between align-items-baseline mb-3 gap-2">
          <h2 className="h4 mb-0">
            {resultado.loading
              ? 'Buscando hotéis...'
              : `${hoteis.length} ${hoteis.length === 1 ? 'hotel encontrado' : 'hotéis encontrados'}${cidadeNome ? ` em ${cidadeNome}` : ''}`}
          </h2>
          {filtros.checkin && filtros.checkout && (
            <span className="text-secondary small">
              {formatDate(filtros.checkin)} a {formatDate(filtros.checkout)}, {guestsSummary(filtros)}
            </span>
          )}
        </div>

        <ErrorAlert error={resultado.error} onRetry={resultado.reload} />

        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {resultado.loading && [1, 2, 3].map((i) => <HotelCardSkeleton key={i} />)}
          {!resultado.loading && hoteis.map((h) => <HotelCard key={h.id} hotel={h} query={query} />)}
        </div>

        {!resultado.loading && !resultado.error && hoteis.length === 0 && (
          <div className="empty-state">
            <p className="fw-semibold mb-1">Nenhum hotel atende a esses filtros.</p>
            <p className="text-secondary mb-0">Tente outras datas, outra categoria ou menos hóspedes.</p>
          </div>
        )}
      </section>
    </>
  )
}
