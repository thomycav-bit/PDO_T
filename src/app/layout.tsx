import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { isAdmin } from '@/lib/auth';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Torneo de Pádel',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
  themeColor: '#0F1013',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="es" className={montserrat.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider initialAdmin={admin}>{children}</AuthProvider>
      </body>
    </html>
  );
}
