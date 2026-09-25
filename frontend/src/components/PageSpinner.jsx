export default function PageSpinner({ label = 'Carregando...' }) {
  return (
    <div className="text-center py-5 my-5" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true"></div>
      <p className="mt-3 text-secondary mb-0">{label}</p>
    </div>
  )
}
