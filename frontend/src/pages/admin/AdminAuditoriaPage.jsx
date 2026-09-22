import { useEffect, useState } from 'react'
import { listarAuditoria } from '../../services/adminService'

export default function AdminAuditoriaPage() {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarAuditoria().then((dados) => {
      setEventos(dados)
      setCarregando(false)
    })
  }, [])

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-1">Trilha de Auditoria</h5>
        <p className="text-muted small mb-3">
          Eventos registrados no MongoDB pelo worker de auditoria (somente leitura).
        </p>

        {carregando ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Usuário</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((ev) => (
                  <tr key={ev.id}>
                    <td className="text-nowrap small">{new Date(ev.data).toLocaleString('pt-BR')}</td>
                    <td><span className="badge bg-light text-dark border">{ev.acao}</span></td>
                    <td>{ev.entidade}</td>
                    <td className="small">{ev.usuario}</td>
                    <td className="small">{ev.detalhe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
