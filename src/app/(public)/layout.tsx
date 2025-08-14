import '../globals.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-400">
          {/* Navbar de marketing */}
          <nav className="flex items-center justify-between px-6 py-4 text-white">
            <div className="font-extrabold text-xl">CaixaZap</div>
            <div className="flex gap-6">
              <a href="/inicio"  className="hover:underline">Início</a>
              <a href="/planos"  className="hover:underline">Planos</a>
              <a href="/contato" className="hover:underline">Contato</a>
              <a href="/login"   className="hover:underline">Entrar</a>
            </div>
          </nav>
          <main className="px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
