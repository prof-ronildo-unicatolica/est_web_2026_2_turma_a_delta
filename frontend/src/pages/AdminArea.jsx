import { Routes } from '../router/Router'
import AdminLayout from './admin/AdminLayout'
import AdminHome from './admin/AdminHome'
import CidadesAdmin from './admin/CidadesAdmin'
import HoteisAdmin from './admin/HoteisAdmin'
import NotFound from './NotFound'

const ROTAS_ADMIN = [
  { path: '/admin', element: <AdminHome /> },
  { path: '/admin/cidades', element: <CidadesAdmin /> },
  { path: '/admin/hoteis', element: <HoteisAdmin /> },
]

export default function AdminArea() {
  return (
    <AdminLayout>
      <Routes routes={ROTAS_ADMIN} fallback={<NotFound />} />
    </AdminLayout>
  )
}
