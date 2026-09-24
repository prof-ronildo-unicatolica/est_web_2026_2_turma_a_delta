/** Capa ilustrativa gerada a partir do nome do hotel (não há fotos no cadastro). */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export default function HotelCover({ nome = '', className = '' }) {
  const h = hash(nome)
  const hue = 170 + (h % 50) // faixa verde-azulada do mar
  const iniciais = nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
  return (
    <div
      className={`hotel-cover ${className}`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 55% 26%) 0%, hsl(${hue + 18} 50% 40%) 100%)` }}
      aria-hidden="true"
    >
      <span>{iniciais || 'H'}</span>
    </div>
  )
}
