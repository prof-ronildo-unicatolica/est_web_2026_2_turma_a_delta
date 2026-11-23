export function parseNumeroOuPadrao(valor, padrao) {
  return valor === null || Number.isNaN(Number(valor)) ? padrao : Number(valor)
}

export function formatarMultiplicador(multiplicador) {
  return `${multiplicador >= 1 ? '+' : '−'}${Math.abs(Math.round((multiplicador - 1) * 100))}%`
}

export function validarCheckout(form, hoje, quarto) {
  const erros = []
  if (!form.checkin || !form.checkout) erros.push('Informe as datas de check-in e check-out.')
  else if (form.checkin < hoje) erros.push('O check-in não pode ser no passado.')
  else if (form.checkout <= form.checkin) erros.push('O check-out deve ser depois do check-in.')

  if (quarto && form.adultos > quarto.max_adultos) erros.push(`Este quarto comporta no máximo ${quarto.max_adultos} adulto(s).`)
  if (quarto && form.criancas > quarto.max_criancas) erros.push(`Este quarto comporta no máximo ${quarto.max_criancas} criança(s).`)
  return erros
}
