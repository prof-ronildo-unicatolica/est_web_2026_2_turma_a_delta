import { createContext, useCallback, useContext, useMemo } from 'react'

export const RouterContext = createContext(null)
export const ParamsContext = createContext({})

export const useLocation = () => useContext(RouterContext).location
export const useNavigate = () => useContext(RouterContext).navigate
export const useParams = () => useContext(ParamsContext)

/** [URLSearchParams, setParams(objeto, {replace})] — o objeto substitui a query atual. */
export function useSearchParams() {
  const { location, navigate } = useContext(RouterContext)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const setParams = useCallback(
    (obj, opts) => {
      const q = new URLSearchParams()
      Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.set(k, v)
      })
      const s = q.toString()
      navigate(`${location.pathname}${s ? `?${s}` : ''}`, opts)
    },
    [location.pathname, navigate],
  )
  return [params, setParams]
}

/** Casa "/hoteis/:id" e "/admin/*" com o pathname; devolve os params ou null. */
export function matchPath(pattern, pathname) {
  const pat = pattern.split('/').filter(Boolean)
  const parts = pathname.split('/').filter(Boolean)
  const params = {}
  for (let i = 0; i < pat.length; i += 1) {
    if (pat[i] === '*') {
      params['*'] = parts.slice(i).join('/')
      return params
    }
    if (i >= parts.length) return null
    if (pat[i].startsWith(':')) params[pat[i].slice(1)] = decodeURIComponent(parts[i])
    else if (pat[i] !== parts[i]) return null
  }
  return parts.length === pat.length ? params : null
}
