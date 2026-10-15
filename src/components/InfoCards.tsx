const FACTS = [
  { label: 'Ubicación', value: 'Punto de Oro - Padel Club' },
  { label: 'Inscripción', value: 'Hasta 4 de Octubre' },
  { label: 'Premio total', value: '$2.000.000', prize: true },
  { label: 'Fecha', value: 'Primera 05, 06, 07 y 08 de Noviembre' },
];

export function InfoCards() {
  return (
    <div className="info">
      <dl className="facts">
        {FACTS.map((f) => (
          <div key={f.label} className={`fact${f.prize ? ' prize' : ''}`}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rules">
        <div className="rules-block">
          <h3>Información general</h3>
          <p>
            <strong>Pelotas:</strong> Sixty
          </p>
        </div>
        <div className="rules-block">
          <h3>Estructura del torneo</h3>
          <h4>Formato de partidos</h4>
          <p>
            Se disputan <strong>al mejor de 3 sets</strong>. En caso de igualdad 1-1, se define con un{' '}
            <strong>Super Tiebreak</strong> (11 puntos).
          </p>
          <h4>A partir de semifinales</h4>
          <p>
            Los partidos se juegan completos (3 sets). El tercer set podrá disputarse como <strong>Super Tiebreak</strong>{' '}
            solo si ambas parejas están de acuerdo. En caso de desacuerdo, se realizará un <strong>sorteo</strong>, y el
            ganador decidirá el formato del tercer set.
          </p>
        </div>
      </div>
    </div>
  );
}
