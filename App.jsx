import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import PaginaHoteis from './components/hoteis/PaginaHoteis'
import PaginaHotelDetalhe from './components/hoteis/PaginaHotelDetalhe'
import PaginaNovaReserva from './components/reservas/PaginaNovaReserva'
import PaginaMinhasReservas from './components/reservas/PaginaMinhasReservas'
import PainelAdmin from './components/admin/PainelAdmin'
import { login, registrarUsuario, obterUsuarioAtual, logout } from './services/api'

function Auth({ onLogin }) {
  const [cadastro,setCadastro]=useState(false); const [form,setForm]=useState({nome:'',email:'',senha:''}); const [erro,setErro]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(e){e.preventDefault();setErro('');setBusy(true);try{if(cadastro){await registrarUsuario(form);await login(form.email,form.senha)}else{await login(form.email,form.senha)} onLogin(await obterUsuarioAtual())}catch(err){setErro(err.message)}finally{setBusy(false)}}
  return <div className="container py-5" style={{maxWidth:520}}><div className="card shadow-sm border-0"><div className="card-body p-4"><h2 className="fw-bold mb-4">{cadastro?'Criar conta':'Entrar'}</h2>{erro&&<div className="alert alert-danger">{erro}</div>}<form onSubmit={submit}>{cadastro&&<input className="form-control mb-3" placeholder="Nome" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/>}<input className="form-control mb-3" type="email" placeholder="E-mail" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="form-control mb-3" type="password" placeholder="Senha" required minLength={6} value={form.senha} onChange={e=>setForm({...form,senha:e.target.value})}/><button className="btn btn-primary w-100" disabled={busy}>{busy?'Aguarde...':cadastro?'Cadastrar':'Entrar'}</button></form><button className="btn btn-link mt-3" onClick={()=>setCadastro(!cadastro)}>{cadastro?'Já tenho conta':'Ainda não tenho conta'}</button></div></div></div>
}

export default function App(){
  const [usuario,setUsuario]=useState(null); const [carregando,setCarregando]=useState(true); const [rota,setRota]=useState({pagina:'hoteis'})
  useEffect(()=>{obterUsuarioAtual().then(setUsuario).catch(()=>{}).finally(()=>setCarregando(false))},[])
  if(carregando) return <div className="container py-5 text-center">Carregando...</div>
  if(!usuario) return <Auth onLogin={setUsuario}/>
  const navegar=(r)=>setRota(r)
  let pagina=<PaginaHoteis aoNavegar={navegar}/>
  if(rota.pagina==='hotel-detalhe') pagina=<PaginaHotelDetalhe hotelId={rota.hotelId} aoNavegar={navegar}/>
  if(rota.pagina==='nova-reserva') pagina=<PaginaNovaReserva hotel={rota.hotel} quarto={rota.quarto} aoNavegar={navegar}/>
  if(rota.pagina==='minhas-reservas') pagina=<PaginaMinhasReservas aoNavegar={navegar}/>
  if(rota.pagina==='admin' && usuario.is_admin) pagina=<PainelAdmin/>
  if(rota.pagina==='sobre') pagina=<div className="alert alert-info">Sistema de reservas hoteleiras — Sprints 1 a 8.</div>
  return <><Navbar pagina={rota.pagina} usuario={usuario} aoNavegar={async r=>{if(r.pagina==='logout'){await logout();setUsuario(null);return} navegar(r)}}/><main className="container pb-5">{pagina}</main></>
}
