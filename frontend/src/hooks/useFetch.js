import { useEffect, useState } from 'react'

/** Carrega dados assíncronos; refaz a chamada quando `deps` mudam ou ao chamar reload(). */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let vivo = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcher()
      .then((data) => vivo && setState({ data, loading: false, error: null }))
      .catch((error) => vivo && setState({ data: null, loading: false, error }))
    return () => {
      vivo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
