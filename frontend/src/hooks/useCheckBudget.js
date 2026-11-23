import { useMemo } from 'react'
import { TARIFA, calcularOrcamento } from '../utils/pricing'

export default function useCheckoutBudget({ catalogo, quarto, form, early, late, tarifaTipo, quantidadesServicos, berco }) {
  const tarifas = useMemo(() => catalogo?.tarifas ?? [], [catalogo])
  const servicos = useMemo(() => catalogo?.servicos ?? [], [catalogo])
  const bercoEfetivo = Boolean(berco && form.bebes > 0)
  const orcamento = useMemo(() => calcularOrcamento({
    quarto,
    checkin: form.checkin,
    checkout: form.checkout,
    criancas: form.criancas,
    earlyCheckin: early,
    lateCheckout: late,
    tarifaTipo: tarifaTipo || TARIFA.REEMBOLSAVEL,
    tarifas,
    servicos: servicos.map((servico) => ({ servico, quantidade: quantidadesServicos[servico.id] || 0 })),
  }), [quarto, form.checkin, form.checkout, form.criancas, early, late, tarifaTipo, tarifas, servicos, quantidadesServicos])

  return { tarifas, servicos, bercoEfetivo, orcamento }
}
