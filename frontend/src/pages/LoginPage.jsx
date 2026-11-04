import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { ApiError } from '../api/http'
import { Redirect } from '../router/Router'
import { useNavigate, useSearchParams } from '../router/hooks'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const bytes = (value) => new TextEncoder().encode(value).length

function validarEmail(value) {
  if (!value.trim()) return 'Informe o e-mail.'
  if (!EMAIL_RE.test(value.trim())) return 'E-mail inválido.'
  return ''
}

function regrasSenha(senha) {
  return [
    { ok: senha.length >= 8, texto: 'Pelo menos 8 caracteres' },
    { ok: /[A-Za-z]/.test(senha) && /\d/.test(senha), texto: 'Letras e números' },
  ]
}

function destinoPosLogin(user, next) {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    if (!next.startsWith('/admin') || user.is_admin) return next
  }
  return user.is_admin ? '/admin' : '/'
}

function CampoSenha({
  id,
  label,
  value,
  onChange,
  onBlur,
  erro,
  valido,
  autoComplete,
  visivel,
  alternarVisibilidade,
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          className={`form-control password-input ${erro ? 'is-invalid' : valido ? 'is-valid' : ''}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-describedby={`${id}-erro`}
          autoCapitalize="none"
          spellCheck="false"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={alternarVisibilidade}
          aria-label={visivel ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          aria-pressed={visivel}
        >
          {visivel ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <div id={`${id}-erro`} className="invalid-feedback d-block">
        {erro || ''}
      </div>
    </div>
  )
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
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false)

  if (user) return <Redirect to={destinoPosLogin(user, next)} />

  const set = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }))
  const tocar = (campo) => () => setTocados((atual) => ({ ...atual, [campo]: true }))

  const erros = {
    nome: modo === 'cadastro' && form.nome.trim().length < 2 ? 'Informe seu nome completo.' : '',
    email: validarEmail(form.email),
    senha: modo === 'login'
      ? (form.senha ? '' : 'Informe a senha.')
      : regrasSenha(form.senha).every((regra) => regra.ok) && bytes(form.senha) <= 72
        ? ''
        : bytes(form.senha) > 72
          ? 'A senha é muito longa.'
          : 'A senha não atende aos requisitos.',
    confirmacao: modo === 'cadastro' && form.confirmacao !== form.senha ? 'As senhas não conferem.' : '',
  }
  const invalido = Object.values(erros).some(Boolean)
  const mostrarErro = (campo) => (tocados[campo] && erros[campo] ? erros[campo] : '')

  const trocarModo = (novoModo) => {
    setErroApi('')
    setTocados({})
    setSenhaVisivel(false)
    setConfirmacaoVisivel(false)
    setParams({ modo: novoModo === 'cadastro' ? 'cadastro' : '', next })
  }

  async function enviar(event) {
    event.preventDefault()
    setTocados({ nome: true, email: true, senha: true, confirmacao: true })
    if (invalido) return

    setEnviando(true)
    setErroApi('')
    try {
      const usuario = modo === 'login'
        ? await login(form.email.trim(), form.senha)
        : await register(form.nome.trim(), form.email.trim(), form.senha)
      navigate(destinoPosLogin(usuario, next), { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setErroApi('E-mail ou senha incorretos.')
      else if (err instanceof ApiError && err.status === 409) setErroApi('Este e-mail já está cadastrado. Entre com sua senha.')
      else setErroApi(err.message || 'Não foi possível concluir a operação.')
    } finally {
      setEnviando(false)
    }
  }

  const campoTexto = (id, label, type, extra = {}) => (
    <div className="mb-3" key={id}>
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        type={type}
        className={`form-control ${mostrarErro(id) ? 'is-invalid' : tocados[id] && !erros[id] ? 'is-valid' : ''}`}
        value={form[id]}
        onChange={set(id)}
        onBlur={tocar(id)}
        aria-describedby={`${id}-erro`}
        {...extra}
      />
      <div id={`${id}-erro`} className="invalid-feedback">{mostrarErro(id)}</div>
    </div>
  )

  return (
    <div className="container auth-container">
      <div className="card auth-card shadow-sm">
        <div className="card-body auth-card-body">
          <ul className="nav nav-tabs mb-4" role="tablist" aria-label="Acesso à conta">
            <li className="nav-item" role="presentation">
              <button type="button" role="tab" aria-selected={modo === 'login'}
                className={`nav-link ${modo === 'login' ? 'active' : ''}`}
                onClick={() => trocarModo('login')}>Entrar</button>
            </li>
            <li className="nav-item" role="presentation">
              <button type="button" role="tab" aria-selected={modo === 'cadastro'}
                className={`nav-link ${modo === 'cadastro' ? 'active' : ''}`}
                onClick={() => trocarModo('cadastro')}>Criar conta</button>
            </li>
          </ul>

          {params.get('expirou') && (
            <div className="alert alert-warning" role="alert">Sua sessão expirou. Entre novamente para continuar.</div>
          )}
          {next && !params.get('expirou') && (
            <div className="alert alert-info" role="status">Entre na sua conta para continuar.</div>
          )}

          <form onSubmit={enviar} noValidate>
            {modo === 'cadastro' && campoTexto('nome', 'Nome completo', 'text', {
              autoComplete: 'name', maxLength: 100,
            })}
            {campoTexto('email', 'E-mail', 'email', {
              autoComplete: 'email', maxLength: 100, inputMode: 'email',
            })}

            <CampoSenha
              id="senha"
              label="Senha"
              value={form.senha}
              onChange={set('senha')}
              onBlur={tocar('senha')}
              erro={mostrarErro('senha')}
              valido={tocados.senha && !erros.senha}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              visivel={senhaVisivel}
              alternarVisibilidade={() => setSenhaVisivel((visivel) => !visivel)}
            />

            {modo === 'cadastro' && (
              <>
                <ul className="list-unstyled small password-rules mb-3" aria-label="Requisitos da senha">
                  {regrasSenha(form.senha).map((regra) => (
                    <li key={regra.texto} className={regra.ok ? 'text-success' : 'text-secondary'}>
                      <span aria-hidden="true">{regra.ok ? '✓' : '○'}</span> {regra.texto}
                    </li>
                  ))}
                </ul>
                <CampoSenha
                  id="confirmacao"
                  label="Confirmar senha"
                  value={form.confirmacao}
                  onChange={set('confirmacao')}
                  onBlur={tocar('confirmacao')}
                  erro={mostrarErro('confirmacao')}
                  valido={tocados.confirmacao && !erros.confirmacao}
                  autoComplete="new-password"
                  visivel={confirmacaoVisivel}
                  alternarVisibilidade={() => setConfirmacaoVisivel((visivel) => !visivel)}
                />
              </>
            )}

            {erroApi && <div className="alert alert-danger py-2" role="alert">{erroApi}</div>}

            <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={enviando}>
              {enviando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-secondary small mt-3 mb-0">
            {modo === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button type="button" className="btn btn-link btn-sm p-0 align-baseline"
              onClick={() => trocarModo(modo === 'login' ? 'cadastro' : 'login')}>
              {modo === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
