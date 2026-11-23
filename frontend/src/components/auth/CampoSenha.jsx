export default function CampoSenha({
  id,
  label,
  value,
  onChange,
  onBlur,
  erro,
  valido,
  autoComplete,
  visivel,
  alternarVisibilidade,
}) {
  const classeValidacao = erro ? 'is-invalid' : valido ? 'is-valid' : ''
  const acaoVisibilidade = visivel ? 'Ocultar' : 'Mostrar'

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          className={`form-control password-input ${classeValidacao}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-describedby={`${id}-erro`}
          autoCapitalize="none"
          spellCheck="false"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={alternarVisibilidade}
          aria-label={`${acaoVisibilidade} ${label.toLowerCase()}`}
          aria-pressed={visivel}
        >
          {acaoVisibilidade}
        </button>
      </div>
      <div id={`${id}-erro`} className="invalid-feedback d-block">
        {erro || ''}
      </div>
    </div>
  )
}
