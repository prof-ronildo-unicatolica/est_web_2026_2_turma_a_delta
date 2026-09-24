import { useEffect, useMemo, useState } from 'react'
import { reservasApi } from '../api/services'
import useFetch from '../hooks/useFetch'
import { Link } from '../router/Router'
import { asList, loadReservaSnapshot, normalizeReserva, STATUS } from '../utils/catalog'
import { brl, formatDate, guestsSummary, todayISO } from '../utils/format'
import { TARIFA, simularCancelamento } from '../utils/pricing'
import ErrorAlert from '../components/ErrorAlert'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { BlockSkeleton } from '../components/Skeletons'

const FILTROS = ['Todas', STATUS.PENDENTE, STATUS.CONFIRMADA, STATUS.CANCELADA]

/** Completa hotel/quarto com o resumo salvo no checkout, se a API não devolver esses campos. */
function enriquecer(r) {
  const n = normalizeReserva(r)
  if (n.hotel_nome && n.quarto_numero) return n
  const snap = loadReservaSnapshot(n.id)
  return snap
    ? {
        ...n,
        hotel_id: n.hotel_id ?? snap.hotel_id,
        hotel_nome: n.hotel_nome ?? snap.hotel_nome,
        quarto_numero: n.quarto_numero ?? snap.quarto_numero,
        quarto_tipo: n.quarto_tipo ?? snap.quarto_tipo,
        preco_diaria: n.preco_diaria ?? snap.preco_diaria,
      }
    : n
}

function InfoCancelamento({ reserva, hoje }) {
  if (reserva.status === STATUS.CANCELADA) {
    return reserva.valor_multa_cancelamento > 0 ? (
      <p className="small text-danger mb-0">Multa aplicada no cancelamento: {brl(reserva.valor_multa_cancelamento)}</p>
    ) : (
      <p className="small text-secondary mb-0">Cancelada sem multa.</p>
    )
  }
  if (reserva.tarifa_tipo === TARIFA.NAO_REEMBOLSAVEL) {
    return <p className="small text-secondary mb-0">Tarifa não reembolsável: cancelar retém 100% do valor.</p>
  }
  const sim = simularCancelamento(reserva, hoje)
  if (sim.cenario === 'gratuito') {
    return <p className="small text-success mb-0">Cancelamento grátis até {formatDate(sim.limite)}.</p>
  }
  return (
    <p className="small text-warning-emphasis mb-0">
      Prazo de cancelamento grátis encerrado em {formatDate(sim.limite)}. Cancelar agora cobra multa de 1 diária.
    </p>
  )
}

function AvisoMulta({ reserva, hoje }) {
  const sim = simularCancelamento(reserva, hoje)
  if (sim.cenario === 'gratuito') {
    return (
      <div className="alert alert-success mb-0">
        Cancelamento <strong>sem multa</strong>: você está dentro do prazo (até {formatDate(sim.limite)}).
      </div>
    )
  }
  if (sim.cenario === 'nao_reembolsavel') {
    return (
      <div className="alert alert-danger mb-0">
        Tarifa <strong>não reembolsável</strong>: será retido 100% do valor, <strong>{brl(sim.multa)}</strong>.
      </div>
    )
  }
  return (
    <div className="alert alert-warning mb-0">
      O prazo de cancelamento grátis terminou em {formatDate(sim.limite)}. Será cobrada <strong>multa de 1 diária</strong>
      {sim.multa != null ? `: ${brl(sim.multa)}` : ' do quarto'}.
    </div>
  )
}

export default function MinhasReservasPage() {
  const { data, loading, error, reload } = useFetch(() => reservasApi.listar().then((d) => asList(d).map(enriquecer)), [])
  const [filtro, setFiltro] = useState('Todas')
  const [alvo, setAlvo] = useState(null) // reserva em processo de cancelamento
  const [cancelando, setCancelando] = useState(false)
  const [erroCancel, setErroCancel] = useState(null)
  const [aviso, setAviso] = useState(null)
  const hoje = todayISO()

  const reservas = useMemo(
    () => [...(data || [])].sort((a, b) => String(b.data_checkin).localeCompare(String(a.data_checkin))),
    [data],
  )
  const visiveis = filtro === 'Todas' ? reservas : reservas.filter((r) => r.status === filtro)
  const temPendente = reservas.some((r) => r.status === STATUS.PENDENTE)

  // Reservas ainda na fila: atualiza sozinho a cada 3s até saírem de "Pendente"
  useEffect(() => {
    if (!temPendente) return undefined
    const t = setInterval(reload, 3000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temPendente])

  async function confirmarCancelamento() {
    setCancelando(true)
    setErroCancel(null)
    try {
      const r = await reservasApi.cancelar(alvo.id)
      const multa = Number(r?.valor_multa_cancelamento ?? 0)
      setAviso(
        multa > 0
          ? `Reserva cancelada. Multa aplicada: ${brl(multa)}.`
          : 'Reserva cancelada sem multa.',
      )
      setAlvo(null)
      reload()
    } catch (err) {
      setErroCancel(err)
    } finally {
      setCancelando(false)
    }
  }

  const podeCancelar = (r) =>
    (r.status === STATUS.PENDENTE || r.status === STATUS.CONFIRMADA) && String(r.data_checkin).slice(0, 10) >= hoje

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Minhas reservas</h1>
        <Link to="/" className="btn btn-primary btn-sm">
          Nova reserva
        </Link>
      </div>

      {aviso && (
        <div className="alert alert-info alert-dismissible" role="status">
          {aviso}
          <button type="button" className="btn-close" aria-label="Fechar aviso" onClick={() => setAviso(null)}></button>
        </div>
      )}

      <div className="btn-group mb-4 flex-wrap" role="group" aria-label="Filtrar por status">
        {FILTROS.map((f) => (
          <button key={f} type="button" className={`btn btn-sm ${filtro === f ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFiltro(f)}>
            {f}
          </button>
        ))}
      </div>

      <ErrorAlert error={error} onRetry={reload} />
      {loading && !data && <BlockSkeleton height={160} />}

      {data && visiveis.length === 0 && (
        <div className="empty-state">
          <p className="fw-semibold mb-1">{filtro === 'Todas' ? 'Você ainda não fez nenhuma reserva.' : `Nenhuma reserva ${filtro.toLowerCase()}.`}</p>
          {filtro === 'Todas' && (
            <Link to="/" className="btn btn-primary btn-sm mt-2">
              Buscar hotéis
            </Link>
          )}
        </div>
      )}

      <div className="d-grid gap-3">
        {visiveis.map((r) => (
          <article key={r.id} className="panel reserva-card">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
              <div>
                <h2 className="h5 mb-0">{r.hotel_nome || 'Reserva'}</h2>
                <p className="text-secondary small mb-0">
                  {r.quarto_numero ? `Quarto ${r.quarto_numero}${r.quarto_tipo ? `, ${r.quarto_tipo}` : ''}` : `Reserva #${String(r.id).slice(0, 8)}`}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <dl className="reserva-dados">
              <div>
                <dt>Check-in</dt>
                <dd>{formatDate(r.data_checkin)}</dd>
              </div>
              <div>
                <dt>Check-out</dt>
                <dd>{formatDate(r.data_checkout)}</dd>
              </div>
              <div>
                <dt>Hóspedes</dt>
                <dd>
                  {guestsSummary({ adultos: r.quantidade_adultos, criancas: r.quantidade_criancas, bebes: r.quantidade_bebes })}
                </dd>
              </div>
              <div>
                <dt>Tarifa</dt>
                <dd>{r.tarifa_tipo === TARIFA.NAO_REEMBOLSAVEL ? 'Não reembolsável' : 'Reembolsável'}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd className="fw-semibold">{brl(r.valor_total)}</dd>
              </div>
            </dl>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              {r.status === STATUS.PENDENTE ? (
                <p className="small text-secondary mb-0">Aguardando confirmação do pagamento...</p>
              ) : (
                <InfoCancelamento reserva={r} hoje={hoje} />
              )}
              <div className="d-flex gap-2">
                {r.status !== STATUS.CANCELADA && (
                  <Link to={`/reservas/${r.id}`} className="btn btn-outline-secondary btn-sm">
                    {r.status === STATUS.CONFIRMADA ? 'Ver voucher' : 'Acompanhar'}
                  </Link>
                )}
                {podeCancelar(r) && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setErroCancel(null)
                      setAlvo(r)
                    }}
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {alvo && (
        <Modal
          title="Cancelar reserva"
          busy={cancelando}
          onClose={() => setAlvo(null)}
          footer={
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setAlvo(null)} disabled={cancelando}>
                Manter reserva
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmarCancelamento} disabled={cancelando}>
                {cancelando ? 'Cancelando...' : 'Confirmar cancelamento'}
              </button>
            </>
          }
        >
          <p>
            {alvo.hotel_nome ? `${alvo.hotel_nome}, ` : ''}
            {formatDate(alvo.data_checkin)} a {formatDate(alvo.data_checkout)} ({brl(alvo.valor_total)})
          </p>
          <AvisoMulta reserva={alvo} hoje={hoje} />
          <p className="small text-secondary mt-3 mb-0">O valor definitivo da multa é calculado pelo sistema no momento do cancelamento.</p>
          <ErrorAlert error={erroCancel} className="mt-3 mb-0" />
        </Modal>
      )}
    </div>
  )
}
