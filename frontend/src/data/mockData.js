/**
 * DADOS MOCK (fake) do domínio de Rede Hoteleira.
 *
 * Enquanto o backend (core-service) não expõe as rotas reais de
 * /api/v1/hoteis, /api/v1/quartos, /api/v1/reservas etc, o front-end
 * usa estes dados estáticos para permitir o desenvolvimento e a
 * demonstração completa do fluxo de telas.
 *
 * Quando a equipe implementar os endpoints reais no core-service,
 * basta trocar as funções em `src/services/*.js` (procure pelos
 * comentários "TODO: substituir por chamada real").
 */

export const mockCidades = [
  { id: 'cid-1', nome: 'Fortaleza', estado: 'CE' },
  { id: 'cid-2', nome: 'Recife', estado: 'PE' },
  { id: 'cid-3', nome: 'Natal', estado: 'RN' },
  { id: 'cid-4', nome: 'Salvador', estado: 'BA' },
]

export const mockComodidades = [
  { id: 'com-1', nome: 'Piscina' },
  { id: 'com-2', nome: 'Wi-Fi' },
  { id: 'com-3', nome: 'Academia' },
  { id: 'com-4', nome: 'Estacionamento' },
  { id: 'com-5', nome: 'Café da manhã incluso' },
  { id: 'com-6', nome: 'Pet friendly' },
]

export const mockHoteis = [
  {
    id: 'hotel-1',
    nome: 'Vila dos Ventos Resort',
    cidadeId: 'cid-1',
    estrelas: 5,
    mediaAvaliacao: 4.8,
    totalAvaliacoes: 132,
    comodidades: ['com-1', 'com-2', 'com-3', 'com-5'],
    imagem: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60',
    descricao: 'Resort à beira-mar com vista para o pôr do sol, ideal para famílias e casais.',
  },
  {
    id: 'hotel-2',
    nome: 'Pousada Mar Aberto',
    cidadeId: 'cid-1',
    estrelas: 3,
    mediaAvaliacao: 4.2,
    totalAvaliacoes: 58,
    comodidades: ['com-2', 'com-4', 'com-6'],
    imagem: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
    descricao: 'Pousada aconchegante a 200m da praia, com atendimento familiar.',
  },
  {
    id: 'hotel-3',
    nome: 'Recife Business Hotel',
    cidadeId: 'cid-2',
    estrelas: 4,
    mediaAvaliacao: 4.5,
    totalAvaliacoes: 89,
    comodidades: ['com-2', 'com-3', 'com-4'],
    imagem: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60',
    descricao: 'Hotel executivo próximo ao centro financeiro, com salas de reunião.',
  },
  {
    id: 'hotel-4',
    nome: 'Dunas Natal Hotel',
    cidadeId: 'cid-3',
    estrelas: 4,
    mediaAvaliacao: 4.6,
    totalAvaliacoes: 74,
    comodidades: ['com-1', 'com-2', 'com-5'],
    imagem: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=60',
    descricao: 'Vista para as dunas de Genipabu, piscina de borda infinita.',
  },
  {
    id: 'hotel-5',
    nome: 'Salvador Colonial Hotel',
    cidadeId: 'cid-4',
    estrelas: 5,
    mediaAvaliacao: 4.9,
    totalAvaliacoes: 210,
    comodidades: ['com-1', 'com-2', 'com-3', 'com-4', 'com-5'],
    imagem: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60',
    descricao: 'Charme colonial no Pelourinho, totalmente reformado com conforto moderno.',
  },
]

export const mockQuartos = [
  { id: 'quarto-1', hotelId: 'hotel-1', numero: '101', tipo: 'Casal Luxo', precoBase: 280, capacidadeAdultos: 2, capacidadeCriancas: 1, imagem: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-2', hotelId: 'hotel-1', numero: '102', tipo: 'Família Premium', precoBase: 450, capacidadeAdultos: 2, capacidadeCriancas: 2, imagem: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-3', hotelId: 'hotel-2', numero: '201', tipo: 'Simples', precoBase: 150, capacidadeAdultos: 1, capacidadeCriancas: 0, imagem: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-4', hotelId: 'hotel-2', numero: '202', tipo: 'Casal', precoBase: 210, capacidadeAdultos: 2, capacidadeCriancas: 1, imagem: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-5', hotelId: 'hotel-3', numero: '301', tipo: 'Executivo', precoBase: 320, capacidadeAdultos: 2, capacidadeCriancas: 0, imagem: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-6', hotelId: 'hotel-4', numero: '401', tipo: 'Triplo', precoBase: 300, capacidadeAdultos: 3, capacidadeCriancas: 1, imagem: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=60' },
  { id: 'quarto-7', hotelId: 'hotel-5', numero: '501', tipo: 'Suíte Master', precoBase: 520, capacidadeAdultos: 2, capacidadeCriancas: 2, imagem: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60' },
]

// Tarifas de temporada (ex.: alta temporada aplica multiplicador sobre a diária)
export const mockTarifasTemporada = [
  { id: 'tarifa-1', nome: 'Verão / Réveillon', inicio: '2026-12-15', fim: '2027-01-10', multiplicador: 1.3 },
  { id: 'tarifa-2', nome: 'Férias de Julho', inicio: '2026-07-01', fim: '2026-07-31', multiplicador: 1.15 },
]

export const mockServicosOpcionais = [
  { id: 'serv-1', nome: 'Café da manhã premium', preco: 30, unidade: 'por diária' },
  { id: 'serv-2', nome: 'Translado aeroporto', preco: 80, unidade: 'taxa única' },
  { id: 'serv-3', nome: 'Late checkout', preco: null, unidade: '+30% de 1 diária' },
  { id: 'serv-4', nome: 'Early check-in', preco: null, unidade: '+30% de 1 diária' },
]

export const STATUS_RESERVA = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
}

export const mockReservas = [
  {
    id: 'reserva-8888',
    usuarioEmail: 'cliente@teste.com',
    hotelId: 'hotel-1',
    quartoId: 'quarto-1',
    checkin: '2026-11-10',
    checkout: '2026-11-15',
    status: STATUS_RESERVA.CONFIRMADA,
    tipoTarifa: 'reembolsavel',
    dataLimiteCancelamento: '2026-11-08',
    valorTotal: 1520,
    avaliada: false,
  },
  {
    id: 'reserva-7777',
    usuarioEmail: 'cliente@teste.com',
    hotelId: 'hotel-3',
    quartoId: 'quarto-5',
    checkin: '2026-08-01',
    checkout: '2026-08-03',
    status: STATUS_RESERVA.CANCELADA,
    tipoTarifa: 'nao_reembolsavel',
    dataLimiteCancelamento: null,
    valorTotal: 576,
    avaliada: false,
  },
  {
    id: 'reserva-6666',
    usuarioEmail: 'cliente@teste.com',
    hotelId: 'hotel-2',
    quartoId: 'quarto-3',
    checkin: '2026-05-01',
    checkout: '2026-05-04',
    status: STATUS_RESERVA.CONCLUIDA,
    tipoTarifa: 'reembolsavel',
    dataLimiteCancelamento: null,
    valorTotal: 450,
    avaliada: false,
  },
]

export function getHotelById(id) {
  return mockHoteis.find((h) => h.id === id) || null
}

export function getQuartosByHotelId(hotelId) {
  return mockQuartos.filter((q) => q.hotelId === hotelId)
}

export function getQuartoById(id) {
  return mockQuartos.find((q) => q.id === id) || null
}

export function getCidadeById(id) {
  return mockCidades.find((c) => c.id === id) || null
}

export function getComodidadesByIds(ids) {
  return mockComodidades.filter((c) => ids.includes(c.id))
}
