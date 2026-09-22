import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import PaginaLogin from './components/auth/PaginaLogin'
import PaginaHoteis from './components/hoteis/PaginaHoteis'
import PaginaHotelDetalhe from './components/hoteis/PaginaHotelDetalhe'
import PaginaNovaReserva from './components/reservas/PaginaNovaReserva'
import PaginaMinhasReservas from './components/reservas/PaginaMinhasReservas'
import PaginaSobre from './components/tutorial/PaginaSobre'
import { getToken, logout, obterUsuarioAtual } from './services/api'

// Páginas acessíveis sem estar autenticado.
const PAGINAS_PUBLICAS = ['login', 'sobre']

// Fluxo da aplicação (Integrante 4 — Reserva + Frontend):
//   Login -> Busca (Home) -> Hotel -> Quarto -> Reserva (Checkout) -> Minhas reservas
//
// Em vez de um router de verdade, o app segue o padrão já usado pelas
// páginas existentes: cada página recebe `aoNavegar(destino)` e o estado
// de "rota atual" fica aqui, no componente raiz.
export default function App() {
  const [rota, setRota] = useState({ pagina: 'login' })
  const [usuario, setUsuario] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  // Ao carregar o app, se já existir um token salvo, tenta restaurar a
  // sessão chamando GET /auth/me antes de decidir a página inicial.
  useEffect(() => {
    async function restaurarSessao() {
      if (getToken()) {
        const dados = await obterUsuarioAtual()
        if (dados) {
          setUsuario(dados)
          setRota({ pagina: 'hoteis' })
        }
      }
      setCarregandoSessao(false)
    }
    restaurarSessao()
  }, [])

  function aoNavegar(destino) {
    if (!usuario && !PAGINAS_PUBLICAS.includes(destino.pagina)) {
      // Guarda o destino pretendido para retomar o fluxo após o login.
      setRota({ pagina: 'login', destinoPretendido: destino })
      return
    }
    setRota(destino)
  }

  function aoLogar(usuarioLogado) {
    setUsuario(usuarioLogado)
    setRota(rota.destinoPretendido || { pagina: 'hoteis' })
  }

  function aoSair() {
    logout()
    setUsuario(null)
    setRota({ pagina: 'login' })
  }

  if (carregandoSessao) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar pagina={rota.pagina} aoNavegar={aoNavegar} usuario={usuario} aoSair={aoSair} />

      <div className="container pb-5">
        {rota.pagina === 'login' && <PaginaLogin aoLogar={aoLogar} />}

        {rota.pagina === 'hoteis' && <PaginaHoteis aoNavegar={aoNavegar} />}

        {rota.pagina === 'hotel-detalhe' && (
          <PaginaHotelDetalhe hotelId={rota.hotelId} aoNavegar={aoNavegar} />
        )}

        {rota.pagina === 'nova-reserva' && (
          <PaginaNovaReserva hotel={rota.hotel} quarto={rota.quarto} aoNavegar={aoNavegar} />
        )}

        {rota.pagina === 'minhas-reservas' && <PaginaMinhasReservas aoNavegar={aoNavegar} />}

        {rota.pagina === 'sobre' && <PaginaSobre />}
      </div>
    </>
  )
}
