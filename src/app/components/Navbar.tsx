'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-800 to-blue-400 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">CaixaZap</Link>

        {/* Links */}
        <div className="flex space-x-8">
          <Link href="/" className="hover:underline text-lg md:text-xl">Início</Link>
          <Link href="/planos" className="hover:underline text-lg md:text-xl">Planos</Link>
          <Link href="/contato" className="hover:underline text-lg md:text-xl">Contato</Link>
        </div>
      </div>
    </nav>
  );
}
