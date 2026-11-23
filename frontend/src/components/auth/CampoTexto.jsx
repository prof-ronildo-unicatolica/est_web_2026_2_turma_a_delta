export default function CampoTexto({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  erro,
  tocado,
  extra = {},
}) {
  const classeValidacao = erro ? 'is-invalid' : tocado ? 'is-valid' : ''

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        type={type}
        className={`form-control ${classeValidacao}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-describedby={`${id}-erro`}
        {...extra}
      />
      <div id={`${id}-erro`} className="invalid-feedback">{erro}</div>
    </div>
  )
}
