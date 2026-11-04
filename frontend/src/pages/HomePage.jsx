
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { catalogoApi } from '../api/services'

function numero(valor, padrao = 0) {
  const convertido = Number(valor)
  return Number.isFinite(convertido) ? convertido : padrao
}

function hojeISO() {
  const data = new Date()
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function adicionarDias(data, quantidade) {
  if (!data) return ''

  const resultado = new Date(`${data}T12:00:00`)
  resultado.setDate(resultado.getDate() + quantidade)

  const ano = resultado.getFullYear()
  const mes = String(resultado.getMonth() + 1).padStart(2, '0')
  const dia = String(resultado.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function formatarMoeda(valor) {
  return numero(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function extrairLista(resposta) {
  if (Array.isArray(resposta)) return resposta

  if (Array.isArray(resposta?.items)) return resposta.items
  if (Array.isArray(resposta?.results)) return resposta.results
  if (Array.isArray(resposta?.data)) return resposta.data

  return []
}

function lerFiltros(params) {
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''

  return {
    cidade: params.get('cidade') || '',
    checkin,
    checkout,
    adultos: Math.max(1, numero(params.get('adultos'), 2)),
    criancas: Math.max(0, numero(params.get('criancas'), 0)),
    bebes: Math.max(0, numero(params.get('bebes'), 0)),
    estrelas: params.get('estrelas') || '',
  }
}

function nomeCidade(hotel) {
  return (
    hotel?.cidade?.nome ||
    hotel?.cidade_nome ||
    hotel?.nome_cidade ||
    hotel?.cidade ||
    'Localização não informada'
  )
}

function nomeEstado(hotel) {
  return (
    hotel?.cidade?.estado ||
    hotel?.estado ||
    hotel?.uf ||
    ''
  )
}

function nomeHotel(hotel) {
  return hotel?.nome || hotel?.name || 'Hotel sem nome'
}

function quantidadeEstrelas(hotel) {
  return numero(
    hotel?.categorias_estrelas ??
    hotel?.categoria_estrelas ??
    hotel?.estrelas ??
    hotel?.categoria,
  )
}

function menorPreco(hotel, quartos) {
  const precoDireto =
    hotel?.menor_preco ??
    hotel?.preco_diaria ??
    hotel?.valor_diaria ??
    hotel?.preco

  if (precoDireto !== undefined && precoDireto !== null) {
    return numero(precoDireto)
  }

  const quartosDoHotel = quartos.filter(
    (quarto) =>
      String(quarto?.hotel_id || quarto?.hotel?.id || '') ===
      String(hotel?.id || ''),
  )

  const precos = quartosDoHotel
    .map((quarto) =>
      numero(
        quarto?.preco_diaria ??
        quarto?.valor_diaria ??
        quarto?.preco,
        -1,
      ),
    )
    .filter((preco) => preco >= 0)

  return precos.length ? Math.min(...precos) : null
}

function HotelCard({ hotel, quartos, query }) {
  const estrelas = quantidadeEstrelas(hotel)
  const preco = menorPreco(hotel, quartos)
  const cidade = nomeCidade(hotel)
  const estado = nomeEstado(hotel)

  const comodidades = Array.isArray(hotel?.comodidades)
    ? hotel.comodidades
    : Array.isArray(hotel?.facilidades)
      ? hotel.facilidades
      : []

  const localizacao = estado ? `${cidade} - ${estado}` : cidade

  return (
    <article className="card hotel-card h-100 border-0 shadow-sm">
      <div
        className="hotel-card-cover d-flex align-items-center justify-content-center"
        style={{
          minHeight: '190px',
          background: '#eaf1f7',
        }}
      >
        {hotel?.imagem_url || hotel?.foto_url || hotel?.imagem ? (
          <img
            src={hotel.imagem_url || hotel.foto_url || hotel.imagem}
            alt={`Imagem do ${nomeHotel(hotel)}`}
            className="w-100 h-100"
            style={{
              minHeight: '190px',
              maxHeight: '220px',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div className="text-center text-secondary p-4">
            <div className="fs-1 mb-2" aria-hidden="true">
              🏨
            </div>
            <span>Imagem não disponível</span>
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>
            <h2 className="h5 fw-bold mb-1">
              {nomeHotel(hotel)}
            </h2>

            <p className="text-secondary small mb-0">
              {localizacao}
            </p>
          </div>

          {estrelas > 0 && (
            <span
              className="badge bg-warning text-dark"
              aria-label={`${estrelas} estrelas`}
            >
              {'★'.repeat(Math.min(estrelas, 5))}
            </span>
          )}
        </div>

        {comodidades.length > 0 && (
          <div className="d-flex flex-wrap gap-2 my-3">
            {comodidades.slice(0, 4).map((item, indice) => (
              <span
                key={`${String(item)}-${indice}`}
                className="badge bg-light text-secondary border"
              >
                {typeof item === 'string' ? item : item?.nome}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-top">
          <div className="mb-3">
            <span className="text-secondary small d-block">
              Diária a partir de
            </span>

            <strong className="fs-5 text-primary">
              {preco !== null
                ? formatarMoeda(preco)
                : 'Consulte os valores'}
            </strong>
          </div>

          <Link
            to={`/hoteis/${hotel.id}${query}`}
            className="btn btn-primary w-100"
          >
            Ver quartos disponíveis
          </Link>
        </div>
      </div>
    </article>
  )
}

function Contador({ titulo, descricao, valor, minimo, aoAlterar }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2">
      <div>
        <strong className="d-block">{titulo}</strong>
        <small className="text-secondary">{descricao}</small>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => aoAlterar(Math.max(minimo, valor - 1))}
          disabled={valor <= minimo}
          aria-label={`Diminuir ${titulo}`}
        >
          −
        </button>

        <strong className="text-center" style={{ minWidth: '20px' }}>
          {valor}
        </strong>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => aoAlterar(valor + 1)}
          aria-label={`Aumentar ${titulo}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

function HomePageContent({ params, setParams }) {
  const filtros = useMemo(() => lerFiltros(params), [params])
  const [form, setForm] = useState(filtros)

  const [cidades, setCidades] = useState([])
  const [hoteis, setHoteis] = useState([])
  const [quartos, setQuartos] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')

  const [buscou, setBuscou] = useState(
    params.get('buscou') === 'true',
  )

  const hoje = hojeISO()
  const query = params.toString() ? `?${params.toString()}` : ''

  const quantidadeHospedes =
    form.adultos + form.criancas + form.bebes

  const quantidadeNoites = useMemo(() => {
    if (!form.checkin || !form.checkout) return 0

    const entrada = new Date(`${form.checkin}T12:00:00`)
    const saida = new Date(`${form.checkout}T12:00:00`)

    return Math.max(
      0,
      Math.round((saida - entrada) / (1000 * 60 * 60 * 24)),
    )
  }, [form.checkin, form.checkout])

  const chaveBusca = params.toString()

  useEffect(() => {
    let ativo = true

    async function carregarDados() {
      setCarregando(true)
      setErro('')

      try {
        const filtrosAtuais = Object.fromEntries(
          new URLSearchParams(chaveBusca),
        )

        const [respostaCidades, respostaHoteis, respostaQuartos] =
          await Promise.all([
            catalogoApi.cidades(),
            catalogoApi.buscar(filtrosAtuais),
            catalogoApi.quartos(),
          ])

        if (!ativo) return

        setCidades(extrairLista(respostaCidades))
        setHoteis(extrairLista(respostaHoteis))
        setQuartos(extrairLista(respostaQuartos))
      } catch (erroCarregamento) {
        if (!ativo) return

        setErro(
          erroCarregamento?.response?.data?.detail ||
          erroCarregamento?.message ||
          'Não foi possível carregar os hotéis. Tente novamente.',
        )
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [chaveBusca])

  function alterarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function pesquisar(evento) {
    evento.preventDefault()
    setErroForm('')

    if (form.checkin && !form.checkout) {
      setErroForm('Informe a data de saída.')
      return
    }

    if (!form.checkin && form.checkout) {
      setErroForm('Informe a data de entrada.')
      return
    }

    if (form.checkin && form.checkin < hoje) {
      setErroForm('A data de entrada não pode ser anterior a hoje.')
      return
    }

    if (
      form.checkin &&
      form.checkout &&
      form.checkout <= form.checkin
    ) {
      setErroForm('A data de saída deve ser posterior à entrada.')
      return
    }

    const novosParametros = new URLSearchParams()

    Object.entries(form).forEach(([chave, valor]) => {
      if (valor !== '' && valor !== null && valor !== undefined) {
        novosParametros.set(chave, String(valor))
      }
    })

    novosParametros.set('buscou', 'true')

    setParams(novosParametros)
    setBuscou(true)
  }

  function limparFiltros() {
    const filtrosLimpos = {
      cidade: '',
      checkin: '',
      checkout: '',
      adultos: 2,
      criancas: 0,
      bebes: 0,
      estrelas: '',
    }

    setForm(filtrosLimpos)
    setErroForm('')
    setBuscou(false)
    setParams({})
  }

  const hoteisFiltrados = useMemo(() => {
    return hoteis.filter((hotel) => {
      const cidadeSelecionada = !form.cidade ||
        String(hotel?.cidade_id || hotel?.cidade?.id || '') ===
          String(form.cidade)

      const categoriaSelecionada = !form.estrelas ||
        quantidadeEstrelas(hotel) === numero(form.estrelas)

      return cidadeSelecionada && categoriaSelecionada
    })
  }, [hoteis, form.cidade, form.estrelas])

  return (
    <main>
      <section className="bg-primary text-white py-5">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-light text-primary mb-3">
                Sua próxima viagem começa aqui
              </span>

              <h1 className="display-5 fw-bold mb-3">
                Encontre o hotel ideal para sua viagem
              </h1>

              <p className="lead mb-0">
                Compare opções de hospedagem, escolha seu destino
                e encontre o espaço ideal para aproveitar sua estadia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container position-relative" style={{ marginTop: '-30px' }}>
        <div className="card border-0 shadow p-3 p-md-4">
          <form onSubmit={pesquisar}>
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-4">
                <label htmlFor="cidade" className="form-label fw-semibold">
                  Destino
                </label>

                <select
                  id="cidade"
                  className="form-select"
                  value={form.cidade}
                  onChange={(event) =>
                    alterarCampo('cidade', event.target.value)
                  }
                >
                  <option value="">Todas as cidades</option>

                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                      {cidade.estado ? ` - ${cidade.estado}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-2">
                <label htmlFor="checkin" className="form-label fw-semibold">
                  Entrada
                </label>

                <input
                  id="checkin"
                  type="date"
                  className="form-control"
                  min={hoje}
                  value={form.checkin}
                  onChange={(event) => {
                    const valor = event.target.value

                    setForm((atual) => ({
                      ...atual,
                      checkin: valor,
                      checkout:
                        atual.checkout && atual.checkout <= valor
                          ? adicionarDias(valor, 1)
                          : atual.checkout,
                    }))
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-2">
                <label htmlFor="checkout" className="form-label fw-semibold">
                  Saída
                </label>

                <input
                  id="checkout"
                  type="date"
                  className="form-control"
                  min={
                    form.checkin
                      ? adicionarDias(form.checkin, 1)
                      : hoje
                  }
                  value={form.checkout}
                  onChange={(event) =>
                    alterarCampo('checkout', event.target.value)
                  }
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Hóspedes
                </label>

                <div className="border rounded px-3">
                  <Contador
                    titulo="Adultos"
                    descricao="A partir de 13 anos"
                    valor={form.adultos}
                    minimo={1}
                    aoAlterar={(valor) => alterarCampo('adultos', valor)}
                  />

                  <div className="border-top">
                    <Contador
                      titulo="Crianças"
                      descricao="De 2 a 12 anos"
                      valor={form.criancas}
                      minimo={0}
                      aoAlterar={(valor) => alterarCampo('criancas', valor)}
                    />
                  </div>

                  <div className="border-top">
                    <Contador
                      titulo="Bebês"
                      descricao="Até 1 ano"
                      valor={form.bebes}
                      minimo={0}
                      aoAlterar={(valor) => alterarCampo('bebes', valor)}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <label htmlFor="estrelas" className="form-label fw-semibold">
                  Categoria do hotel
                </label>

                <select
                  id="estrelas"
                  className="form-select"
                  value={form.estrelas}
                  onChange={(event) =>
                    alterarCampo('estrelas', event.target.value)
                  }
                >
                  <option value="">Todas as categorias</option>
                  <option value="1">1 estrela</option>
                  <option value="2">2 estrelas</option>
                  <option value="3">3 estrelas</option>
                  <option value="4">4 estrelas</option>
                  <option value="5">5 estrelas</option>
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-8 d-flex align-items-end gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                >
                  Buscar hotéis
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={limparFiltros}
                >
                  Limpar
                </button>
              </div>
            </div>

            {erroForm && (
              <div className="alert alert-warning mt-3 mb-0" role="alert">
                {erroForm}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">
              Hospedagens disponíveis
            </h2>

            <p className="text-secondary mb-0">
              {buscou
                ? 'Confira os resultados encontrados para sua pesquisa.'
                : 'Explore nossas opções de hospedagem e escolha seu próximo destino.'}
            </p>
          </div>

          {!carregando && (
            <span className="badge bg-light text-dark border fs-6">
              {hoteisFiltrados.length}{' '}
              {hoteisFiltrados.length === 1 ? 'hotel' : 'hotéis'}
            </span>
          )}
        </div>

        {quantidadeNoites > 0 && (
          <p className="text-secondary mb-3">
            <strong>{quantidadeNoites}</strong>{' '}
            {quantidadeNoites === 1 ? 'noite' : 'noites'} de hospedagem
            para <strong>{quantidadeHospedes}</strong>{' '}
            {quantidadeHospedes === 1 ? 'hóspede' : 'hóspedes'}.
          </p>
        )}

        {erro && (
          <div className="alert alert-danger" role="alert">
            <strong>Não foi possível carregar os resultados.</strong>
            <p className="mb-2">{erro}</p>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => setParams(new URLSearchParams(chaveBusca))}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {carregando ? (
          <div className="row g-4">
            {[1, 2, 3].map((item) => (
              <div className="col-12 col-md-6 col-lg-4" key={item}>
                <div className="card border-0 shadow-sm h-100">
                  <div
                    className="placeholder-glow"
                    style={{ height: '190px', background: '#e9ecef' }}
                  />
                  <div className="card-body">
                    <span className="placeholder col-8 mb-3" />
                    <span className="placeholder col-5 mb-3" />
                    <span className="placeholder col-12 mb-3" />
                    <span className="placeholder col-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !erro && hoteisFiltrados.length > 0 ? (
          <div className="row g-4">
            {hoteisFiltrados.map((hotel) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={hotel.id}
              >
                <HotelCard
                  hotel={hotel}
                  quartos={quartos}
                  query={query}
                />
              </div>
            ))}
          </div>
        ) : !erro ? (
          <div className="text-center py-5 px-3 border rounded bg-light">
            <div className="display-4 mb-3" aria-hidden="true">
              🏨
            </div>

            <h3 className="h5 fw-bold">
              Nenhum hotel encontrado
            </h3>

            <p className="text-secondary mb-3">
              Não encontramos hospedagens com os filtros selecionados.
              Experimente alterar o destino ou a categoria do hotel.
            </p>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default function HomePage() {
  const [params, setParams] = useSearchParams()

  return (
    <HomePageContent
      key={params.toString()}
      params={params}
      setParams={setParams}
    />
  )
}
