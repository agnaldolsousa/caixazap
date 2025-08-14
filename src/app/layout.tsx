import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projeto CaixaZap',
  description: 'Sistema de Gestão de Restaurantes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-400 text-white">
        {children}
      </body>
    </html>
  );
}
