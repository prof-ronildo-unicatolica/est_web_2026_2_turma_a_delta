export default function FiltrosHoteis({ cidades, filtros, aoMudarFiltros }) {
  function atualizar(campo, valor) {
    aoMudarFiltros({ ...filtros, [campo]: valor })
  }

  return (
    <div className="bg-dark text-white p-3 rounded shadow-sm h-100">
      <h5 className="text-primary fw-bold mb-4 border-bottom pb-2">Filtrar Hotéis</h5>

      <div className="mb-3">
        <label className="form-label small text-white-50" htmlFor="filtro-busca">
          Buscar pelo nome
        </label>
        <input
          id="filtro-busca"
          type="text"
          className="form-control form-control-sm"
          placeholder="Ex: Resort, Pousada..."
          value={filtros.busca || ''}
          onChange={(e) => atualizar('busca', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small text-white-50" htmlFor="filtro-cidade">
          Cidade
        </label>
        <select
          id="filtro-cidade"
          className="form-select form-select-sm"
          value={filtros.cidade_id || ''}
          onChange={(e) => atualizar('cidade_id', e.target.value)}
        >
          <option value="">Todas as cidades</option>
          {cidades.map((cidade) => (
            <option key={cidade.id} value={cidade.id}>
              {cidade.nome}/{cidade.estado}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small text-white-50" htmlFor="filtro-estrelas">
          Categoria mínima
        </label>
        <select
          id="filtro-estrelas"
          className="form-select form-select-sm"
          value={filtros.estrelas_min || ''}
          onChange={(e) => atualizar('estrelas_min', e.target.value)}
        >
          <option value="">Qualquer categoria</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ estrelas
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-sm btn-outline-light w-100"
        type="button"
        onClick={() => aoMudarFiltros({})}
      >
        Limpar filtros
      </button>
    </div>
  )
}
