// src/components/Navbar.tsx
'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold text-xl">CaixaZap</Link>

        <div className="flex items-center gap-6 text-white">
          {/* Início deve ir para /login na página de vendas */}
          <Link href="/login" className="hover:opacity-90">Início</Link>
          <Link href="/planos" className="hover:opacity-90">Planos</Link>
          <Link href="/contato" className="hover:opacity-90">Contato</Link>
        </div>
      </div>
    </nav>
  );
}
