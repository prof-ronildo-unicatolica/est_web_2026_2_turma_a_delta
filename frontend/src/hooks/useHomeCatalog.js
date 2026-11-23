import { useEffect, useState } from 'react'
import { catalogoApi } from '../api/services'
import { extrairLista } from '../utils/home'

export default function useHomeCatalog(chaveBusca) {
  const [cidades, setCidades] = useState([])
  const [hoteis, setHoteis] = useState([])
  const [quartos, setQuartos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const filtros = Object.fromEntries(new URLSearchParams(chaveBusca).entries())
        const [respostaCidades, respostaHoteis, respostaQuartos] = await Promise.all([
          catalogoApi.cidades(),
          catalogoApi.buscar(filtros),
          catalogoApi.quartos(),
        ])
        if (!ativo) return
        setCidades(extrairLista(respostaCidades))
        setHoteis(extrairLista(respostaHoteis))
        setQuartos(extrairLista(respostaQuartos))
      } catch (erroCarregamento) {
        if (!ativo) return
        setErro(
          erroCarregamento?.response?.data?.detail ||
          erroCarregamento?.message ||
          'Não foi possível carregar os hotéis. Tente novamente.',
        )
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => { ativo = false }
  }, [chaveBusca])

  return { cidades, hoteis, quartos, carregando, erro }
}
