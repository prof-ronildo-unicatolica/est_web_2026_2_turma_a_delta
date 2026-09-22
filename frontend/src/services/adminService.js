import { delay } from './apiClient'
import {
  mockCidades,
  mockHoteis,
  mockQuartos,
  mockTarifasTemporada,
  mockComodidades,
} from '../data/mockData'

// Cópias em memória para permitir criar/editar/remover durante a sessão.
const cidades = [...mockCidades]
const hoteis = [...mockHoteis]
const quartos = [...mockQuartos]
const tarifas = [...mockTarifasTemporada]
const comodidades = [...mockComodidades]

const auditoria = [
  { id: 'aud-1', acao: 'CRIACAO', entidade: 'Hotel', usuario: 'admin@hotel.com', data: '2026-09-01T10:12:00', detalhe: 'Criou o hotel "Vila dos Ventos Resort"' },
  { id: 'aud-2', acao: 'ATUALIZACAO', entidade: 'Quarto', usuario: 'admin@hotel.com', data: '2026-09-03T14:40:00', detalhe: 'Atualizou o preço do quarto 101' },
  { id: 'aud-3', acao: 'CANCELAMENTO', entidade: 'Reserva', usuario: 'cliente@hotel.com', data: '2026-09-05T09:05:00', detalhe: 'Cancelou a reserva #7777' },
]

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Todas as funções abaixo são mock (armazenam em memória, no navegador).
 * TODO: ao implementar os endpoints REST reais (/api/v1/cidades,
 * /api/v1/hoteis, /api/v1/quartos, /api/v1/tarifas-temporada,
 * /api/v1/comodidades, /api/v1/auditoria), substitua o corpo de cada
 * função por chamadas via apiFetch, mantendo a mesma assinatura usada
 * pelas páginas em src/pages/admin/*.
 */

// ---- Cidades ----
export async function listarCidadesAdmin() {
  await delay(300)
  return cidades
}
export async function criarCidade(dados) {
  await delay(300)
  const nova = { id: genId('cid'), ...dados }
  cidades.push(nova)
  return nova
}
export async function removerCidade(id) {
  await delay(200)
  const idx = cidades.findIndex((c) => c.id === id)
  if (idx >= 0) cidades.splice(idx, 1)
}

// ---- Hotéis ----
export async function listarHoteisAdmin() {
  await delay(300)
  return hoteis
}
export async function criarHotel(dados) {
  await delay(300)
  const novo = { id: genId('hotel'), mediaAvaliacao: 0, totalAvaliacoes: 0, comodidades: [], ...dados }
  hoteis.push(novo)
  return novo
}
export async function removerHotel(id) {
  await delay(200)
  const idx = hoteis.findIndex((h) => h.id === id)
  if (idx >= 0) hoteis.splice(idx, 1)
}

// ---- Quartos ----
export async function listarQuartosAdmin() {
  await delay(300)
  return quartos
}
export async function criarQuarto(dados) {
  await delay(300)
  const novo = { id: genId('quarto'), ...dados }
  quartos.push(novo)
  return novo
}
export async function removerQuarto(id) {
  await delay(200)
  const idx = quartos.findIndex((q) => q.id === id)
  if (idx >= 0) quartos.splice(idx, 1)
}

// ---- Tarifas de temporada ----
export async function listarTarifasAdmin() {
  await delay(300)
  return tarifas
}
export async function criarTarifa(dados) {
  await delay(300)
  const nova = { id: genId('tarifa'), ...dados }
  tarifas.push(nova)
  return nova
}
export async function removerTarifa(id) {
  await delay(200)
  const idx = tarifas.findIndex((t) => t.id === id)
  if (idx >= 0) tarifas.splice(idx, 1)
}

// ---- Comodidades / Serviços ----
export async function listarComodidadesAdmin() {
  await delay(300)
  return comodidades
}
export async function criarComodidade(dados) {
  await delay(300)
  const nova = { id: genId('com'), ...dados }
  comodidades.push(nova)
  return nova
}
export async function removerComodidade(id) {
  await delay(200)
  const idx = comodidades.findIndex((c) => c.id === id)
  if (idx >= 0) comodidades.splice(idx, 1)
}

// ---- Auditoria ----
export async function listarAuditoria() {
  await delay(300)
  return auditoria
}
