const ESTILOS = {
  Pendente: 'text-bg-warning',
  Confirmada: 'text-bg-success',
  Cancelada: 'text-bg-danger',
}

export default function StatusBadge({ status }) {
  return <span className={`badge status-badge ${ESTILOS[status] || 'text-bg-secondary'}`}>{status}</span>
}
