export default function AvaliacoesHotel({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return <p className="text-muted small">Este hotel ainda não possui avaliações.</p>
  }

  const media = (
    avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length
  ).toFixed(1)

  return (
    <div>
      <p className="mb-3">
        <span className="fs-4 fw-bold text-primary">{media}</span>
        <span className="text-warning ms-1">★</span>
        <span className="text-muted small ms-2">({avaliacoes.length} avaliação(ões))</span>
      </p>
      <div className="list-group shadow-sm border-0">
        {avaliacoes.map((avaliacao) => (
          <div key={avaliacao.id} className="list-group-item border-1 rounded mb-2">
            <div className="d-flex justify-content-between">
              <span className="text-warning">
                {'★'.repeat(avaliacao.nota)}
                <span className="text-secondary">{'★'.repeat(5 - avaliacao.nota)}</span>
              </span>
              <span className="text-muted small">
                {new Date(avaliacao.data_publicacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {avaliacao.comentario && <p className="mb-0 mt-1 small">{avaliacao.comentario}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
