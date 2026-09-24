const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const brl = (v) => brlFmt.format(Number(v) || 0)

/** "2026-07-10" -> "10/07/2026" (sem passar por Date, evitando erro de fuso). */
export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function todayISO() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`

export function guestsSummary({ adultos = 0, criancas = 0, bebes = 0 }) {
  const partes = [plural(adultos, 'adulto', 'adultos')]
  if (criancas) partes.push(plural(criancas, 'criança', 'crianças'))
  if (bebes) partes.push(plural(bebes, 'bebê', 'bebês'))
  return partes.join(', ')
}
