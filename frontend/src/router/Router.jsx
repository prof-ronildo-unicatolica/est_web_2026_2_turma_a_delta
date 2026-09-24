/**
 * Roteador mínimo baseado na History API (sem dependências externas).
 * A API espelha a do react-router (Link, NavLink, useNavigate, useParams...),
 * então migrar depois é trocar o import.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ParamsContext, RouterContext, matchPath, useLocation, useNavigate } from './hooks'

const readLocation = () => ({
  pathname: window.location.pathname,
  search: window.location.search,
  state: window.history.state?.usr ?? null,
})

export function Router({ children }) {
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, { replace = false, state = null } = {}) => {
    if (typeof to === 'number') {
      window.history.go(to)
      return
    }
    window.history[replace ? 'replaceState' : 'pushState']({ usr: state }, '', to)
    setLocation(readLocation())
    window.scrollTo(0, 0)
  }, [])

  const value = useMemo(() => ({ location, navigate }), [location, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

/** routes: [{ path: '/hoteis/:id', element: <Pagina /> }] — renderiza a primeira que casar. */
export function Routes({ routes, fallback = null }) {
  const { pathname } = useLocation()
  for (const route of routes) {
    const params = matchPath(route.path, pathname)
    if (params) return <ParamsContext.Provider value={params}>{route.element}</ParamsContext.Provider>
  }
  return fallback
}

export function Link({ to, replace, state, onClick, children, ...rest }) {
  const navigate = useNavigate()
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (rest.target && rest.target !== '_self') return
    e.preventDefault()
    navigate(to, { replace, state })
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}

export function NavLink({ to, end = false, className = '', activeClassName = 'active', ...rest }) {
  const { pathname } = useLocation()
  const alvo = to.split('?')[0]
  const ativo = end ? pathname === alvo : pathname === alvo || pathname.startsWith(`${alvo}/`)
  return <Link to={to} className={`${className} ${ativo ? activeClassName : ''}`.trim()} aria-current={ativo ? 'page' : undefined} {...rest} />
}

export function Redirect({ to, state }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to, { replace: true, state })
  }, [to, state, navigate])
  return null
}
