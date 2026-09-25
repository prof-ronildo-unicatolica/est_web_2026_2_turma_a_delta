import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import ErrorAlert from '../../components/ErrorAlert'
import Modal from '../../components/Modal'
import { BlockSkeleton } from '../../components/Skeletons'

/**
 * CRUD genérico do painel admin (tabela + formulário em modal).
 *
 * fields: [{ name, label, type: text|number|select|textarea|checkboxes, required, options, help,
 *            maxLength, min, max, rows, validate(valor, valores) -> mensagem | '' }]
 * columns: [{ key, label, render?(item) }]
 */
export default function CrudPage({
  titulo,
  singular,
  carregar,
  criar,
  atualizar,
  remover,
  colunas,
  campos,
  valoresIniciais,
  paraFormulario,
  paraPayload,
  nomeDoItem = (i) => i.nome,
  recarregarDeps = [],
  acoesDoFormulario,
}) {
  const { data, loading, error, reload } = useFetch(carregar, recarregarDeps)
  const [modal, setModal] = useState(null) // { modo: 'criar' | 'editar', item }
  const [valores, setValores] = useState({})
  const [errosCampo, setErrosCampo] = useState({})
  const [erroForm, setErroForm] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [excluir, setExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [msg, setMsg] = useState(null) // { tipo, texto }

  const itens = data || []

  function abrirCriar() {
    setValores(valoresIniciais)
    setErrosCampo({})
    setErroForm(null)
    setModal({ modo: 'criar' })
  }
  function abrirEditar(item) {
    setValores(paraFormulario(item))
    setErrosCampo({})
    setErroForm(null)
    setModal({ modo: 'editar', item })
  }
  const set = (nome, v) => setValores((s) => ({ ...s, [nome]: v }))

  function validar() {
    const erros = {}
    campos.forEach((c) => {
      const v = valores[c.name]
      const vazio = Array.isArray(v) ? v.length === 0 : v === '' || v === null || v === undefined
      if (c.required && vazio) erros[c.name] = 'Campo obrigatório.'
      else if (!vazio && c.validate) {
        const m = c.validate(v, valores)
        if (m) erros[c.name] = m
      }
    })
    setErrosCampo(erros)
    return Object.keys(erros).length === 0
  }

  async function salvar(e) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true)
    setErroForm(null)
    try {
      const payload = paraPayload(valores)
      if (modal.modo === 'criar') await criar(payload)
      else await atualizar(modal.item.id, payload)
      setMsg({ tipo: 'success', texto: `${singular} ${modal.modo === 'criar' ? 'cadastrado(a)' : 'atualizado(a)'} com sucesso.` })
      setModal(null)
      reload()
    } catch (err) {
      setErroForm(err)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    try {
      await remover(excluir.id)
      setMsg({ tipo: 'success', texto: `${singular} removido(a).` })
      setExcluir(null)
      reload()
    } catch (err) {
      setMsg({ tipo: 'danger', texto: err.message })
      setExcluir(null)
    } finally {
      setExcluindo(false)
    }
  }

  function renderCampo(c) {
    const id = `cf-${c.name}`
    const v = valores[c.name]
    const erro = errosCampo[c.name]
    const cls = `form-control ${erro ? 'is-invalid' : ''}`
    let controle
    if (c.type === 'select') {
      controle = (
        <select id={id} className={`form-select ${erro ? 'is-invalid' : ''}`} value={v} onChange={(e) => set(c.name, e.target.value)}>
          <option value="">Selecione...</option>
          {(c.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    } else if (c.type === 'textarea') {
      controle = <textarea id={id} rows={c.rows || 5} className={`${cls} font-monospace small`} value={v} onChange={(e) => set(c.name, e.target.value)} spellCheck={false} />
    } else if (c.type === 'checkboxes') {
      controle = (
        <div className="d-flex flex-wrap gap-3">
          {(c.options || []).map((o) => (
            <div className="form-check" key={o.value}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`${id}-${o.value}`}
                checked={v.includes(o.value)}
                onChange={(e) => set(c.name, e.target.checked ? [...v, o.value] : v.filter((x) => x !== o.value))}
              />
              <label className="form-check-label" htmlFor={`${id}-${o.value}`}>
                {o.label}
              </label>
            </div>
          ))}
        </div>
      )
    } else {
      controle = (
        <input
          id={id}
          className={cls}
          type={c.type === 'number' ? 'number' : 'text'}
          step={c.step}
          min={c.min}
          max={c.max}
          maxLength={c.maxLength}
          value={v}
          onChange={(e) => set(c.name, c.upper ? e.target.value.toUpperCase() : e.target.value)}
        />
      )
    }
    return (
      <div className="mb-3" key={c.name}>
        <label htmlFor={id} className="form-label">
          {c.label}
          {c.required && <span aria-hidden="true"> *</span>}
        </label>
        {controle}
        {erro && <div className="text-danger small mt-1">{erro}</div>}
        {c.help && !erro && <div className="form-text">{c.help}</div>}
        {c.name === 'limite_territorial' && acoesDoFormulario?.(valores, set)}
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">{titulo}</h1>
        <button type="button" className="btn btn-primary btn-sm" onClick={abrirCriar}>
          Novo(a) {singular.toLowerCase()}
        </button>
      </div>

      {msg && (
        <div className={`alert alert-${msg.tipo} alert-dismissible`} role="status">
          {msg.texto}
          <button type="button" className="btn-close" aria-label="Fechar aviso" onClick={() => setMsg(null)}></button>
        </div>
      )}
      <ErrorAlert error={error} onRetry={reload} />
      {loading && !data && <BlockSkeleton height={180} />}

      {data && (
        <div className="table-responsive panel p-0">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                {colunas.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="text-end">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={colunas.length + 1} className="text-center text-secondary py-4">
                    Nenhum(a) {singular.toLowerCase()} cadastrado(a) ainda.
                  </td>
                </tr>
              )}
              {itens.map((item) => (
                <tr key={item.id}>
                  {colunas.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>
                  ))}
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={() => abrirEditar(item)}>
                      Editar
                    </button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setExcluir(item)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={`${modal.modo === 'criar' ? 'Novo(a)' : 'Editar'} ${singular.toLowerCase()}`}
          busy={salvando}
          onClose={() => setModal(null)}
          footer={
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setModal(null)} disabled={salvando}>
                Cancelar
              </button>
              <button type="submit" form="crud-form" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          }
        >
          <form id="crud-form" onSubmit={salvar} noValidate>
            {campos.map(renderCampo)}
            <ErrorAlert error={erroForm} className="mb-0" />
          </form>
        </Modal>
      )}

      {excluir && (
        <Modal
          title={`Excluir ${singular.toLowerCase()}`}
          busy={excluindo}
          onClose={() => setExcluir(null)}
          footer={
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setExcluir(null)} disabled={excluindo}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmarExclusao} disabled={excluindo}>
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </>
          }
        >
          <p className="mb-0">
            Excluir <strong>{nomeDoItem(excluir)}</strong>? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  )
}
