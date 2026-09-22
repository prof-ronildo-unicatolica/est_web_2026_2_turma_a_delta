import AdminCrudPage from '../../components/admin/AdminCrudPage'
import { listarTarifasAdmin, criarTarifa, removerTarifa } from '../../services/adminService'

export default function AdminTarifasPage() {
  return (
    <AdminCrudPage
      title="Tarifas de Temporada"
      description="Datas de início/fim e o multiplicador aplicado sobre a diária base."
      fields={[
        { name: 'nome', label: 'Nome' },
        { name: 'inicio', label: 'Início', type: 'date' },
        { name: 'fim', label: 'Fim', type: 'date' },
        { name: 'multiplicador', label: 'Multiplicador (ex: 1.3)', type: 'number' },
      ]}
      listFn={listarTarifasAdmin}
      createFn={criarTarifa}
      removeFn={removerTarifa}
    />
  )
}
