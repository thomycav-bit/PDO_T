/** Cancha de pádel vista desde arriba (vertical), usada en las tarjetas de categoría. */
export function CourtIcon() {
  return (
    <svg className="court" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="10" y="10" width="80" height="140" />
      <line className="net" x1="10" y1="80" x2="90" y2="80" />
      <line x1="10" y1="31.4" x2="90" y2="31.4" />
      <line x1="10" y1="128.6" x2="90" y2="128.6" />
      <line x1="50" y1="31.4" x2="50" y2="128.6" />
    </svg>
  );
}
