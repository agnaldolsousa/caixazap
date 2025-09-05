// src/app/(site)/page.tsx

'use client';

import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Imagem de fundo mais em destaque */}
      <Image
        src="/images/hero-mobile.jpg"
        alt="Fundo CaixaZap"
        fill
        priority
        className="object-cover object-center brightness-90 -z-10"
      />

      {/* Overlay azul mais leve */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-blue-400/20 -z-10" />

      {/* Caixa centralizada */}
      <section className="relative z-10 flex items-center justify-center min-h-screen px-6 text-center">
        <div className="bg-white/90 rounded-xl shadow-lg p-8 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Controle seu caixa direto pelo WhatsApp.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            O <strong>Caixazap</strong> facilita a gestão do seu dinheiro, registra entradas e saídas, e envia alertas — tudo sem precisar de planilhas ou apps complicados.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md">
            Começar agora
          </button>
        </div>
      </section>
    </main>
  );
}
