export default function Stars({ value = 0, size = '' }) {
  const n = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <span className={`stars ${size}`} role="img" aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}>
      {'★'.repeat(n)}
      <span className="stars-off">{'★'.repeat(5 - n)}</span>
    </span>
  )
}
