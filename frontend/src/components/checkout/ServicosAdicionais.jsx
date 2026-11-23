import { brl } from '../../utils/format'

export default function ServicosAdicionais({ servicos, quantidades, onChange }) {
  if (!servicos.length) return null

  return (
    <section className="panel" aria-labelledby="h-servicos">
      <h2 id="h-servicos" className="h5">Serviços adicionais</h2>
      {servicos.map((servico) => {
        const quantidade = quantidades[servico.id] || 0
        return (
          <div key={servico.id} className="d-flex justify-content-between align-items-center gap-3 service-row">
            <div className="form-check mb-0">
              <input className="form-check-input" type="checkbox" id={`s-${servico.id}`} checked={quantidade > 0} onChange={(event) => onChange(servico.id, event.target.checked ? 1 : 0)} />
              <label className="form-check-label" htmlFor={`s-${servico.id}`}>
                {servico.nome} <span className="text-secondary small">({brl(servico.preco)} cada)</span>
              </label>
            </div>
            {quantidade > 0 && (
              <div className="input-group input-group-sm qty">
                <button type="button" className="btn btn-outline-secondary" aria-label={`Diminuir ${servico.nome}`} onClick={() => onChange(servico.id, Math.max(1, quantidade - 1))}>−</button>
                <span className="input-group-text" aria-label={`Quantidade de ${servico.nome}`}>{quantidade}</span>
                <button type="button" className="btn btn-outline-secondary" aria-label={`Aumentar ${servico.nome}`} onClick={() => onChange(servico.id, quantidade + 1)}>+</button>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
