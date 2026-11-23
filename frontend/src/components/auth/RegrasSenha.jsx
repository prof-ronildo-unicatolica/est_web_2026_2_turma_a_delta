export default function RegrasSenha({ regras }) {
  return (
    <ul className="list-unstyled small password-rules mb-3" aria-label="Requisitos da senha">
      {regras.map((regra) => (
        <li key={regra.texto} className={regra.ok ? 'text-success' : 'text-secondary'}>
          <span aria-hidden="true">{regra.ok ? '✓' : '○'}</span> {regra.texto}
        </li>
      ))}
    </ul>
  )
}
