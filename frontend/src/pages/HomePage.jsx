import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listarCidades } from '../services/hoteisService'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [cidades, setCidades] = useState([])

  const [cidadeId, setCidadeId] = useState(searchParams.get('cidadeId') || '')
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '')
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '')
  const [adultos, setAdultos] = useState(2)
  const [criancas, setCriancas] = useState(0)
  const [estrelas, setEstrelas] = useState('')

  useEffect(() => {
    listarCidades().then(setCidades)
  }, [])

  function handleBuscar(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (cidadeId) params.set('cidadeId', cidadeId)
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    if (estrelas) params.set('estrelas', estrelas)
    params.set('adultos', adultos)
    params.set('criancas', criancas)
    navigate(`/hoteis?${params.toString()}`)
  }

  return (
    <>
      <header className="mb-5 p-4 p-md-5 bg-white rounded shadow-sm text-center">
        <h1 className="display-5 text-primary fw-bold">Encontre seu próximo hotel</h1>
        <p className="lead text-secondary">
          Busque por cidade, datas e categoria — reserve em poucos cliques.
        </p>
      </header>

      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">
          <form className="row g-3 align-items-end" onSubmit={handleBuscar}>
            <div className="col-md-3">
              <label className="form-label">Cidade</label>
              <select className="form-select" value={cidadeId} onChange={(e) => setCidadeId(e.target.value)}>
                <option value="">Todas as cidades</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Check-in</label>
              <input type="date" className="form-control" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Check-out</label>
              <input type="date" className="form-control" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Adultos</label>
              <input type="number" min={1} className="form-control" value={adultos} onChange={(e) => setAdultos(Number(e.target.value))} />
            </div>
            <div className="col-md-1">
              <label className="form-label">Crianças</label>
              <input type="number" min={0} className="form-control" value={criancas} onChange={(e) => setCriancas(Number(e.target.value))} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Estrelas</label>
              <select className="form-select" value={estrelas} onChange={(e) => setEstrelas(e.target.value)}>
                <option value="">Qualquer</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {'⭐'.repeat(n)}+
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary px-4">
                Buscar Hotéis
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="alert alert-info small">
        Os dados de hotéis exibidos neste protótipo são <strong>mock</strong> (estáticos). Assim que o
        core-service expuser as rotas reais de hotéis/quartos, o serviço em{' '}
        <code>src/services/hoteisService.js</code> passará a consumi-las.
      </div>
    </>
  )
}
