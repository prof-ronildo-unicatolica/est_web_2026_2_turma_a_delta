export default function ContadorHospedes({ titulo, descricao, valor, minimo, aoAlterar }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2">
      <div><strong className="d-block">{titulo}</strong><small className="text-secondary">{descricao}</small></div>
      <div className="d-flex align-items-center gap-3">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => aoAlterar(Math.max(minimo, valor - 1))} disabled={valor <= minimo} aria-label={`Diminuir ${titulo}`}>−</button>
        <strong className="text-center" style={{ minWidth: '20px' }}>{valor}</strong>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => aoAlterar(valor + 1)} aria-label={`Aumentar ${titulo}`}>+</button>
      </div>
    </div>
  )
}
