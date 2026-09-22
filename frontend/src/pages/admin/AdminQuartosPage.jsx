import AdminCrudPage from '../../components/admin/AdminCrudPage'
import { listarQuartosAdmin, criarQuarto, removerQuarto } from '../../services/adminService'
import { mockHoteis } from '../../data/mockData'

export default function AdminQuartosPage() {
  return (
    <AdminCrudPage
      title="Quartos"
      description="Associação com hotéis, número, tipo, preço e limites de adultos/crianças."
      fields={[
        { name: 'hotelId', label: 'Hotel', options: mockHoteis.map((h) => ({ value: h.id, label: h.nome })) },
        { name: 'numero', label: 'Número' },
        { name: 'tipo', label: 'Tipo' },
        { name: 'precoBase', label: 'Preço base (diária)', type: 'number' },
        { name: 'capacidadeAdultos', label: 'Cap. adultos', type: 'number' },
        { name: 'capacidadeCriancas', label: 'Cap. crianças', type: 'number' },
      ]}
      listFn={listarQuartosAdmin}
      createFn={criarQuarto}
      removeFn={removerQuarto}
    />
  )
}
