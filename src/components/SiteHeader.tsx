'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { AuthButton } from './AuthButton';

type MenuId = 'grupos' | 'cruces';

function NavMenu({
  id,
  label,
  open,
  onToggle,
  onNavigate,
}: {
  id: MenuId;
  label: string;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className={`nav-item${open ? ' open' : ''}`}>
      <button type="button" className="dropdown-toggle" aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}>
        <span>{label}</span>
        <svg className="arrow" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="dropdown-panel" id={`${id}-panel`}>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/${id}/${c.slug}`} onClick={onNavigate}>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState<MenuId | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onPointer = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav-item')) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggle = (id: MenuId) => setOpen((cur) => (cur === id ? null : id));

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <nav aria-label="Navegación principal">
        <Link href="/#inicio">Inicio</Link>
        <Link href="/#informacion">Información</Link>
        <NavMenu id="grupos" label="Grupos" open={open === 'grupos'} onToggle={() => toggle('grupos')} onNavigate={() => setOpen(null)} />
        <NavMenu id="cruces" label="Cruces" open={open === 'cruces'} onToggle={() => toggle('cruces')} onNavigate={() => setOpen(null)} />
        <Link href="/#sponsors">Sponsors</Link>
        <AuthButton />
      </nav>
    </header>
  );
}
