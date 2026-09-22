const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function token() { return localStorage.getItem('hotel_access_token') }
function headers(json = false) {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  const t = token(); if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) } })
  if (res.status === 401) { localStorage.removeItem('hotel_access_token'); throw new Error('Sessão expirada. Faça login novamente.') }
  if (!res.ok) { let msg = `Erro HTTP ${res.status}`; try { const d=await res.json(); msg=d.detail || msg } catch {} ; throw new Error(msg) }
  return res.status === 204 ? null : res.json()
}

export const API_BASE_URL = BASE_URL
export async function listarCidades(){ return request('/cidades') }
export async function listarComodidades(){ return request('/comodidades') }
export async function listarHoteis(filtros={}) { const p=new URLSearchParams(Object.entries(filtros).filter(([,v])=>v!==undefined&&v!=='')); return request(`/hoteis?${p}`) }
export async function obterHotel(id){ return request(`/hoteis/${id}`) }
export async function listarQuartosPorHotel(id){ return request(`/hoteis/${id}/quartos`) }
export async function listarAvaliacoesPorHotel(id){ return request(`/hoteis/${id}/avaliacoes`) }
export async function login(email, senha){ const d=await request('/auth/login',{method:'POST',body:JSON.stringify({email,senha})}); localStorage.setItem('hotel_access_token',d.access_token); return obterUsuarioAtual() }
export async function registrarUsuario(payload){ return request('/auth/register',{method:'POST',body:JSON.stringify(payload)}) }
export async function obterUsuarioAtual(){ return request('/auth/me') }
export async function logout(){ localStorage.removeItem('hotel_access_token') }
export async function listarMinhasReservas(){ return request('/reservas') }
export async function listarReservasDoUsuario(){ return listarMinhasReservas() }
export async function criarReserva(payload){ return request('/reservas',{method:'POST',body:JSON.stringify(payload)}) }
export async function obterReserva(id){ return request(`/reservas/${id}`) }
export async function cancelarReserva(id){ return request(`/reservas/${id}/cancelar`,{method:'POST',body:JSON.stringify({})}) }
export function calcularValorTotal({precoDiaria,dataCheckin,dataCheckout}) { const a=new Date(dataCheckin), b=new Date(dataCheckout); const diarias=Math.max(1,Math.round((b-a)/86400000)); return {diarias,valorTotal:Number((diarias*Number(precoDiaria)).toFixed(2))} }
export async function criarCidade(payload){return request('/admin/cidades',{method:'POST',body:JSON.stringify(payload)})}
export async function atualizarCidade(id,payload){return request(`/admin/cidades/${id}`,{method:'PUT',body:JSON.stringify(payload)})}
export async function excluirCidade(id){return request(`/admin/cidades/${id}`,{method:'DELETE'})}
export async function criarHotel(payload){return request('/admin/hoteis',{method:'POST',body:JSON.stringify(payload)})}
export async function atualizarHotel(id,payload){return request(`/admin/hoteis/${id}`,{method:'PUT',body:JSON.stringify(payload)})}
export async function excluirHotel(id){return request(`/admin/hoteis/${id}`,{method:'DELETE'})}
export async function criarQuarto(payload){return request('/admin/quartos',{method:'POST',body:JSON.stringify(payload)})}
export async function atualizarQuarto(id,payload){return request(`/admin/quartos/${id}`,{method:'PUT',body:JSON.stringify(payload)})}
export async function excluirQuarto(id){return request(`/admin/quartos/${id}`,{method:'DELETE'})}
export async function preverPreco(payload){return request('/precos/preview',{method:'POST',body:JSON.stringify(payload)})}
