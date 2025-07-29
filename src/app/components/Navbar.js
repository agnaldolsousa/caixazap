"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Caixazap</h1>
        <ul className="flex space-x-6 text-sm font-medium">
          <li>
            <Link href="/" className="hover:underline">Início</Link>
          </li>
          <li>
            <Link href="/planos" className="hover:underline">Planos</Link>
          </li>
          <li>
            <Link href="/contato" className="hover:underline">Contato</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
