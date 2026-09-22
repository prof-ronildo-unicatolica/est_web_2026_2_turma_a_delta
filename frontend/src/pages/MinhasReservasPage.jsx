import { useEffect, useState } from 'react'
import { listarMinhasReservas, cancelarReserva, avaliarHotel } from '../services/reservasService'
import { getHotelById, getQuartoById, STATUS_RESERVA } from '../data/mockData'
import { formatarMoeda } from '../services/pricing'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

export default function MinhasReservasPage() {
  const { usuario } = useAuth()
  const [reservas, setReservas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [reservaEmAvaliacao, setReservaEmAvaliacao] = useState(null)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')

  function carregar() {
    setCarregando(true)
    listarMinhasReservas(usuario.email).then((r) => {
      setReservas(r)
      setCarregando(false)
    })
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  async function handleCancelar(reservaId) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return
    await cancelarReserva(reservaId)
    carregar()
  }

  async function handleAvaliar(e) {
    e.preventDefault()
    await avaliarHotel(reservaEmAvaliacao.id, { nota, comentario })
    setReservaEmAvaliacao(null)
    setComentario('')
    setNota(5)
    carregar()
  }

  const hoje = new Date()

  return (
    <>
      <h2 className="fw-bold mb-4">Minhas Reservas</h2>

      {carregando && (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      )}

      {!carregando && reservas.length === 0 && (
        <div className="alert alert-info">Você ainda não fez nenhuma reserva.</div>
      )}

      <div className="row g-3">
        {reservas.map((reserva) => {
          const hotel = getHotelById(reserva.hotelId)
          const quarto = getQuartoById(reserva.quartoId)
          const podeAvaliar =
            reserva.status === STATUS_RESERVA.CONFIRMADA &&
            new Date(reserva.checkout) < hoje &&
            !reserva.avaliada
          const podeCancelar = reserva.status === STATUS_RESERVA.PENDENTE || reserva.status === STATUS_RESERVA.CONFIRMADA

          return (
            <div className="col-12" key={reserva.id}>
              <div className="card shadow-sm">
                <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <strong>#{reserva.id}</strong>
                      <StatusBadge status={reserva.status} />
                    </div>
                    <p className="mb-0 small text-muted">
                      {hotel?.nome} — Quarto {quarto?.numero} ({quarto?.tipo})
                    </p>
                    <p className="mb-0 small text-muted">
                      {reserva.checkin} até {reserva.checkout} · {formatarMoeda(reserva.valorTotal)}
                    </p>
                    {reserva.status === STATUS_RESERVA.CONFIRMADA && reserva.dataLimiteCancelamento && (
                      <p className="mb-0 small text-secondary">
                        Cancelamento grátis até {reserva.dataLimiteCancelamento}
                      </p>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    {podeCancelar && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelar(reserva.id)}>
                        Cancelar Reserva
                      </button>
                    )}
                    {podeAvaliar && (
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setReservaEmAvaliacao(reserva)}>
                        Avaliar Hotel
                      </button>
                    )}
                    {reserva.avaliada && <span className="badge bg-light text-success border">Avaliado ✓</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {reservaEmAvaliacao && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAvaliar}>
                <div className="modal-header">
                  <h5 className="modal-title">Avaliar estadia — {getHotelById(reservaEmAvaliacao.hotelId)?.nome}</h5>
                  <button type="button" className="btn-close" onClick={() => setReservaEmAvaliacao(null)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Nota (1 a 5)</label>
                  <select className="form-select mb-3" value={nota} onChange={(e) => setNota(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                    ))}
                  </select>
                  <label className="form-label">Comentário</label>
                  <textarea className="form-control" rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setReservaEmAvaliacao(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">Enviar avaliação</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
