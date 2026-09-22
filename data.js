// Dados de exemplo (mock) usados enquanto o backend ainda não expõe os
// endpoints reais de hotéis/quartos/reservas/cidades em app/api/v1.
//
// O formato de cada objeto foi espelhado a partir dos modelos SQLAlchemy em
// apps/services/core-service/app/models/*.py, para que a troca do mock pela
// API real seja apenas uma questão de implementar as rotas — nenhum
// componente de tela precisará mudar de formato.

export const cidadesMock = [
  {
    id: 'cid-1',
    nome: 'Fortaleza',
    estado: 'CE',
    limite_territorial: null,
  },
  {
    id: 'cid-2',
    nome: 'Natal',
    estado: 'RN',
    limite_territorial: null,
  },
  {
    id: 'cid-3',
    nome: 'Gramado',
    estado: 'RS',
    limite_territorial: null,
  },
]

export const comodidadesMock = [
  { id: 'com-1', nome: 'Wi-Fi gratuito' },
  { id: 'com-2', nome: 'Piscina' },
  { id: 'com-3', nome: 'Café da manhã incluso' },
  { id: 'com-4', nome: 'Estacionamento' },
  { id: 'com-5', nome: 'Academia' },
  { id: 'com-6', nome: 'Pet friendly' },
]

export const hoteisMock = [
  {
    id: 'hot-1',
    nome: 'Hotel Praia Dourada',
    cidade_id: 'cid-1',
    categoria_estrelas: 4,
    localizacao: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { local: 'Hotel Praia Dourada', descricao: 'Beira-mar, Fortaleza/CE' },
          geometry: { type: 'Point', coordinates: [-38.5108, -3.7275] },
        },
      ],
    },
    comodidades: ['com-1', 'com-2', 'com-3', 'com-4'],
    descricao: 'Hotel à beira-mar com vista para o pôr do sol, a poucos minutos do centro de Fortaleza.',
  },
  {
    id: 'hot-2',
    nome: 'Pousada Dunas do Sol',
    cidade_id: 'cid-2',
    categoria_estrelas: 3,
    localizacao: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { local: 'Pousada Dunas do Sol', descricao: 'Ponta Negra, Natal/RN' },
          geometry: { type: 'Point', coordinates: [-35.1631, -5.8767] },
        },
      ],
    },
    comodidades: ['com-1', 'com-3', 'com-6'],
    descricao: 'Pousada aconchegante próxima à praia de Ponta Negra, ideal para famílias.',
  },
  {
    id: 'hot-3',
    nome: 'Serra Verde Resort',
    cidade_id: 'cid-3',
    categoria_estrelas: 5,
    localizacao: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { local: 'Serra Verde Resort', descricao: 'Centro de Gramado/RS' },
          geometry: { type: 'Point', coordinates: [-50.8756, -29.3747] },
        },
      ],
    },
    comodidades: ['com-1', 'com-2', 'com-3', 'com-4', 'com-5'],
    descricao: 'Resort de montanha com spa completo, lareira e gastronomia premiada.',
  },
]

export const quartosMock = [
  { id: 'qua-1', hotel_id: 'hot-1', numero: '101', tipo: 'Standard', preco_diaria: 320.0, max_adultos: 2, max_criancas: 1 },
  { id: 'qua-2', hotel_id: 'hot-1', numero: '202', tipo: 'Luxo', preco_diaria: 520.0, max_adultos: 2, max_criancas: 2 },
  { id: 'qua-3', hotel_id: 'hot-1', numero: '301', tipo: 'Suíte', preco_diaria: 780.0, max_adultos: 4, max_criancas: 2 },
  { id: 'qua-4', hotel_id: 'hot-2', numero: '05', tipo: 'Standard', preco_diaria: 210.0, max_adultos: 2, max_criancas: 1 },
  { id: 'qua-5', hotel_id: 'hot-2', numero: '12', tipo: 'Família', preco_diaria: 340.0, max_adultos: 4, max_criancas: 2 },
  { id: 'qua-6', hotel_id: 'hot-3', numero: '10', tipo: 'Standard', preco_diaria: 590.0, max_adultos: 2, max_criancas: 0 },
  { id: 'qua-7', hotel_id: 'hot-3', numero: '20', tipo: 'Suíte Master', preco_diaria: 1250.0, max_adultos: 3, max_criancas: 2 },
]

export const avaliacoesMock = [
  { id: 'ava-1', hotel_id: 'hot-1', usuario_id: 'usr-1', nota: 5, comentario: 'Vista incrível e café da manhã excelente!', data_publicacao: '2026-06-10T12:00:00Z' },
  { id: 'ava-2', hotel_id: 'hot-1', usuario_id: 'usr-2', nota: 4, comentario: 'Ótima localização, atendimento muito bom.', data_publicacao: '2026-07-02T09:30:00Z' },
  { id: 'ava-3', hotel_id: 'hot-2', usuario_id: 'usr-3', nota: 4, comentario: 'Pousada simples e limpa, boa relação custo-benefício.', data_publicacao: '2026-05-20T18:15:00Z' },
  { id: 'ava-4', hotel_id: 'hot-3', usuario_id: 'usr-1', nota: 5, comentario: 'Resort maravilhoso, voltaremos com certeza.', data_publicacao: '2026-08-01T20:45:00Z' },
]

// Usuário "logado" fictício, até a autenticação real (app/api/v1/auth.py) ser
// integrada ao frontend.
export const usuarioAtualMock = {
  id: 'usr-1',
  nome: 'Convidado(a)',
  email: 'convidado@example.com',
  is_admin: false,
}

// Mantém as reservas mock em memória durante a sessão do navegador, para que
// criar/cancelar reservas na UI pareça persistente enquanto não há backend.
export let reservasMock = [
  {
    id: 'res-1',
    usuario_id: 'usr-1',
    quarto_id: 'qua-2',
    data_checkin: '2026-10-10',
    data_checkout: '2026-10-14',
    quantidade_adultos: 2,
    quantidade_criancas: 0,
    quantidade_bebes: 0,
    early_checkin: false,
    late_checkout: true,
    necessita_berco: false,
    tarifa_tipo: 'Reembolsavel',
    data_limite_cancelamento: '2026-10-05',
    valor_multa_cancelamento: 0,
    valor_total: 2080.0,
    status: 'Confirmada',
  },
]

export function adicionarReservaMock(reserva) {
  reservasMock = [...reservasMock, reserva]
  return reserva
}

export function atualizarStatusReservaMock(id, status) {
  reservasMock = reservasMock.map((r) => (r.id === id ? { ...r, status } : r))
  return reservasMock.find((r) => r.id === id)
}
