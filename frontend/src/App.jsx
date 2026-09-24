import { Router, Routes } from './router/Router'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import HotelDetailPage from './pages/HotelDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import ReservaStatusPage from './pages/ReservaStatusPage'
import MinhasReservasPage from './pages/MinhasReservasPage'
import AdminArea from './pages/AdminArea'
import NotFound from './pages/NotFound'

/**
 * Rotas do sistema (docs/03_arquitetura_tecnica/arquitetura_frontend.md §4.2):
 *  - pública ............ /  ·  /hoteis/:id  ·  /login
 *  - cliente (JWT) ...... /checkout  ·  /reservas/:id  ·  /minhas-reservas
 *  - admin (JWT+is_admin) /admin/*
 */
const ROTAS = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/hoteis/:id', element: <HotelDetailPage /> },
  { path: '/checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
  { path: '/reservas/:id', element: <RequireAuth><ReservaStatusPage /></RequireAuth> },
  { path: '/minhas-reservas', element: <RequireAuth><MinhasReservasPage /></RequireAuth> },
  { path: '/admin/*', element: <RequireAuth admin><AdminArea /></RequireAuth> },
]

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Routes routes={ROTAS} fallback={<NotFound />} />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}
