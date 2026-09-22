import AdminCrudPage from '../../components/admin/AdminCrudPage'
import { listarCidadesAdmin, criarCidade, removerCidade } from '../../services/adminService'

export default function AdminCidadesPage() {
  return (
    <AdminCrudPage
      title="Cidades"
      description="Cadastro de nome, estado e limites territoriais das cidades atendidas pela rede."
      fields={[
        { name: 'nome', label: 'Nome' },
        { name: 'estado', label: 'Estado (UF)' },
      ]}
      listFn={listarCidadesAdmin}
      createFn={criarCidade}
      removeFn={removerCidade}
    />
  )
}
