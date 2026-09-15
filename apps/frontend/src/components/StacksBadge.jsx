const ESTILOS_POR_STATUS = {
  Pendente: 'bg-warning text-dark',
  Confirmada: 'bg-success',
  Cancelada: 'bg-danger',
  Concluída: 'bg-secondary',
}

export default function StatusBadge({ status }) {
  const classe = ESTILOS_POR_STATUS[status] || 'bg-secondary'
  return <span className={`badge ${classe}`}>{status}</span>
}
