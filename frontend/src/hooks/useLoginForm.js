import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { useNavigate } from '../router/hooks'
import {
  destinoPosLogin,
  mensagemDeErroAutenticacao,
  validarFormulario,
} from '../utils/authValidation'

const FORM_INICIAL = { nome: '', email: '', senha: '', confirmacao: '' }

export default function useLoginForm({ modo, next }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_INICIAL)
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroApi, setErroApi] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false)

  const erros = validarFormulario(form, modo)
  const invalido = Object.values(erros).some(Boolean)

  function atualizarCampo(campo, event) {
    setForm((atual) => ({ ...atual, [campo]: event.target.value }))
  }

  function tocarCampo(campo) {
    setTocados((atual) => ({ ...atual, [campo]: true }))
  }

  function mostrarErro(campo) {
    return tocados[campo] ? erros[campo] : ''
  }

  function resetarFormulario() {
    setErroApi('')
    setTocados({})
    setSenhaVisivel(false)
    setConfirmacaoVisivel(false)
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
    } catch (error) {
      setErroApi(mensagemDeErroAutenticacao(error))
    } finally {
      setEnviando(false)
    }
  }

  return {
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
  }
}
