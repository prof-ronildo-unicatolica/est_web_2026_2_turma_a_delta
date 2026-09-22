import { useEffect, useState } from 'react'
import ProfessorProfile from './ProfessorProfile'
import DisciplinasList from './DisciplinasList'
import StacksTable from './StacksTable'
import ImageAndCarousel from './ImageAndCarousel'
import VideoComponent from './VideoComponent'
import InteractiveExamples from './InteractiveExamples'
import { API_BASE_URL } from '../../services/api'

export default function PaginaSobre() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/sobre`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao se conectar com a API')
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <header className="mb-4 p-4 bg-white rounded shadow-sm">
        <h2 className="text-primary fw-bold mb-1">Sobre o Projeto</h2>
        <p className="text-secondary mb-0">
          Conteúdo original do boilerplate da disciplina — mantido aqui como referência das
          relações de dados (1:1, 1:N, N:M) e dos exemplos de tecnologias usadas.
        </p>
      </header>

      {loading && (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando dados da API...</span>
          </div>
          <p className="mt-3 text-secondary">Buscando informações do servidor backend...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger shadow-sm p-4" role="alert">
          <h4 className="alert-heading fw-bold">Erro de Conexão com o Backend!</h4>
          <p>
            Não foi possível obter os dados da API em <code>{API_BASE_URL}/sobre</code>.
          </p>
          <p className="mb-0">
            Verifique se o backend está rodando e se os bancos de dados foram inicializados com
            sucesso.
          </p>
          <hr />
          <p className="mb-0 small text-muted">Detalhe do erro: {error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          <ProfessorProfile professor={data.professor} />
          <DisciplinasList disciplinas={data.disciplinas} />
          <StacksTable stacks={data.stacks} />
          <ImageAndCarousel />
          <VideoComponent />
          <InteractiveExamples />
        </div>
      )}
    </div>
  )
}
