import { useMemo, useState } from 'react'
import { catalogoApi, reservasApi } from '../api/services'
import useFetch from '../hooks/useFetch'
import { Link } from '../router/Router'
import { useNavigate, useSearchParams } from '../router/hooks'
import { asList, normalizeHotel, normalizeServico, normalizeTarifa, saveReservaSnapshot } from '../utils/catalog'
import { brl, formatDate, todayISO } from '../utils/format'
import { TARIFA, addDays, calcularOrcamento } from '../utils/pricing'
import Counter from '../components/Counter'
import ErrorAlert from '../components/ErrorAlert'
import { BlockSkeleton } from '../components/Skeletons'

const int = (v, d) => (v === null || Number.isNaN(Number(v)) ? d : Number(v))
const pct = (m) => `${m >= 1 ? '+' : '−'}${Math.abs(Math.round((m - 1) * 100))}%`

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hotelId = params.get('hotel')
  const quartoId = params.get('quarto')

  const catalogo = useFetch(async () => {
    const [hotel, tarifas, servicos] = await Promise.all([
      catalogoApi.hotel(hotelId),
      catalogoApi.tarifas(hotelId),
      catalogoApi.servicos(),
    ])
    return {
      hotel: normalizeHotel(hotel),
      tarifas: asList(tarifas).map(normalizeTarifa),
      servicos: asList(servicos).map(normalizeServico),
    }
  }, [hotelId])

  const [form, setForm] = useState(() => ({
    checkin: params.get('checkin') || '',
    checkout: params.get('checkout') || '',
    adultos: int(params.get('adultos'), 2),
    criancas: int(params.get('criancas'), 0),
    bebes: int(params.get('bebes'), 0),
  }))
  const [early, setEarly] = useState(false)
  const [late, setLate] = useState(false)
  const [berco, setBerco] = useState(false)
  const [tarifaTipo, setTarifaTipo] = useState(TARIFA.REEMBOLSAVEL)
  const [qtdServicos, setQtdServicos] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState(null)
  const hoje = todayISO()

  const hotel = catalogo.data?.hotel
  const tarifas = useMemo(() => catalogo.data?.tarifas ?? [], [catalogo.data])
  const servicosCatalogo = useMemo(() => catalogo.data?.servicos ?? [], [catalogo.data])
  const quarto = hotel?.quartos.find((q) => String(q.id) === String(quartoId))
  const bercoEfetivo = berco && form.bebes > 0

  const orcamento = useMemo(
    () =>
      calcularOrcamento({
        quarto,
        checkin: form.checkin,
        checkout: form.checkout,
        criancas: form.criancas,
        earlyCheckin: early,
        lateCheckout: late,
        tarifaTipo,
        tarifas,
        servicos: servicosCatalogo.map((s) => ({ servico: s, quantidade: qtdServicos[s.id] || 0 })),
      }),
    [quarto, form.checkin, form.checkout, form.criancas, early, late, tarifaTipo, tarifas, servicosCatalogo, qtdServicos],
  )

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  if (!hotelId || !quartoId) {
    return (
      <div className="container py-4">
        <ErrorAlert error="Nenhum quarto selecionado. Escolha um quarto para reservar." />
        <Link to="/" className="btn btn-primary">
          Buscar hotéis
        </Link>
      </div>
    )
  }
  if (catalogo.loading) {
    return (
      <div className="container py-4">
        <BlockSkeleton height={320} />
      </div>
    )
  }
  if (catalogo.error || !quarto) {
    return (
      <div className="container py-4">
        <ErrorAlert error={catalogo.error || 'Quarto não encontrado neste hotel.'} onRetry={catalogo.error ? catalogo.reload : undefined} />
        <Link to={`/hoteis/${hotelId}`} className="btn btn-outline-primary">
          Voltar ao hotel
        </Link>
      </div>
    )
  }

  const erros = []
  if (!form.checkin || !form.checkout) erros.push('Informe as datas de check-in e check-out.')
  else if (form.checkin < hoje) erros.push('O check-in não pode ser no passado.')
  else if (form.checkout <= form.checkin) erros.push('O check-out deve ser depois do check-in.')
  if (form.adultos > quarto.max_adultos) erros.push(`Este quarto comporta no máximo ${quarto.max_adultos} adulto(s).`)
  if (form.criancas > quarto.max_criancas) erros.push(`Este quarto comporta no máximo ${quarto.max_criancas} criança(s).`)
  const podeReservar = erros.length === 0 && orcamento && !enviando

  async function confirmar() {
    if (!podeReservar) return
    setEnviando(true)
    setErroEnvio(null)
    try {
      const reserva = await reservasApi.criar({
        quarto_id: quarto.id,
        data_checkin: form.checkin,
        data_checkout: form.checkout,
        quantidade_adultos: form.adultos,
        quantidade_criancas: form.criancas,
        quantidade_bebes: form.bebes,
        early_checkin: early,
        late_checkout: late,
        necessita_berco: bercoEfetivo,
        tarifa_tipo: tarifaTipo,
        servicos: servicosCatalogo
          .filter((s) => (qtdServicos[s.id] || 0) > 0)
          .map((s) => ({ servico_id: s.id, quantidade: qtdServicos[s.id] })),
      })
      saveReservaSnapshot(reserva.id, {
        hotel_id: hotel.id,
        hotel_nome: hotel.nome,
        quarto_numero: quarto.numero,
        quarto_tipo: quarto.tipo,
        preco_diaria: quarto.preco_diaria,
        valor_estimado: orcamento.total,
        data_checkin: form.checkin,
        data_checkout: form.checkout,
        quantidade_adultos: form.adultos,
        quantidade_criancas: form.criancas,
        quantidade_bebes: form.bebes,
        tarifa_tipo: tarifaTipo,
        data_limite_cancelamento: orcamento.dataLimiteCancelamento,
      })
      navigate(`/reservas/${reserva.id}`)
    } catch (err) {
      setErroEnvio(err)
      setEnviando(false)
    }
  }

  return (
    <div className="container py-4">
      <nav className="mb-3">
        <Link to={`/hoteis/${hotelId}`} className="small">
          ← Voltar ao hotel
        </Link>
      </nav>
      <h1 className="h3 mb-4">Finalizar reserva</h1>

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="panel" aria-labelledby="h-estadia">
            <h2 id="h-estadia" className="h5">
              Estadia
            </h2>
            <div className="row g-3">
              <div className="col-6">
                <label htmlFor="c-checkin" className="form-label">
                  Check-in
                </label>
                <input
                  id="c-checkin"
                  type="date"
                  className="form-control"
                  min={hoje}
                  value={form.checkin}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((f) => ({ ...f, checkin: v, checkout: f.checkout && f.checkout <= v ? addDays(v, 1) : f.checkout }))
                  }}
                />
              </div>
              <div className="col-6">
                <label htmlFor="c-checkout" className="form-label">
                  Check-out
                </label>
                <input
                  id="c-checkout"
                  type="date"
                  className="form-control"
                  min={form.checkin ? addDays(form.checkin, 1) : hoje}
                  value={form.checkout}
                  onChange={(e) => set('checkout', e.target.value)}
                />
              </div>
              <div className="col-4">
                <Counter id="c-adultos" label="Adultos" min={1} max={quarto.max_adultos} value={form.adultos} onChange={(v) => set('adultos', v)} hint={`máx. ${quarto.max_adultos}`} />
              </div>
              <div className="col-4">
                <Counter id="c-criancas" label="Crianças" max={quarto.max_criancas} value={form.criancas} onChange={(v) => set('criancas', v)} hint={`6 a 12 anos, máx. ${quarto.max_criancas}`} />
              </div>
              <div className="col-4">
                <Counter id="c-bebes" label="Bebês" max={4} value={form.bebes} onChange={(v) => set('bebes', v)} hint="0 a 5 anos, grátis" />
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="h-tarifa">
            <h2 id="h-tarifa" className="h5">
              Tarifa
            </h2>
            <div className="form-check option-check">
              <input className="form-check-input" type="radio" name="tarifa" id="t-reemb" checked={tarifaTipo === TARIFA.REEMBOLSAVEL} onChange={() => setTarifaTipo(TARIFA.REEMBOLSAVEL)} />
              <label className="form-check-label" htmlFor="t-reemb">
                <strong>Reembolsável</strong>
                <span className="d-block text-secondary small">
                  Cancelamento grátis até 48h antes do check-in
                  {form.checkin ? ` (até ${formatDate(addDays(form.checkin, -2))})` : ''}. Depois disso, multa de 1 diária.
                </span>
              </label>
            </div>
            <div className="form-check option-check">
              <input className="form-check-input" type="radio" name="tarifa" id="t-nao" checked={tarifaTipo === TARIFA.NAO_REEMBOLSAVEL} onChange={() => setTarifaTipo(TARIFA.NAO_REEMBOLSAVEL)} />
              <label className="form-check-label" htmlFor="t-nao">
                <strong>Não reembolsável</strong> <span className="badge text-bg-success">10% de desconto</span>
                <span className="d-block text-secondary small">Em caso de cancelamento, 100% do valor é retido.</span>
              </label>
            </div>
          </section>

          <section className="panel" aria-labelledby="h-opcionais">
            <h2 id="h-opcionais" className="h5">
              Opcionais
            </h2>
            <div className="form-check option-check">
              <input className="form-check-input" type="checkbox" id="o-early" checked={early} onChange={(e) => setEarly(e.target.checked)} />
              <label className="form-check-label" htmlFor="o-early">
                <strong>Early check-in</strong> (entrada a partir das 08h)
                <span className="d-block text-secondary small">+30% de uma diária ({brl(quarto.preco_diaria * 0.3)})</span>
              </label>
            </div>
            <div className="form-check option-check">
              <input className="form-check-input" type="checkbox" id="o-late" checked={late} onChange={(e) => setLate(e.target.checked)} />
              <label className="form-check-label" htmlFor="o-late">
                <strong>Late checkout</strong> (saída até as 18h)
                <span className="d-block text-secondary small">+30% de uma diária ({brl(quarto.preco_diaria * 0.3)})</span>
              </label>
            </div>
            <div className="form-check option-check">
              <input className="form-check-input" type="checkbox" id="o-berco" checked={bercoEfetivo} disabled={form.bebes < 1} onChange={(e) => setBerco(e.target.checked)} />
              <label className="form-check-label" htmlFor="o-berco">
                <strong>Berço no quarto</strong>
                <span className="d-block text-secondary small">
                  {form.bebes < 1 ? 'Disponível quando houver bebê (0 a 5 anos) na reserva.' : 'Sem custo adicional.'}
                </span>
              </label>
            </div>
          </section>

          {servicosCatalogo.length > 0 && (
            <section className="panel" aria-labelledby="h-servicos">
              <h2 id="h-servicos" className="h5">
                Serviços adicionais
              </h2>
              {servicosCatalogo.map((s) => {
                const qtd = qtdServicos[s.id] || 0
                return (
                  <div key={s.id} className="d-flex justify-content-between align-items-center gap-3 service-row">
                    <div className="form-check mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`s-${s.id}`}
                        checked={qtd > 0}
                        onChange={(e) => setQtdServicos((m) => ({ ...m, [s.id]: e.target.checked ? 1 : 0 }))}
                      />
                      <label className="form-check-label" htmlFor={`s-${s.id}`}>
                        {s.nome} <span className="text-secondary small">({brl(s.preco)} cada)</span>
                      </label>
                    </div>
                    {qtd > 0 && (
                      <div className="input-group input-group-sm qty">
                        <button type="button" className="btn btn-outline-secondary" aria-label={`Diminuir ${s.nome}`} onClick={() => setQtdServicos((m) => ({ ...m, [s.id]: Math.max(1, qtd - 1) }))}>
                          −
                        </button>
                        <span className="input-group-text" aria-label={`Quantidade de ${s.nome}`}>
                          {qtd}
                        </span>
                        <button type="button" className="btn btn-outline-secondary" aria-label={`Aumentar ${s.nome}`} onClick={() => setQtdServicos((m) => ({ ...m, [s.id]: qtd + 1 }))}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )}
        </div>

        <aside className="col-lg-5">
          <div className="panel summary" aria-live="polite">
            <h2 className="h5 mb-1">{hotel.nome}</h2>
            <p className="text-secondary mb-3">
              Quarto {quarto.numero}, {quarto.tipo}
            </p>

            {orcamento ? (
              <>
                <p className="small text-secondary">
                  {formatDate(form.checkin)} a {formatDate(form.checkout)} ({orcamento.noites} {orcamento.noites === 1 ? 'diária' : 'diárias'})
                </p>
                <dl className="price-lines">
                  {orcamento.grupos.map((g, i) => (
                    <div key={i} className="price-line">
                      <dt>
                        {g.noites} × {brl(g.valor)}
                        {g.tarifa && (
                          <span className="d-block small text-secondary">
                            Diária base {brl(orcamento.base)} | {g.tarifa.nome} ({pct(g.multiplicador)})
                          </span>
                        )}
                      </dt>
                      <dd>{brl(g.noites * g.valor)}</dd>
                    </div>
                  ))}
                  {orcamento.taxaCriancas > 0 && (
                    <div className="price-line">
                      <dt>
                        {form.criancas} {form.criancas === 1 ? 'criança' : 'crianças'} (50% da diária)
                      </dt>
                      <dd>{brl(orcamento.taxaCriancas)}</dd>
                    </div>
                  )}
                  {form.bebes > 0 && (
                    <div className="price-line text-secondary">
                      <dt>
                        {form.bebes} {form.bebes === 1 ? 'bebê' : 'bebês'}
                      </dt>
                      <dd>Grátis</dd>
                    </div>
                  )}
                  {orcamento.early > 0 && (
                    <div className="price-line">
                      <dt>Early check-in (+30%)</dt>
                      <dd>{brl(orcamento.early)}</dd>
                    </div>
                  )}
                  {orcamento.late > 0 && (
                    <div className="price-line">
                      <dt>Late checkout (+30%)</dt>
                      <dd>{brl(orcamento.late)}</dd>
                    </div>
                  )}
                  {orcamento.servicos.map((s) => (
                    <div key={s.id} className="price-line">
                      <dt>
                        {s.nome} × {s.quantidade}
                      </dt>
                      <dd>{brl(s.total)}</dd>
                    </div>
                  ))}
                  {orcamento.desconto > 0 && (
                    <div className="price-line text-success">
                      <dt>Desconto não reembolsável (−10%)</dt>
                      <dd>− {brl(orcamento.desconto)}</dd>
                    </div>
                  )}
                </dl>
                <div className="price-total">
                  <span>Total estimado</span>
                  <strong>{brl(orcamento.total)}</strong>
                </div>
                {orcamento.dataLimiteCancelamento && (
                  <p className="small text-secondary mt-2 mb-0">
                    Cancelamento sem multa até {formatDate(orcamento.dataLimiteCancelamento)}.
                  </p>
                )}
              </>
            ) : (
              <p className="text-secondary">Escolha as datas para ver o valor da estadia.</p>
            )}

            {erros.length > 0 && (
              <ul className="alert alert-warning small mt-3 mb-0 ps-4" role="alert">
                {erros.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <ErrorAlert error={erroEnvio} className="mt-3 mb-0" />

            <button type="button" className="btn btn-primary w-100 mt-3" disabled={!podeReservar} onClick={confirmar}>
              {enviando ? 'Enviando...' : 'Confirmar e pagar'}
            </button>
            <p className="small text-secondary mt-2 mb-0">
              O valor final é confirmado pelo sistema ao processar a reserva.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
