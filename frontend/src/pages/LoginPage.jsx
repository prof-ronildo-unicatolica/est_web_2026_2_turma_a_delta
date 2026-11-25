
import { useAuth } from '../auth/authContext'
import { Link, Redirect } from '../router/Router'
import { useSearchParams } from '../router/hooks'

import CampoSenha from '../components/auth/CampoSenha'
import CampoTexto from '../components/auth/CampoTexto'
import RegrasSenha from '../components/auth/RegrasSenha'

import useLoginForm from '../hooks/useLoginForm'
import { destinoPosLogin, regrasSenha } from '../utils/authValidation'

export default function LoginPage() {
  const { user } = useAuth()

  const [params, setParams] = useSearchParams()

  const modo =
    params.get('modo') === 'cadastro' ? 'cadastro' : 'login'

  const next = params.get('next')

  const formLogin = useLoginForm({ modo, next })

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

  if (user) {
    return <Redirect to={destinoPosLogin(user, next)} />
  }

  function trocarModo(novoModo) {
    resetarFormulario()

    setParams({
      modo: novoModo === 'cadastro' ? 'cadastro' : '',
      next,
    })
  }

  function campoTexto(id, label, type, extra = {}) {
    return (
      <CampoTexto
        id={id}
        label={label}
        type={type}
        value={form[id] ?? ''}
        onChange={(event) => atualizarCampo(id, event)}
        onBlur={() => tocarCampo(id)}
        erro={mostrarErro(id)}
        tocado={Boolean(tocados[id])}
        extra={extra}
      />
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">

        {/* Painel visual */}
        <aside
          className="auth-visual"
          aria-label="Apresentação MeuCheckin"
        >
          <div className="auth-visual-overlay">

            <Link to="/" className="auth-brand">
              <span className="auth-brand-mark" aria-hidden="true">
                ⌂
              </span>
              MeuCheckin
            </Link>

            <div className="auth-visual-copy">
              <span className="auth-eyebrow">
                SUA PRÓXIMA ESTADIA COMEÇA AQUI
              </span>

              <h1>
                Viajar bem começa com a escolha certa.
              </h1>

              <p>
                Encontre hospedagens, compare opções e reserve
                diretamente com o hotel.
              </p>

              <div className="auth-benefits">
                <span><b>✓</b> Reserva direta</span>
                <span><b>✓</b> Mais transparência</span>
                <span><b>✓</b> Sem taxas de intermediação</span>
              </div>
            </div>

            <span className="auth-photo-credit">
              Experiências que merecem ser vividas.
            </span>
          </div>
        </aside>

        {/* Formulário */}
        <section className="auth-form-side">
          <div className="auth-form-wrap">

            <Link to="/" className="auth-mobile-brand">
              MeuCheckin
            </Link>

            <div className="auth-heading">
              <span className="auth-kicker">
                {modo === 'login'
                  ? 'BEM-VINDO DE VOLTA'
                  : 'COMECE SUA PRÓXIMA VIAGEM'}
              </span>

              <h2>
                {modo === 'login'
                  ? 'Acesse sua conta'
                  : 'Crie sua conta'}
              </h2>

              <p>
                {modo === 'login'
                  ? 'Entre para acompanhar suas reservas e planejar sua próxima hospedagem.'
                  : 'Cadastre-se gratuitamente para encontrar e reservar sua próxima hospedagem.'}
              </p>
            </div>

            {/* Alternância entre login e cadastro */}
            <div
              className="auth-mode-switch"
              role="tablist"
              aria-label="Acesso à conta"
            >
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'login'}
                className={modo === 'login' ? 'active' : ''}
                onClick={() => trocarModo('login')}
              >
                Entrar
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={modo === 'cadastro'}
                className={modo === 'cadastro' ? 'active' : ''}
                onClick={() => trocarModo('cadastro')}
              >
                Criar conta
              </button>
            </div>

            {/* Mensagens de contexto */}
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

            {/* Formulário de autenticação */}
            <form
              onSubmit={enviar}
              noValidate
              className="auth-form"
            >
              {modo === 'cadastro' &&
                campoTexto('nome', 'Nome completo', 'text', {
                  autoComplete: 'name',
                  maxLength: 100,
                  placeholder: 'Como podemos chamar você?',
                })}

              {campoTexto('email', 'E-mail', 'email', {
                autoComplete: 'email',
                maxLength: 100,
                inputMode: 'email',
                placeholder: 'voce@exemplo.com',
              })}

              <CampoSenha
                id="senha"
                label="Senha"
                value={form.senha}
                onChange={(event) =>
                  atualizarCampo('senha', event)
                }
                onBlur={() => tocarCampo('senha')}
                erro={mostrarErro('senha')}
                valido={tocados.senha && !erros.senha}
                autoComplete={
                  modo === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                visivel={senhaVisivel}
                alternarVisibilidade={() =>
                  setSenhaVisivel((visivel) => !visivel)
                }
              />

              {modo === 'cadastro' && (
                <>
                  <RegrasSenha
                    regras={regrasSenha(form.senha)}
                  />

                  <CampoSenha
                    id="confirmacao"
                    label="Confirmar senha"
                    value={form.confirmacao}
                    onChange={(event) =>
                      atualizarCampo('confirmacao', event)
                    }
                    onBlur={() => tocarCampo('confirmacao')}
                    erro={mostrarErro('confirmacao')}
                    valido={
                      tocados.confirmacao &&
                      !erros.confirmacao
                    }
                    autoComplete="new-password"
                    visivel={confirmacaoVisivel}
                    alternarVisibilidade={() =>
                      setConfirmacaoVisivel(
                        (visivel) => !visivel
                      )
                    }
                  />
                </>
              )}

              {erroApi && (
                <div
                  className="alert alert-danger py-2"
                  role="alert"
                >
                  {erroApi}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 auth-submit"
                disabled={enviando}
              >
                {enviando
                  ? 'Aguarde...'
                  : modo === 'login'
                    ? 'Entrar na minha conta'
                    : 'Criar minha conta'}
              </button>
            </form>

            {/* Alternância inferior */}
            <p className="auth-switch-copy">
              {modo === 'login'
                ? 'Ainda não tem uma conta?'
                : 'Já possui cadastro?'}

              <button
                type="button"
                onClick={() =>
                  trocarModo(
                    modo === 'login' ? 'cadastro' : 'login'
                  )
                }
              >
                {modo === 'login'
                  ? 'Cadastre-se grátis'
                  : 'Entrar'}
              </button>
            </p>

            <div className="auth-trust-note">
              <span aria-hidden="true">▣</span>
              Seus dados são utilizados para gerenciar sua conta
              e suas reservas.
            </div>

            <Link to="/" className="auth-back-home">
              ← Voltar para buscar hotéis
            </Link>

          </div>
        </section>
      </div>
    </main>
  )
}
