'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from './AuthProvider';

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** Botón de login/logout para el encabezado, con su ventana de ingreso. */
export function AuthButton() {
  const { admin, login, logout } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const label = admin ? 'Cerrar sesión' : 'Iniciar sesión';

  function open() {
    setError('');
    dialog.current?.showModal();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    const err = await login(String(data.get('username') ?? ''), String(data.get('password') ?? ''));
    setBusy(false);
    if (err) {
      setError(err);
      const pass = form.elements.namedItem('password');
      if (pass instanceof HTMLInputElement) pass.value = '';
      return;
    }
    form.reset();
    dialog.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className={`auth-btn${admin ? ' on' : ''}`}
        aria-label={label}
        title={label}
        onClick={() => (admin ? logout() : open())}
      >
        <LockIcon />
        <span>{admin ? 'Cerrar sesión' : 'Ingresar'}</span>
      </button>

      <dialog ref={dialog} id="login-dialog" aria-labelledby="login-title">
        <form id="login-form" onSubmit={onSubmit} autoComplete="on">
          <h2 id="login-title">Iniciar sesión</h2>
          <label>
            Usuario
            <input name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <p id="login-error" role="alert">
            {error}
          </p>
          <div className="login-actions">
            <button type="button" className="dlg-btn" onClick={() => dialog.current?.close()}>
              Cancelar
            </button>
            <button type="submit" className="dlg-btn primary" disabled={busy}>
              {busy ? 'Ingresando…' : 'Ingresar'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
