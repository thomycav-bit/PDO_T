import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>No encontramos esa página</h1>
      <Link href="/" className="btn primary">
        Volver al inicio
      </Link>
    </main>
  );
}
