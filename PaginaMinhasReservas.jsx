import { useEffect, useState } from 'react'
import {
  obterUsuarioAtual,
  listarReservasDoUsuario,
  cancelarReserva,
} from '../../services/api'

const statusClasse = {
  Pendente: 'bg-warning text-dark',
  Confirmada: 'bg-success',
  Cancelada: 'bg-secondary',
}

export default function PaginaMinhasReservas({ aoNavegar }) {
  const [reservas, setReservas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [cancelando, setCancelando] = useState(null)

  useEffect(() => {
    carregarReservas()
  }, [])

  async function carregarReservas() {
    setCarregando(true)
    const usuario = await obterUsuarioAtual()
    const dados = await listarReservasDoUsuario(usuario.id)
    setReservas(dados)
    setCarregando(false)
  }

  async function handleCancelar(reservaId) {
    setCancelando(reservaId)
    await cancelarReserva(reservaId)
    await carregarReservas()
    setCancelando(null)
  }

  if (carregando) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando reservas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-secondary mb-3 fs-4">Minhas reservas</h2>

      {reservas.length === 0 && (
        <div className="alert alert-info shadow-sm">
          Você ainda não tem reservas.{' '}
          <button className="btn btn-link p-0" onClick={() => aoNavegar({ pagina: 'hoteis' })}>
            Buscar hotéis
          </button>
        </div>
      )}

      <div className="list-group shadow-sm border-0">
        {reservas.map((reserva) => (
          <div key={reserva.id} className="list-group-item border-1 rounded mb-2 p-3">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <p className="mb-1 fw-bold">
                  {new Date(reserva.data_checkin).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(reserva.data_checkout).toLocaleDateString('pt-BR')}
                </p>
                <p className="mb-1 small text-muted">
                  {reserva.quantidade_adultos} adulto(s)
                  {reserva.quantidade_criancas > 0 ? `, ${reserva.quantidade_criancas} criança(s)` : ''}
                  {reserva.quantidade_bebes > 0 ? `, ${reserva.quantidade_bebes} bebê(s)` : ''}
                  {' · '}Tarifa {reserva.tarifa_tipo}
                </p>
                <p className="mb-0 fw-bold text-primary">
                  R$ {Number(reserva.valor_total).toFixed(2)}
                </p>
              </div>
              <div className="text-end">
                <span className={`badge ${statusClasse[reserva.status] || 'bg-secondary'} mb-2`}>
                  {reserva.status}
                </span>
                <br />
                {reserva.status !== 'Cancelada' && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    type="button"
                    disabled={cancelando === reserva.id}
                    onClick={() => handleCancelar(reserva.id)}
                  >
                    {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
