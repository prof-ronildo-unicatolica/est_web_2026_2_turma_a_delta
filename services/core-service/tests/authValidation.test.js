import test from 'node:test'
import assert from 'node:assert/strict'
import {
  destinoPosLogin,
  mensagemDeErroAutenticacao,
  regrasSenha,
  validarEmail,
  validarFormulario,
} from '../src/utils/authValidation.js'

test('valida e-mail obrigatório e formato', () => {
  assert.equal(validarEmail(''), 'Informe o e-mail.')
  assert.equal(validarEmail('  pessoa@exemplo.com  '), '')
  assert.equal(validarEmail('email-invalido'), 'E-mail inválido.')
})

test('aplica os requisitos de senha do cadastro', () => {
  assert.deepEqual(regrasSenha('abc12345').map(({ ok }) => ok), [true, true])
  assert.deepEqual(regrasSenha('12345678').map(({ ok }) => ok), [true, false])
  assert.equal(
    validarFormulario({ nome: 'Ana', email: 'ana@exemplo.com', senha: 'abc12345', confirmacao: 'abc12345' }, 'cadastro').senha,
    '',
  )
})

test('valida nome e confirmação no cadastro', () => {
  const erros = validarFormulario({
    nome: 'A',
    email: 'ana@exemplo.com',
    senha: 'abc12345',
    confirmacao: 'diferente',
  }, 'cadastro')

  assert.equal(erros.nome, 'Informe seu nome completo.')
  assert.equal(erros.confirmacao, 'As senhas não conferem.')
})

test('não exige nome ou confirmação no login', () => {
  const erros = validarFormulario({ nome: '', email: 'ana@exemplo.com', senha: 'qualquer', confirmacao: '' }, 'login')
  assert.equal(erros.nome, '')
  assert.equal(erros.confirmacao, '')
  assert.equal(erros.senha, '')
})

test('bloqueia redirecionamento externo e preserva rotas permitidas', () => {
  assert.equal(destinoPosLogin({ is_admin: false }, '//externo.example'), '/')
  assert.equal(destinoPosLogin({ is_admin: false }, '/admin'), '/')
  assert.equal(destinoPosLogin({ is_admin: true }, '/admin/hoteis'), '/admin/hoteis')
  assert.equal(destinoPosLogin({ is_admin: false }, '/reservas'), '/reservas')
})

test('mantém mensagens específicas de autenticação', () => {
  assert.equal(mensagemDeErroAutenticacao({ status: 401 }), 'E-mail ou senha incorretos.')
  assert.equal(
    mensagemDeErroAutenticacao({ status: 409 }),
    'Este e-mail já está cadastrado. Entre com sua senha.',
  )
})
