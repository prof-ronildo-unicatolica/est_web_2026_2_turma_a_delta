import { useMemo, useState } from 'react'
import { calcularValorTotal, criarReserva, obterUsuarioAtual } from '../../services/api'

const hoje = new Date().toISOString().slice(0, 10)

export default function PaginaNovaReserva({ hotel, quarto, aoNavegar }) {
  const [form, setForm] = useState({
    data_checkin: hoje,
    data_checkout: hoje,
    quantidade_adultos: 1,
    quantidade_criancas: 0,
    quantidade_bebes: 0,
    early_checkin: false,
    late_checkout: false,
    necessita_berco: false,
    tarifa_tipo: 'Reembolsavel',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  const { diarias, valorTotal } = useMemo(
    () =>
      calcularValorTotal({
        precoDiaria: Number(quarto.preco_diaria),
        dataCheckin: form.data_checkin,
        dataCheckout: form.data_checkout,
      }),
    [form.data_checkin, form.data_checkout, quarto.preco_diaria],
  )

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function validar() {
    if (new Date(form.data_checkout) <= new Date(form.data_checkin)) {
      return 'A data de check-out deve ser depois da data de check-in.'
    }
    if (form.quantidade_adultos < 1) {
      return 'É necessário pelo menos 1 adulto na reserva.'
    }
    if (form.quantidade_adultos > quarto.max_adultos) {
      return `Este quarto acomoda no máximo ${quarto.max_adultos} adulto(s).`
    }
    if (form.quantidade_criancas > quarto.max_criancas) {
      return `Este quarto acomoda no máximo ${quarto.max_criancas} criança(s).`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    const mensagemValidacao = validar()
    if (mensagemValidacao) {
      setErro(mensagemValidacao)
      return
    }

    setEnviando(true)
    try {
      const usuario = await obterUsuarioAtual()
      const reserva = await criarReserva({
        usuario_id: usuario.id,
        quarto_id: quarto.id,
        ...form,
        valor_total: valorTotal,
      })
      setSucesso(reserva)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="alert alert-success shadow-sm p-4">
        <h4 className="alert-heading fw-bold">Reserva registrada!</h4>
        <p className="mb-1">
          {hotel.nome} — Quarto {quarto.numero} ({quarto.tipo})
        </p>
        <p className="mb-1">
          {new Date(form.data_checkin).toLocaleDateString('pt-BR')} até{' '}
          {new Date(form.data_checkout).toLocaleDateString('pt-BR')} ({diarias} diária(s))
        </p>
        <p className="mb-3 fw-bold">Valor total: R$ {valorTotal.toFixed(2)}</p>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => aoNavegar({ pagina: 'minhas-reservas' })}
        >
          Ver minhas reservas
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        className="btn btn-sm btn-outline-secondary mb-3"
        type="button"
        onClick={() => aoNavegar({ pagina: 'hotel-detalhe', hotelId: hotel.id })}
      >
        &larr; Voltar para o hotel
      </button>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white fw-bold">
          Nova reserva — {hotel.nome} · Quarto {quarto.numero} ({quarto.tipo})
        </div>
        <div className="card-body">
          {erro && (
            <div className="alert alert-danger" role="alert">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small">Check-in</label>
                <input
                  type="date"
                  className="form-control"
                  min={hoje}
                  value={form.data_checkin}
                  onChange={(e) => atualizar('data_checkin', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Check-out</label>
                <input
                  type="date"
                  className="form-control"
                  min={form.data_checkin}
                  value={form.data_checkout}
                  onChange={(e) => atualizar('data_checkout', e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Adultos (máx. {quarto.max_adultos})</label>
                <input
                  type="number"
                  min={1}
                  max={quarto.max_adultos}
                  className="form-control"
                  value={form.quantidade_adultos}
                  onChange={(e) => atualizar('quantidade_adultos', Number(e.target.value))}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Crianças (máx. {quarto.max_criancas})</label>
                <input
                  type="number"
                  min={0}
                  max={quarto.max_criancas}
                  className="form-control"
                  value={form.quantidade_criancas}
                  onChange={(e) => atualizar('quantidade_criancas', Number(e.target.value))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Bebês</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={form.quantidade_bebes}
                  onChange={(e) => atualizar('quantidade_bebes', Number(e.target.value))}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Tipo de tarifa</label>
                <select
                  className="form-select"
                  value={form.tarifa_tipo}
                  onChange={(e) => atualizar('tarifa_tipo', e.target.value)}
                >
                  <option value="Reembolsavel">Reembolsável</option>
                  <option value="Nao Reembolsavel">Não reembolsável</option>
                </select>
              </div>

              <div className="col-md-8 d-flex align-items-end gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="early-checkin"
                    checked={form.early_checkin}
                    onChange={(e) => atualizar('early_checkin', e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="early-checkin">
                    Early check-in
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="late-checkout"
                    checked={form.late_checkout}
                    onChange={(e) => atualizar('late_checkout', e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="late-checkout">
                    Late check-out
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="necessita-berco"
                    checked={form.necessita_berco}
                    onChange={(e) => atualizar('necessita_berco', e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="necessita-berco">
                    Berço
                  </label>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-0 text-muted small">{diarias} diária(s) × R$ {Number(quarto.preco_diaria).toFixed(2)}</p>
                <p className="fs-4 fw-bold text-primary mb-0">Total: R$ {valorTotal.toFixed(2)}</p>
              </div>
              <button className="btn btn-primary" type="submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
