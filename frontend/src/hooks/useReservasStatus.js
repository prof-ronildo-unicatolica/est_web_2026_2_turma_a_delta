import { useEffect, useRef, useState } from 'react'
import { reservasApi } from '../api/services'
import { normalizeReserva, STATUS } from '../utils/catalog'

const INTERVALO_MS = 3000
const MAX_TENTATIVAS = 40

export default function useReservaStatus(id) {
  const [reserva, setReserva] = useState(null)
  const [erro, setErro] = useState(null)
  const [demorou, setDemorou] = useState(false)
  const tentativas = useRef(0)

  useEffect(() => {
    let cancelado = false
    let timer
    tentativas.current = 0
    setReserva(null)
    setErro(null)
    setDemorou(false)

    async function consultar() {
      try {
        const resultado = normalizeReserva(await reservasApi.obter(id))
        if (cancelado) return
        setReserva(resultado)
        setErro(null)
        if (resultado.status !== STATUS.PENDENTE) return
        tentativas.current += 1
        if (tentativas.current >= MAX_TENTATIVAS) {
          setDemorou(true)
          return
        }
        timer = setTimeout(consultar, INTERVALO_MS)
      } catch (erroConsulta) {
        if (cancelado) return
        setErro(erroConsulta)
        if (erroConsulta.status === 0 || erroConsulta.status >= 500) timer = setTimeout(consultar, INTERVALO_MS)
      }
    }

    consultar()
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [id])

  return { reserva, erro, demorou }
}
