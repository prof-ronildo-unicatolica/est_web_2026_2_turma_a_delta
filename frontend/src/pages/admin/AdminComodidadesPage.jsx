import AdminCrudPage from '../../components/admin/AdminCrudPage'
import { listarComodidadesAdmin, criarComodidade, removerComodidade } from '../../services/adminService'

export default function AdminComodidadesPage() {
  return (
    <AdminCrudPage
      title="Comodidades e Serviços"
      description="Catálogo global de comodidades (ex: piscina, wi-fi) exibidas nos hotéis."
      fields={[{ name: 'nome', label: 'Nome' }]}
      listFn={listarComodidadesAdmin}
      createFn={criarComodidade}
      removeFn={removerComodidade}
    />
  )
}
