const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function tamanhoEmBytes(value) {
  return new TextEncoder().encode(value).length
}

export function validarEmail(value) {
  const email = value.trim()
  if (!email) return 'Informe o e-mail.'
  if (!EMAIL_RE.test(email)) return 'E-mail inválido.'
  return ''
}

export function regrasSenha(senha) {
  return [
    { ok: senha.length >= 8, texto: 'Pelo menos 8 caracteres' },
    { ok: /[A-Za-z]/.test(senha) && /\d/.test(senha), texto: 'Letras e números' },
  ]
}

export function validarSenha(senha, modo) {
  if (modo === 'login') return senha ? '' : 'Informe a senha.'
  if (tamanhoEmBytes(senha) > 72) return 'A senha é muito longa.'
  return regrasSenha(senha).every((regra) => regra.ok)
    ? ''
    : 'A senha não atende aos requisitos.'
}

export function validarFormulario(form, modo) {
  return {
    nome: modo === 'cadastro' && form.nome.trim().length < 2
      ? 'Informe seu nome completo.'
      : '',
    email: validarEmail(form.email),
    senha: validarSenha(form.senha, modo),
    confirmacao: modo === 'cadastro' && form.confirmacao !== form.senha
      ? 'As senhas não conferem.'
      : '',
  }
}

export function destinoPosLogin(user, next) {
  const destinoInterno = next?.startsWith('/') && !next.startsWith('//')
  const destinoPermitido = destinoInterno && (!next.startsWith('/admin') || user.is_admin)

  if (destinoPermitido) return next
  return user.is_admin ? '/admin' : '/'
}

export function mensagemDeErroAutenticacao(error) {
  if (error?.status === 401) return 'E-mail ou senha incorretos.'
  if (error?.status === 409) {
    return 'Este e-mail já está cadastrado. Entre com sua senha.'
  }
  return error?.message || 'Não foi possível concluir a operação.'
}
