import { useEffect, useRef, useState } from 'react'
import { reservasApi } from '../api/services'
import { Link } from '../router/Router'
import { useParams } from '../router/hooks'
import { loadReservaSnapshot, normalizeReserva, STATUS } from '../utils/catalog'
import { brl, formatDate, guestsSummary } from '../utils/format'
import ErrorAlert from '../components/ErrorAlert'

const INTERVALO_MS = 3000
const MAX_TENTATIVAS = 40 // ~2 min

/** Tela 5: acompanha a reserva na fila (short polling a cada 3s) e mostra Voucher ou Erro. */
export default function ReservaStatusPage() {
  const { id } = useParams()
  const snapshot = loadReservaSnapshot(id)
  const [reserva, setReserva] = useState(null)
  const [erro, setErro] = useState(null)
  const [demorou, setDemorou] = useState(false)
  const tentativas = useRef(0)

  useEffect(() => {
    let cancelado = false
    let timer
    tentativas.current = 0

    async function consultar() {
      try {
        const r = normalizeReserva(await reservasApi.obter(id))
        if (cancelado) return
        setReserva(r)
        setErro(null)
        if (r.status === STATUS.PENDENTE) {
          tentativas.current += 1
          if (tentativas.current >= MAX_TENTATIVAS) setDemorou(true)
          else timer = setTimeout(consultar, INTERVALO_MS)
        }
      } catch (err) {
        if (cancelado) return
        setErro(err)
        // falha de rede/servidor: continua tentando; 401/403/404: para
        if (err.status === 0 || err.status >= 500) timer = setTimeout(consultar, INTERVALO_MS)
      }
    }

    consultar()
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [id])

  const dados = reserva ? { ...snapshot, ...stripNulls(reserva) } : snapshot
  const status = reserva?.status

  if (!reserva && erro && erro.status !== 0 && erro.status < 500) {
    return (
      <div className="container py-5" style={{ maxWidth: 640 }}>
        <ErrorAlert error={erro} />
        <Link to="/minhas-reservas" className="btn btn-outline-primary">
          Ir para Minhas reservas
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      {(!status || status === STATUS.PENDENTE) && (
        <div className="panel text-center processing" role="status" aria-live="polite">
          <div className="spinner-border text-primary mb-3" aria-hidden="true"></div>
          <h1 className="h4">Processando sua reserva...</h1>
          {demorou ? (
            <>
              <p className="text-secondary">
                A confirmação está demorando mais que o normal. Você pode sair desta tela: acompanhe o andamento em Minhas reservas.
              </p>
              <Link to="/minhas-reservas" className="btn btn-primary">
                Ver minhas reservas
              </Link>
            </>
          ) : (
            <>
              <p className="text-secondary mb-1">Sua solicitação está na fila. Estamos validando a disponibilidade e confirmando o pagamento.</p>
              <p className="small text-secondary mb-0">Atualizamos o status automaticamente a cada 3 segundos.</p>
            </>
          )}
          {erro && <p className="small text-danger mt-3 mb-0">Sem conexão com o servidor. Tentando novamente...</p>}
        </div>
      )}

      {status === STATUS.CONFIRMADA && (
        <div className="voucher">
          <div className="voucher-head">
            <span className="voucher-check" aria-hidden="true">
              ✓
            </span>
            <div>
              <h1 className="h4 mb-0">Reserva confirmada</h1>
              <p className="mb-0 small">Guarde este voucher para o check-in.</p>
            </div>
          </div>
          <div className="voucher-body">
            <p className="small text-secondary mb-3">
              Voucher <code>#{id}</code>
            </p>
            <dl className="voucher-grid">
              {dados?.hotel_nome && (
                <>
                  <dt>Hotel</dt>
                  <dd>{dados.hotel_nome}</dd>
                </>
              )}
              {dados?.quarto_numero && (
                <>
                  <dt>Quarto</dt>
                  <dd>
                    {dados.quarto_numero}
                    {dados.quarto_tipo ? ` (${dados.quarto_tipo})` : ''}
                  </dd>
                </>
              )}
              <dt>Check-in</dt>
              <dd>{formatDate(dados?.data_checkin)}</dd>
              <dt>Check-out</dt>
              <dd>{formatDate(dados?.data_checkout)}</dd>
              <dt>Hóspedes</dt>
              <dd>
                {guestsSummary({
                  adultos: dados?.quantidade_adultos ?? 0,
                  criancas: dados?.quantidade_criancas ?? 0,
                  bebes: dados?.quantidade_bebes ?? 0,
                })}
              </dd>
              <dt>Tarifa</dt>
              <dd>{dados?.tarifa_tipo === 'Nao Reembolsavel' ? 'Não reembolsável' : 'Reembolsável'}</dd>
              {dados?.data_limite_cancelamento && (
                <>
                  <dt>Cancelamento grátis até</dt>
                  <dd>{formatDate(dados.data_limite_cancelamento)}</dd>
                </>
              )}
              <dt>Valor total</dt>
              <dd className="fw-semibold">{brl(dados?.valor_total ?? dados?.valor_estimado)}</dd>
            </dl>
          </div>
          <div className="voucher-actions">
            <Link to="/minhas-reservas" className="btn btn-primary">
              Ir para Minhas reservas
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>
              Imprimir voucher
            </button>
          </div>
        </div>
      )}

      {status === STATUS.CANCELADA && (
        <div className="panel text-center" role="alert">
          <div className="error-mark" aria-hidden="true">
            !
          </div>
          <h1 className="h4">Não foi possível confirmar a reserva</h1>
          <p className="text-secondary">
            O quarto ficou indisponível para o período (outra reserva foi confirmada antes) ou o pagamento não foi aprovado.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link to={dados?.hotel_id ? `/hoteis/${dados.hotel_id}` : '/'} className="btn btn-primary">
              Escolher outro quarto
            </Link>
            <Link to="/minhas-reservas" className="btn btn-outline-secondary">
              Ver minhas reservas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function stripNulls(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined))
}
