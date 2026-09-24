/** Campo numérico com botões − / + (hóspedes). */
export default function Counter({ id, label, hint, value, min = 0, max = 10, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-group counter">
        <button
          type="button"
          className="btn btn-outline-secondary"
          aria-label={`Diminuir ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <input id={id} className="form-control text-center" value={value} readOnly aria-live="polite" />
        <button
          type="button"
          className="btn btn-outline-secondary"
          aria-label={`Aumentar ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
      {hint && <div className="form-text">{hint}</div>}
    </div>
  )
}
