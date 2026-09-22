import AdminCrudPage from '../../components/admin/AdminCrudPage'
import { listarHoteisAdmin, criarHotel, removerHotel } from '../../services/adminService'
import { mockCidades } from '../../data/mockData'

export default function AdminHoteisPage() {
  return (
    <AdminCrudPage
      title="Hotéis"
      description="Associação com cidades e definição da categoria de estrelas."
      fields={[
        { name: 'nome', label: 'Nome' },
        { name: 'cidadeId', label: 'Cidade', options: mockCidades.map((c) => ({ value: c.id, label: `${c.nome} - ${c.estado}` })) },
        {
          name: 'estrelas',
          label: 'Estrelas',
          options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} estrela(s)` })),
        },
      ]}
      listFn={listarHoteisAdmin}
      createFn={(dados) => criarHotel({ ...dados, estrelas: Number(dados.estrelas) })}
      removeFn={removerHotel}
    />
  )
}
