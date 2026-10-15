'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthButton } from './AuthButton';

/** Encabezado de las páginas de Grupos y Cruces. */
export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div className="titles">
        <Link className="back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </Link>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        {actions}
        <AuthButton />
      </div>
    </header>
  );
}
