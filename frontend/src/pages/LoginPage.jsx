import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const { login, cadastrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destinoAposLogin = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await login(email, senha)
      navigate(destinoAposLogin, { replace: true })
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setErro(null)

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.')
      return
    }

    setCarregando(true)
    try {
      await cadastrar({ nome, email, senha })
      setModo('login')
      setErro(null)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="row justify-content-center my-5">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button className={`nav-link ${modo === 'login' ? 'active' : ''}`} onClick={() => { setModo('login'); setErro(null) }}>
                  Entrar
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${modo === 'cadastro' ? 'active' : ''}`} onClick={() => { setModo('cadastro'); setErro(null) }}>
                  Cadastrar-se
                </button>
              </li>
            </ul>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {modo === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
                  {carregando ? 'Entrando...' : 'Entrar'}
                </button>
                <p className="text-muted small mt-3 mb-0">
                  Demonstração: <code>admin@hotel.com</code> / <code>admin123</code> (admin) ou{' '}
                  <code>cliente@hotel.com</code> / <code>cliente123</code> (cliente).
                </p>
              </form>
            ) : (
              <form onSubmit={handleCadastro}>
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar senha</label>
                  <input type="password" className="form-control" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
                  {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
                <p className="text-muted small mt-3 mb-0">
                  Cadastro simulado (mock) — o endpoint real de criação de usuário ainda não existe no backend.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
