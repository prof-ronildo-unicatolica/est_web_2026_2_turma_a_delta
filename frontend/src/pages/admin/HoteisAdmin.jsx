import { adminApi, catalogoApi } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import { asList } from '../../utils/catalog'
import Stars from '../../components/Stars'
import PageSpinner from '../../components/PageSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import CrudPage from './CrudPage'

const numOuNulo = (v) => (v === '' || v === null || Number.isNaN(Number(v)) ? null : Number(v))

export default function HoteisAdmin() {
  const apoio = useFetch(async () => {
    const [cidades, comodidades] = await Promise.all([catalogoApi.cidades(), catalogoApi.comodidades()])
    return { cidades: asList(cidades), comodidades: asList(comodidades) }
  }, [])

  if (apoio.loading) return <PageSpinner label="Carregando cidades e comodidades..." />
  if (apoio.error) return <ErrorAlert error={apoio.error} onRetry={apoio.reload} />

  const { cidades, comodidades } = apoio.data
  const nomeCidade = (id) => {
    const c = cidades.find((x) => String(x.id) === String(id))
    return c ? `${c.nome} - ${c.estado}` : '—'
  }

  const campos = [
    { name: 'nome', label: 'Nome do hotel', type: 'text', required: true, maxLength: 100 },
    {
      name: 'cidade_id',
      label: 'Cidade',
      type: 'select',
      required: true,
      options: cidades.map((c) => ({ value: String(c.id), label: `${c.nome} - ${c.estado}` })),
      help: cidades.length ? undefined : 'Cadastre uma cidade antes de criar hotéis.',
    },
    {
      name: 'categoria_estrelas',
      label: 'Categoria (estrelas)',
      type: 'select',
      required: true,
      options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'estrela' : 'estrelas'}` })),
    },
    { name: 'latitude', label: 'Latitude (opcional)', type: 'number', step: 'any', min: -90, max: 90, help: 'Usada no filtro territorial (bônus).' },
    { name: 'longitude', label: 'Longitude (opcional)', type: 'number', step: 'any', min: -180, max: 180 },
    ...(comodidades.length
      ? [
          {
            name: 'comodidade_ids',
            label: 'Comodidades',
            type: 'checkboxes',
            options: comodidades.map((c) => ({ value: String(c.id), label: c.nome })),
          },
        ]
      : []),
  ]

  return (
    <CrudPage
      titulo="Hotéis"
      singular="Hotel"
      carregar={() => catalogoApi.hoteis().then(asList)}
      criar={adminApi.hoteis.criar}
      atualizar={adminApi.hoteis.atualizar}
      remover={adminApi.hoteis.remover}
      colunas={[
        { key: 'nome', label: 'Nome' },
        { key: 'cidade', label: 'Cidade', render: (h) => nomeCidade(h.cidade_id ?? h.cidade?.id ?? h.cidade?.cidade_id) },
        { key: 'estrelas', label: 'Categoria', render: (h) => <Stars value={h.categoria_estrelas} /> },
      ]}
      campos={campos}
      valoresIniciais={{ nome: '', cidade_id: '', categoria_estrelas: '', latitude: '', longitude: '', comodidade_ids: [] }}
      paraFormulario={(h) => ({
        nome: h.nome,
        cidade_id: String(h.cidade_id ?? h.cidade?.id ?? h.cidade?.cidade_id ?? ''),
        categoria_estrelas: String(h.categoria_estrelas ?? ''),
        latitude: h.localizacao?.coordinates ? String(h.localizacao.coordinates[1]) : '',
        longitude: h.localizacao?.coordinates ? String(h.localizacao.coordinates[0]) : '',
        comodidade_ids: (h.comodidade_ids ?? (h.comodidades ?? []).map((c) => c?.id).filter(Boolean)).map(String),
      })}
      paraPayload={(v) => {
        const lat = numOuNulo(v.latitude)
        const lng = numOuNulo(v.longitude)
        return {
          nome: v.nome.trim(),
          cidade_id: v.cidade_id,
          categoria_estrelas: Number(v.categoria_estrelas),
          localizacao: lat !== null && lng !== null ? { type: 'Point', coordinates: [lng, lat] } : null,
          comodidade_ids: v.comodidade_ids,
        }
      }}
      recarregarDeps={[cidades.length]}
    />
  )
}
