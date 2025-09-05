// src/app/components/Navbar.tsx

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-b from-blue-900 to-blue-700 text-white fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16 md:h-20">
        <h1 className="text-xl font-bold">CaixaZap</h1>
        <div className="space-x-6 text-sm md:text-base">
          <a href="/login" className="hover:underline">Início</a>
          <a href="/planos" className="hover:underline">Planos</a>
          <a href="/contato" className="hover:underline">Contato</a>
        </div>
      </div>
    </nav>
  );
}
