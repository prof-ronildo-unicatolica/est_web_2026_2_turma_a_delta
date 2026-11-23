import { useAuth } from '../auth/authContext'
import { Redirect } from '../router/Router'
import { useSearchParams } from '../router/hooks'
import CampoSenha from '../components/auth/CampoSenha'
import CampoTexto from '../components/auth/CampoTexto'
import RegrasSenha from '../components/auth/RegrasSenha'
import useLoginForm from '../hooks/useLoginForm'
import { destinoPosLogin, regrasSenha } from '../utils/authValidation'

export default function LoginPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const modo = params.get('modo') === 'cadastro' ? 'cadastro' : 'login'
  const next = params.get('next')
  const formLogin = useLoginForm({ modo, next })

  if (user) return <Redirect to={destinoPosLogin(user, next)} />

  const {
    form,
    erros,
    tocados,
    enviando,
    erroApi,
    senhaVisivel,
    confirmacaoVisivel,
    setSenhaVisivel,
    setConfirmacaoVisivel,
    atualizarCampo,
    tocarCampo,
    mostrarErro,
    resetarFormulario,
    enviar,
  } = formLogin

  function trocarModo(novoModo) {
    resetarFormulario()
    setParams({ modo: novoModo === 'cadastro' ? 'cadastro' : '', next })
  }

  function campoTexto(id, label, type, extra = {}) {
    return (
      <CampoTexto
        key={id}
        id={id}
        label={label}
        type={type}
        value={form[id]}
        onChange={(event) => atualizarCampo(id, event)}
        onBlur={() => tocarCampo(id)}
        erro={mostrarErro(id)}
        tocado={tocados[id] && !erros[id]}
        extra={extra}
      />
    )
  }

  return (
    <div className="container auth-container">
      <div className="card auth-card shadow-sm">
        <div className="card-body auth-card-body">
          <ul className="nav nav-tabs mb-4" role="tablist" aria-label="Acesso à conta">
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
              onChange={(event) => atualizarCampo('senha', event)}
              onBlur={() => tocarCampo('senha')}
              erro={mostrarErro('senha')}
              valido={tocados.senha && !erros.senha}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              visivel={senhaVisivel}
              alternarVisibilidade={() => setSenhaVisivel((visivel) => !visivel)}
            />

            {modo === 'cadastro' && (
              <>
                <RegrasSenha regras={regrasSenha(form.senha)} />
                <CampoSenha
                  id="confirmacao"
                  label="Confirmar senha"
                  value={form.confirmacao}
                  onChange={(event) => atualizarCampo('confirmacao', event)}
                  onBlur={() => tocarCampo('confirmacao')}
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
