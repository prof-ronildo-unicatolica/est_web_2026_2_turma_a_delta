import { adminApi, catalogoApi } from '../../api/services'
import { asList } from '../../utils/catalog'
import CrudPage from './CrudPage'

const EXEMPLO_GEOJSON = {
  type: 'Polygon',
  coordinates: [
    [
      [-39.08, -4.91],
      [-38.95, -4.91],
      [-38.95, -5.03],
      [-39.08, -5.03],
      [-39.08, -4.91],
    ],
  ],
}

function validarGeoJSON(texto) {
  let obj
  try {
    obj = JSON.parse(texto)
  } catch {
    return 'JSON inválido. Cole um GeoJSON válido.'
  }
  const tiposOk = ['Polygon', 'MultiPolygon', 'Feature', 'FeatureCollection']
  if (!obj || typeof obj !== 'object' || !tiposOk.includes(obj.type)) {
    return `O GeoJSON precisa ter "type" igual a um de: ${tiposOk.join(', ')}.`
  }
  return ''
}

const campos = [
  { name: 'nome', label: 'Nome da cidade', type: 'text', required: true, maxLength: 100 },
  {
    name: 'estado',
    label: 'UF',
    type: 'text',
    required: true,
    maxLength: 2,
    upper: true,
    help: 'Sigla do estado, ex.: CE',
    validate: (v) => (/^[A-Z]{2}$/.test(v) ? '' : 'Use 2 letras, ex.: CE.'),
  },
  {
    name: 'limite_territorial',
    label: 'Limite territorial (GeoJSON)',
    type: 'textarea',
    required: true,
    rows: 7,
    help: 'Polígono da cidade em GeoJSON (dá para baixar do IBGE).',
    validate: validarGeoJSON,
  },
]

export default function CidadesAdmin() {
  return (
    <CrudPage
      titulo="Cidades"
      singular="Cidade"
      carregar={() => catalogoApi.cidades().then(asList)}
      criar={adminApi.cidades.criar}
      atualizar={adminApi.cidades.atualizar}
      remover={adminApi.cidades.remover}
      colunas={[
        { key: 'nome', label: 'Nome' },
        { key: 'estado', label: 'UF' },
        {
          key: 'limite',
          label: 'Limite territorial',
          render: (c) => (c.limite_territorial ? <span className="chip">{c.limite_territorial.type || 'GeoJSON'}</span> : '—'),
        },
      ]}
      campos={campos}
      valoresIniciais={{ nome: '', estado: '', limite_territorial: '' }}
      paraFormulario={(c) => ({
        nome: c.nome,
        estado: c.estado,
        limite_territorial: JSON.stringify(c.limite_territorial ?? '', null, 2),
      })}
      paraPayload={(v) => ({
        nome: v.nome.trim(),
        estado: v.estado.trim().toUpperCase(),
        limite_territorial: JSON.parse(v.limite_territorial),
      })}
      acoesDoFormulario={(_, set) => (
        <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={() => set('limite_territorial', JSON.stringify(EXEMPLO_GEOJSON, null, 2))}>
          Preencher com um polígono de exemplo
        </button>
      )}
    />
  )
}
