import useMinhasReservas from '../hooks/useMinhasReservas'
import { Link } from '../router/Router'
import { STATUS } from '../utils/catalog'
import { brl, formatDate, guestsSummary, todayISO } from '../utils/format'
import { podeCancelarReserva } from '../utils/reservas'
import { TARIFA } from '../utils/pricing'
import ErrorAlert from '../components/ErrorAlert'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { BlockSkeleton } from '../components/Skeletons'

const FILTROS = ['Todas', STATUS.PENDENTE, STATUS.CONFIRMADA, STATUS.CANCELADA]

function InfoCancelamento({ reserva }) {
  if (reserva.status === STATUS.CANCELADA) {
    return reserva.valor_multa_cancelamento > 0 ? (
      <p className="small text-danger mb-0">Multa informada pela API: {brl(reserva.valor_multa_cancelamento)}</p>
    ) : (
      <p className="small text-secondary mb-0">Reserva cancelada. A API não informou multa.</p>
    )
  }

  return (
    <p className="small text-secondary mb-0">
      A API atual permite cancelar a reserva, mas ainda não calcula multas ou retenções.
    </p>
  )
}

function AvisoMulta() {
  return (
    <div className="alert alert-info mb-0">
      O backend atual altera o status da reserva para “Cancelada”, mas ainda não implementa o cálculo de multa ou retenção.
    </div>
  )
}

export default function MinhasReservasPage() {
  const {
    data, visiveis, loading, error, reload, filtro, setFiltro, alvo, setAlvo,
    cancelando, erroCancel, setErroCancel, aviso, setAviso, confirmarCancelamento,
  } = useMinhasReservas()
  const hoje = todayISO()
  const podeCancelar = (reserva) => podeCancelarReserva(reserva, hoje)

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
                <InfoCancelamento reserva={r} />
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
          <AvisoMulta />
          <p className="small text-secondary mt-3 mb-0">O cancelamento será processado pela API e o status atualizado.</p>
          <ErrorAlert error={erroCancel} className="mt-3 mb-0" />
        </Modal>
      )}
    </div>
  )
}
