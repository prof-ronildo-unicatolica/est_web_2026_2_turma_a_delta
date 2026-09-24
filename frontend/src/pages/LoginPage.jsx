import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { ApiError } from '../api/http'
import { Redirect } from '../router/Router'
import { useNavigate, useSearchParams } from '../router/hooks'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const bytes = (s) => new TextEncoder().encode(s).length

function validarEmail(v) {
  if (!v.trim()) return 'Informe o e-mail.'
  if (!EMAIL_RE.test(v.trim())) return 'E-mail inválido.'
  return ''
}

function regrasSenha(s) {
  return [
    { ok: s.length >= 8, texto: 'Pelo menos 8 caracteres' },
    { ok: /[A-Za-z]/.test(s) && /\d/.test(s), texto: 'Letras e números' },
    { ok: bytes(s) <= 72, texto: 'No máximo 72 bytes (limite do bcrypt)' },
  ]
}

function destinoPosLogin(user, next) {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    if (!next.startsWith('/admin') || user.is_admin) return next
  }
  return user.is_admin ? '/admin' : '/'
}

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const modo = params.get('modo') === 'cadastro' ? 'cadastro' : 'login'
  const next = params.get('next')

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmacao: '' })
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroApi, setErroApi] = useState('')

  if (user) return <Redirect to={destinoPosLogin(user, next)} />

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))

  const erros = {
    nome: modo === 'cadastro' && form.nome.trim().length < 2 ? 'Informe seu nome completo.' : '',
    email: validarEmail(form.email),
    senha:
      modo === 'login'
        ? form.senha
          ? ''
          : 'Informe a senha.'
        : regrasSenha(form.senha).every((r) => r.ok)
          ? ''
          : 'A senha não atende aos requisitos abaixo.',
    confirmacao: modo === 'cadastro' && form.confirmacao !== form.senha ? 'As senhas não conferem.' : '',
  }
  const invalido = Object.values(erros).some(Boolean)
  const mostrar = (campo) => (tocados[campo] && erros[campo] ? erros[campo] : '')

  const trocarModo = (novo) => {
    setErroApi('')
    setTocados({})
    setParams({ modo: novo === 'cadastro' ? 'cadastro' : '', next })
  }

  async function enviar(e) {
    e.preventDefault()
    setTocados({ nome: true, email: true, senha: true, confirmacao: true })
    if (invalido) return
    setEnviando(true)
    setErroApi('')
    try {
      const u =
        modo === 'login'
          ? await login(form.email.trim(), form.senha)
          : await register(form.nome.trim(), form.email.trim(), form.senha)
      navigate(destinoPosLogin(u, next), { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setErroApi('E-mail ou senha incorretos.')
      else if (err instanceof ApiError && err.status === 409) setErroApi('Este e-mail já está cadastrado. Entre com sua senha.')
      else setErroApi(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (id, label, type, extra = {}) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`form-control ${mostrar(id) ? 'is-invalid' : tocados[id] && !erros[id] ? 'is-valid' : ''}`}
        value={form[id]}
        onChange={set(id)}
        onBlur={tocar(id)}
        aria-describedby={`${id}-erro`}
        {...extra}
      />
      <div id={`${id}-erro`} className="invalid-feedback">
        {mostrar(id)}
      </div>
    </div>
  )

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card auth-card shadow-sm">
        <div className="card-body p-4">
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'login'}
                className={`nav-link ${modo === 'login' ? 'active' : ''}`}
                onClick={() => trocarModo('login')}
              >
                Entrar
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'cadastro'}
                className={`nav-link ${modo === 'cadastro' ? 'active' : ''}`}
                onClick={() => trocarModo('cadastro')}
              >
                Criar conta
              </button>
            </li>
          </ul>

          {params.get('expirou') && (
            <div className="alert alert-warning" role="alert">
              Sua sessão expirou. Entre novamente para continuar.
            </div>
          )}
          {next && !params.get('expirou') && (
            <div className="alert alert-info" role="status">
              Entre na sua conta para continuar.
            </div>
          )}

          <form onSubmit={enviar} noValidate>
            {modo === 'cadastro' && campo('nome', 'Nome completo', 'text', { autoComplete: 'name', maxLength: 100 })}
            {campo('email', 'E-mail', 'email', { autoComplete: 'email', maxLength: 100 })}
            {campo('senha', 'Senha', 'password', {
              autoComplete: modo === 'login' ? 'current-password' : 'new-password',
            })}
            {modo === 'cadastro' && (
              <>
                <ul className="list-unstyled small mb-3" aria-label="Requisitos da senha">
                  {regrasSenha(form.senha).map((r) => (
                    <li key={r.texto} className={r.ok ? 'text-success' : 'text-secondary'}>
                      <span aria-hidden="true">{r.ok ? '✓' : '○'}</span> {r.texto}
                    </li>
                  ))}
                </ul>
                {campo('confirmacao', 'Confirmar senha', 'password', { autoComplete: 'new-password' })}
              </>
            )}

            {erroApi && (
              <div className="alert alert-danger py-2" role="alert">
                {erroApi}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
              {enviando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-secondary small mt-3 mb-0">
            {modo === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={() => trocarModo(modo === 'login' ? 'cadastro' : 'login')}
            >
              {modo === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
