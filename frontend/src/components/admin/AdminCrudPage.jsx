import { useEffect, useState } from 'react'

/**
 * Página de CRUD administrativo genérica, guiada por uma descrição de
 * campos (`fields`). Usada pelas telas em src/pages/admin/*.jsx para
 * evitar duplicar a mesma tabela + formulário de criação em cada entidade.
 *
 * @param {string} title
 * @param {{name: string, label: string, type?: 'text'|'number'|'date', options?: {value:string,label:string}[]}[]} fields
 * @param {() => Promise<any[]>} listFn
 * @param {(dados: object) => Promise<any>} createFn
 * @param {(id: string) => Promise<void>} removeFn
 */
export default function AdminCrudPage({ title, description, fields, listFn, createFn, removeFn }) {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState({})
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    listFn().then((dados) => {
      setItens(dados)
      setCarregando(false)
    })
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function abrirFormulario() {
    const inicial = {}
    fields.forEach((f) => { inicial[f.name] = f.type === 'number' ? 0 : '' })
    setForm(inicial)
    setFormAberto(true)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await createFn(form)
      setFormAberto(false)
      carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(id) {
    if (!confirm('Remover este item?')) return
    await removeFn(id)
    carregar()
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h5 className="card-title mb-1">{title}</h5>
            {description && <p className="text-muted small mb-0">{description}</p>}
          </div>
          <button className="btn btn-primary btn-sm" onClick={abrirFormulario}>
            + Novo
          </button>
        </div>

        {formAberto && (
          <form className="border rounded p-3 mb-3 bg-light" onSubmit={handleSalvar}>
            <div className="row g-2">
              {fields.map((f) => (
                <div className="col-md-4" key={f.name}>
                  <label className="form-label small mb-1">{f.label}</label>
                  {f.options ? (
                    <select
                      className="form-select form-select-sm"
                      value={form[f.name] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      required
                    >
                      <option value="" disabled>Selecione...</option>
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      className="form-control form-control-sm"
                      value={form[f.name] ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })
                      }
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-success btn-sm" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setFormAberto(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {carregando ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr>
                  {fields.map((f) => (
                    <th key={f.name}>{f.label}</th>
                  ))}
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    {fields.map((f) => (
                      <td key={f.name}>
                        {f.options
                          ? f.options.find((o) => o.value === item[f.name])?.label ?? item[f.name]
                          : String(item[f.name] ?? '')}
                      </td>
                    ))}
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemover(item.id)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={fields.length + 1} className="text-center text-muted py-3">
                      Nenhum registro cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
