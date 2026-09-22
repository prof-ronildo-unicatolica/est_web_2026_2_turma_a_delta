import { useState } from 'react'
import { login, obterUsuarioAtual, registrar } from '../../services/api'

export default function PaginaLogin({ aoLogar }) {
  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (modo === 'cadastro') {
        await registrar(form)
      }
      await login({ email: form.email, senha: form.senha })
      const usuario = await obterUsuarioAtual()
      aoLogar(usuario)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="text-primary fw-bold fs-4 mb-1">
              {modo === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>
            <p className="text-muted small mb-4">
              {modo === 'login'
                ? 'Acesse sua conta para buscar hotéis e reservar.'
                : 'Cadastre-se para começar a reservar hotéis.'}
            </p>

            {erro && (
              <div className="alert alert-danger" role="alert">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {modo === 'cadastro' && (
                <div className="mb-3">
                  <label className="form-label small">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nome}
                    onChange={(e) => atualizar('nome', e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => atualizar('email', e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.senha}
                  onChange={(e) => atualizar('senha', e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <button className="btn btn-primary w-100" type="submit" disabled={enviando}>
                {enviando ? 'Enviando...' : modo === 'login' ? 'Entrar' : 'Cadastrar e entrar'}
              </button>
            </form>

            <hr className="my-4" />

            <button
              className="btn btn-link p-0 small"
              type="button"
              onClick={() => {
                setErro(null)
                setModo((m) => (m === 'login' ? 'cadastro' : 'login'))
              }}
            >
              {modo === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
