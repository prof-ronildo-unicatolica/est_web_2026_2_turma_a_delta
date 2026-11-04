
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carrega dados assíncronos; refaz a chamada quando deps mudam
 * ou ao chamar reload().
 */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    let vivo = true

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((data) => {
        if (vivo) {
          setState({
            data,
            loading: false,
            error: null,
          })
        }
      })
      .catch((error) => {
        if (vivo) {
          setState({
            data: null,
            loading: false,
            error,
          })
        }
      })

    return () => {
      vivo = false
    }
  }, [depsKey, tick])

  const reload = useCallback(() => {
    setState((atual) => ({
      ...atual,
      loading: true,
      error: null,
    }))
    setTick((atual) => atual + 1)
  }, [])

  return {
    ...state,
    reload,
  }
}
