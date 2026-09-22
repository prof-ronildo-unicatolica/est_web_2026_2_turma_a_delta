import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { consultarReserva } from '../services/reservasService'
import { STATUS_RESERVA } from '../data/mockData'

const INTERVALO_POLLING_MS = 3000

/**
 * Espelha o fluxo descrito em docs/03_arquitetura_tecnica/arquitetura_frontend.md
 * seção 1: após criar a reserva (status "Pendente"), o front-end consulta
 * GET /api/v1/reservas/{id} a cada 3s até o status virar "Confirmada" ou
 * "Cancelada". Hoje o "worker" é simulado em reservasService.js.
 */
export default function ProcessandoReservaPage() {
  const { reservaId } = useParams()
  const navigate = useNavigate()
  const [erro, setErro] = useState(null)
  const intervaloRef = useRef(null)

  useEffect(() => {
    async function poll() {
      try {
        const reserva = await consultarReserva(reservaId)
        if (reserva.status === STATUS_RESERVA.CONFIRMADA) {
          clearInterval(intervaloRef.current)
          navigate(`/reservas/${reservaId}/sucesso`, { replace: true })
        } else if (reserva.status === STATUS_RESERVA.CANCELADA) {
          clearInterval(intervaloRef.current)
          setErro('Não foi possível confirmar sua reserva (falha no pagamento ou indisponibilidade). Tente novamente.')
        }
      } catch (err) {
        clearInterval(intervaloRef.current)
        setErro(err.message)
      }
    }

    poll()
    intervaloRef.current = setInterval(poll, INTERVALO_POLLING_MS)
    return () => clearInterval(intervaloRef.current)
  }, [reservaId, navigate])

  if (erro) {
    return (
      <div className="alert alert-danger shadow-sm p-4">
        <h4 className="alert-heading fw-bold">Falha ao processar reserva</h4>
        <p className="mb-0">{erro}</p>
      </div>
    )
  }

  return (
    <div className="text-center my-5 py-5">
      <div className="spinner-border text-primary" style={{ width: 3, height: 3 }} role="status">
        <span className="visually-hidden">Processando reserva...</span>
      </div>
      <h3 className="mt-4 fw-bold">Processando sua reserva...</h3>
      <p className="text-secondary">
        Estamos aguardando a confirmação do pagamento. Isso pode levar alguns segundos.
      </p>
    </div>
  )
}
