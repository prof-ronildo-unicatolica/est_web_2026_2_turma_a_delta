import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout() {
  return (
    <div className="bg-light min-vh-100 pb-5 d-flex flex-column">
      <NavBar />
      <div className="container flex-grow-1">
        <Outlet />
      </div>
      <footer className="mt-5 py-4 border-top text-center text-muted">
        <p className="mb-0">&copy; {new Date().getFullYear()} - Disciplina de Estágio II. Desenvolvido pela Equipe Delta.</p>
      </footer>
    </div>
  )
}
