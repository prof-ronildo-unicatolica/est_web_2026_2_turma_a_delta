import { useEffect, useMemo, useState } from 'react'
import { reservasApi } from '../api/services'
import useFetch from './useFetch'
import { asList, STATUS } from '../utils/catalog'
import { brl } from '../utils/format'
import { enriquecerReserva } from '../utils/reservas'

export default function useMinhasReservas() {
  const { data, loading, error, reload } = useFetch(
    () => reservasApi.listar().then((resposta) => asList(resposta).map(enriquecerReserva)),
    [],
  )
  const [filtro, setFiltro] = useState('Todas')
  const [alvo, setAlvo] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [erroCancel, setErroCancel] = useState(null)
  const [aviso, setAviso] = useState(null)

  const reservas = useMemo(
    () => [...(data || [])].sort((a, b) => String(b.data_checkin).localeCompare(String(a.data_checkin))),
    [data],
  )
  const visiveis = useMemo(
    () => filtro === 'Todas' ? reservas : reservas.filter((reserva) => reserva.status === filtro),
    [filtro, reservas],
  )
  const temPendente = reservas.some((reserva) => reserva.status === STATUS.PENDENTE)

  useEffect(() => {
    if (!temPendente) return undefined
    const intervalo = setInterval(reload, 3000)
    return () => clearInterval(intervalo)
  }, [temPendente, reload])

  async function confirmarCancelamento() {
    if (!alvo?.id) return
    setCancelando(true)
    setErroCancel(null)
    try {
      const resposta = await reservasApi.cancelar(alvo.id)
      const multa = Number(resposta?.valor_multa_cancelamento ?? 0)
      setAviso(multa > 0 ? `Reserva cancelada. Multa aplicada: ${brl(multa)}.` : 'Reserva cancelada sem multa.')
      setAlvo(null)
      reload()
    } catch (erro) {
      setErroCancel(erro)
    } finally {
      setCancelando(false)
    }
  }

  return {
    data, reservas, visiveis, loading, error, reload, filtro, setFiltro,
    alvo, setAlvo, cancelando, erroCancel, setErroCancel,
    aviso, setAviso, confirmarCancelamento,
  }
}
