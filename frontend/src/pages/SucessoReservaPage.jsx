import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { consultarReserva } from '../services/reservasService'
import { getHotelById, getQuartoById } from '../data/mockData'
import { formatarMoeda } from '../services/pricing'

export default function SucessoReservaPage() {
  const { reservaId } = useParams()
  const [reserva, setReserva] = useState(null)

  useEffect(() => {
    consultarReserva(reservaId).then(setReserva)
  }, [reservaId])

  if (!reserva) return null

  const hotel = getHotelById(reserva.hotelId)
  const quarto = getQuartoById(reserva.quartoId)

  return (
    <div className="row justify-content-center my-4">
      <div className="col-lg-7">
        <div className="card shadow-sm border-success">
          <div className="card-body p-4 text-center">
            <div className="display-4 mb-2">🎉</div>
            <h3 className="fw-bold text-success">Reserva Confirmada com Sucesso!</h3>
            <p className="text-muted">Voucher ID: <code>#{reserva.id}</code></p>

            <hr />

            <div className="text-start">
              <p><strong>Hotel:</strong> {hotel?.nome}</p>
              <p><strong>Quarto:</strong> {quarto?.numero} ({quarto?.tipo})</p>
              <p><strong>Check-in:</strong> {reserva.checkin}</p>
              <p><strong>Check-out:</strong> {reserva.checkout}</p>
              <p className="mb-0"><strong>Valor total:</strong> {formatarMoeda(reserva.valorTotal)}</p>
            </div>

            <Link to="/minhas-reservas" className="btn btn-primary mt-4 px-4">
              Ir para Minhas Reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
