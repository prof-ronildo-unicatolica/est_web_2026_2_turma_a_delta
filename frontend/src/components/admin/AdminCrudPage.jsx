import CrudPage from '../../pages/admin/CrudPage'

export default function AdminCrudPage({ title, description, fields, listFn, createFn, removeFn }) {
  const campos = fields.map((field) => ({
    ...field,
    type: field.options ? 'select' : field.type || 'text',
    required: true,
  }))

  const valoresIniciais = Object.fromEntries(
    campos.map((field) => [field.name, field.type === 'number' ? 0 : '']),
  )

  const colunas = campos.map((field) => ({
    key: field.name,
    label: field.label,
    render: (item) => {
      if (!field.options) return String(item[field.name] ?? '')
      return field.options.find((option) => String(option.value) === String(item[field.name]))?.label ?? String(item[field.name] ?? '')
    },
  }))

  const singulares = { Cidades: 'Cidade', Hotéis: 'Hotel', Quartos: 'Quarto', 'Tarifas de Temporada': 'Tarifa', 'Comodidades e Serviços': 'Comodidade' }

  return (
    <CrudPage
      titulo={title}
      descricao={description}
      singular={singulares[title] || title}
      carregar={listFn}
      criar={createFn}
      atualizar={async () => { throw new Error('Edição não disponível para este cadastro.') }}
      remover={removeFn}
      colunas={colunas}
      campos={campos}
      valoresIniciais={valoresIniciais}
      paraFormulario={(item) => ({ ...item })}
      paraPayload={(values) => values}
      nomeDoItem={(item) => item?.nome || item?.name || item?.id || title}
      somenteCriacao
    />
  )
}
