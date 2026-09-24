export default function ErrorAlert({ error, onRetry, className = '' }) {
  if (!error) return null
  const msg = typeof error === 'string' ? error : error.message
  return (
    <div className={`alert alert-danger d-flex flex-wrap align-items-center gap-2 ${className}`} role="alert">
      <span className="flex-grow-1">{msg}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
