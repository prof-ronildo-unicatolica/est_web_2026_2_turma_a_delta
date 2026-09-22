import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getQuartoById, getHotelById, mockServicosOpcionais } from '../data/mockData'
import { calcularOrcamento, formatarMoeda } from '../services/pricing'
import { criarReserva } from '../services/reservasService'
import { useAuth } from '../context/AuthContext'

export default function CheckoutPage() {
  const { quartoId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const quarto = getQuartoById(quartoId)
  const hotel = quarto ? getHotelById(quarto.hotelId) : null

  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '')
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '')
  const [adultos, setAdultos] = useState(quarto?.capacidadeAdultos || 1)
  const [idadesCriancas, setIdadesCriancas] = useState([])
  const [tipoTarifa, setTipoTarifa] = useState('reembolsavel')
  const [earlyCheckin, setEarlyCheckin] = useState(false)
  const [lateCheckout, setLateCheckout] = useState(false)
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    document.title = 'Checkout - Rede Hoteleira'
  }, [])

  const orcamento = useMemo(
    () =>
      calcularOrcamento({
        quarto,
        checkin,
        checkout,
        tipoTarifa,
        hospedes: { adultos, criancas: idadesCriancas },
        adicionais: { earlyCheckin, lateCheckout },
        servicosSelecionados,
      }),
    [quarto, checkin, checkout, tipoTarifa, adultos, idadesCriancas, earlyCheckin, lateCheckout, servicosSelecionados]
  )

  if (!quarto || !hotel) {
    return <div className="alert alert-danger">Quarto não encontrado.</div>
  }

  function toggleServico(id) {
    setServicosSelecionados((atual) => (atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id]))
  }

  function alterarQuantidadeCriancas(qtd) {
    const nova = Array.from({ length: qtd }, (_, i) => idadesCriancas[i] ?? 8)
    setIdadesCriancas(nova)
  }

  async function handleConfirmar(e) {
    e.preventDefault()
    if (!checkin || !checkout) {
      setErro('Selecione as datas de check-in e check-out.')
      return
    }
    if (orcamento.diarias <= 0) {
      setErro('O check-out deve ser depois do check-in.')
      return
    }

    setErro(null)
    setEnviando(true)
    try {
      const dataLimiteCancelamento = new Date(checkin)
      dataLimiteCancelamento.setDate(dataLimiteCancelamento.getDate() - 2)

      const reserva = await criarReserva({
        usuarioEmail: usuario?.email || 'convidado@teste.com',
        hotelId: hotel.id,
        quartoId: quarto.id,
        checkin,
        checkout,
        tipoTarifa,
        valorTotal: orcamento.total,
        dataLimiteCancelamento:
          tipoTarifa === 'reembolsavel' ? dataLimiteCancelamento.toISOString().slice(0, 10) : null,
      })
      navigate(`/reservas/${reserva.id}/processando`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <h2 className="fw-bold mb-4">Checkout</h2>
      <div className="row g-4">
        <div className="col-lg-7">
          <form onSubmit={handleConfirmar}>
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title">Resumo da estadia</h5>
                <p className="mb-1"><strong>{hotel.nome}</strong> — Quarto {quarto.numero} ({quarto.tipo})</p>
                <div className="row g-3 mt-2">
                  <div className="col-6">
                    <label className="form-label">Check-in</label>
                    <input type="date" className="form-control" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Check-out</label>
                    <input type="date" className="form-control" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Adultos</label>
                    <input type="number" min={1} className="form-control" value={adultos} onChange={(e) => setAdultos(Number(e.target.value))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Crianças</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={idadesCriancas.length}
                      onChange={(e) => alterarQuantidadeCriancas(Number(e.target.value))}
                    />
                  </div>
                </div>
                {idadesCriancas.length > 0 && (
                  <div className="row g-2 mt-1">
                    {idadesCriancas.map((idade, i) => (
                      <div className="col-3" key={i}>
                        <label className="form-label small">Idade criança {i + 1}</label>
                        <input
                          type="number"
                          min={0}
                          max={17}
                          className="form-control form-control-sm"
                          value={idade}
                          onChange={(e) => {
                            const novas = [...idadesCriancas]
                            novas[i] = Number(e.target.value)
                            setIdadesCriancas(novas)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title">Política de cancelamento</h5>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tipoTarifa"
                    id="tarifaReembolsavel"
                    checked={tipoTarifa === 'reembolsavel'}
                    onChange={() => setTipoTarifa('reembolsavel')}
                  />
                  <label className="form-check-label" htmlFor="tarifaReembolsavel">
                    Reembolsável (preço normal, cancelamento grátis até 48h antes do check-in)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tipoTarifa"
                    id="tarifaNaoReembolsavel"
                    checked={tipoTarifa === 'nao_reembolsavel'}
                    onChange={() => setTipoTarifa('nao_reembolsavel')}
                  />
                  <label className="form-check-label" htmlFor="tarifaNaoReembolsavel">
                    Não reembolsável (10% de desconto, sem devolução)
                  </label>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title">Adicionais e serviços</h5>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="earlyCheckin" checked={earlyCheckin} onChange={(e) => setEarlyCheckin(e.target.checked)} />
                  <label className="form-check-label" htmlFor="earlyCheckin">Early Check-in (+30% de 1 diária)</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="lateCheckout" checked={lateCheckout} onChange={(e) => setLateCheckout(e.target.checked)} />
                  <label className="form-check-label" htmlFor="lateCheckout">Late Checkout (+30% de 1 diária)</label>
                </div>
                <hr />
                {mockServicosOpcionais
                  .filter((s) => s.preco != null)
                  .map((servico) => (
                    <div className="form-check" key={servico.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={servico.id}
                        checked={servicosSelecionados.includes(servico.id)}
                        onChange={() => toggleServico(servico.id)}
                      />
                      <label className="form-check-label" htmlFor={servico.id}>
                        {servico.nome} ({formatarMoeda(servico.preco)} {servico.unidade})
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={enviando}>
              {enviando ? 'Enviando reserva...' : 'Confirmar e Pagar'}
            </button>
          </form>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm sticky-top" style={{ top: '5rem' }}>
            <div className="card-body">
              <h5 className="card-title">Resumo do valor</h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Diária base</span>
                  <span>{formatarMoeda(orcamento.diariaBase)}</span>
                </li>
                {orcamento.multiplicadorTemporada > 1 && (
                  <li className="list-group-item d-flex justify-content-between text-warning">
                    <span>Alta temporada ({orcamento.tarifaTemporadaAplicada?.nome}) x{orcamento.multiplicadorTemporada}</span>
                    <span>{formatarMoeda(orcamento.diariaAjustada)}</span>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between">
                  <span>{orcamento.diarias} diária(s)</span>
                  <span>{formatarMoeda(orcamento.subtotalDiarias)}</span>
                </li>
                {orcamento.totalHospedesExtras > 0 && (
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Hóspedes extras</span>
                    <span>{formatarMoeda(orcamento.totalHospedesExtras)}</span>
                  </li>
                )}
                {orcamento.valorEarlyCheckin > 0 && (
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Early check-in</span>
                    <span>{formatarMoeda(orcamento.valorEarlyCheckin)}</span>
                  </li>
                )}
                {orcamento.valorLateCheckout > 0 && (
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Late checkout</span>
                    <span>{formatarMoeda(orcamento.valorLateCheckout)}</span>
                  </li>
                )}
                {orcamento.valorServicos > 0 && (
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Serviços opcionais</span>
                    <span>{formatarMoeda(orcamento.valorServicos)}</span>
                  </li>
                )}
                {orcamento.descontoNaoReembolsavel > 0 && (
                  <li className="list-group-item d-flex justify-content-between text-success">
                    <span>Desconto não-reembolsável</span>
                    <span>- {formatarMoeda(orcamento.descontoNaoReembolsavel)}</span>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between fw-bold fs-5">
                  <span>Total estimado</span>
                  <span>{formatarMoeda(orcamento.total)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
