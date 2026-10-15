'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextValue = {
  admin: boolean;
  /** Devuelve null si salió bien, o el mensaje de error. */
  login: (user: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /** Para cuando el servidor responde 401 (la sesión venció). */
  expire: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export function AuthProvider({ initialAdmin, children }: { initialAdmin: boolean; children: ReactNode }) {
  const [admin, setAdmin] = useState(initialAdmin);
  const router = useRouter();

  const login = useCallback(
    async (user: string, password: string) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, password }),
        });
        if (res.ok) {
          setAdmin(true);
          router.refresh();
          return null;
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        return data.error ?? 'No se pudo iniciar sesión.';
      } catch {
        return 'No se pudo conectar con el servidor.';
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAdmin(false);
    router.refresh();
  }, [router]);

  const expire = useCallback(() => {
    setAdmin(false);
    router.refresh();
  }, [router]);

  return <AuthContext.Provider value={{ admin, login, logout, expire }}>{children}</AuthContext.Provider>;
}
