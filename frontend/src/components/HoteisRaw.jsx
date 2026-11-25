import { useCallback, useEffect, useState } from 'react'

const API = '/api/v1'

async function buscarJson(endpoint, signal) {
  const resposta = await fetch(`${API}${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!resposta.ok) {
    throw new Error(`GET ${endpoint} devolveu HTTP ${resposta.status}`)
  }

  return resposta.json()
}

export default function HoteisRaw() {
  const [dados, setDados] = useState({ cidades: null, hoteis: null })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [tentativa, setTentativa] = useState(0)

  const carregar = useCallback(async (signal) => {
    setCarregando(true)
    setErro('')

    try {
      // As duas consultas não dependem uma da outra: executam em paralelo.
      const [cidades, hoteis] = await Promise.all([
        buscarJson('/cidades', signal),
        buscarJson('/hoteis', signal),
      ])

      setDados({ cidades, hoteis })
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErro(error.message || 'Não foi possível carregar os dados da API.')
      }
    } finally {
      if (!signal.aborted) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    carregar(controller.signal)
    return () => controller.abort()
  }, [carregar, tentativa])

  return (
    <section className="container py-5" aria-labelledby="hoteis-raw-titulo">
      <div className="mb-3">
        <h2 id="hoteis-raw-titulo" className="h3 fw-bold">
          Conferência dos dados da API
        </h2>
        <p className="text-secondary mb-0">
          Resposta JSON original do backend. Os objetos são exibidos sem formatação
          de cartão ou remoção de propriedades, para permitir a conferência das camadas.
        </p>
      </div>

      {carregando && (
        <p role="status" className="alert alert-info">
          Carregando cidades e hotéis da API...
        </p>
      )}

      {!carregando && erro && (
        <div className="alert alert-danger" role="alert">
          <strong>Erro ao consultar a API:</strong> {erro}
          <p className="mb-2 mt-2">
            Verifique se o backend está ativo e se os endpoints
            {' '}/api/v1/cidades e /api/v1/hoteis estão disponíveis.
          </p>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && (
        <div className="d-grid gap-4">
          <div>
            <h3 className="h5">GET {API}/cidades</h3>
            <pre className="border rounded bg-light text-dark p-3 mb-0 raw-json">
              {JSON.stringify(dados.cidades, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="h5">GET {API}/hoteis</h3>
            <pre className="border rounded bg-light text-dark p-3 mb-0 raw-json">
              {JSON.stringify(dados.hoteis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  )
}
