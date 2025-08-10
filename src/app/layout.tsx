import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Projeto CaixaZap',
  description: 'Sistema de Gestão de Restaurantes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-400 text-white">
        <Navbar />
        {/* Espaço para a navbar fixa não cobrir o conteúdo */}
        <div className="h-16 md:h-20" />
        {children}
      </body>
    </html>
  );
}
