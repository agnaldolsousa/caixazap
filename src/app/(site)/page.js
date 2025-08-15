// src/app/(site)/page.js
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* HERO full-screen: fundo cobre toda a largura e altura visível (desconta a navbar) */}
      <section
        className="relative w-full bg-cover bg-center
                   min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]"
        style={{ backgroundImage: "url('/images/hero-mobile1.jpg')" }} // ⬅️ troque pelo arquivo certo
      >
        {/* máscara leve para dar contraste ao card */}
        <div className="absolute inset-0 bg-black/10" />

        {/* conteúdo centralizado sobre a imagem */}
        <div className="relative flex items-center justify-center
                        min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]
                        px-4 md:px-6">
          <div className="max-w-2xl rounded-2xl bg-white/90 backdrop-blur p-6 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">
              Controle seu caixa <br /> direto pelo WhatsApp.
            </h1>
            <p className="mt-3 text-center text-gray-700">
              O <strong>Caixazap</strong> facilita a gestão do seu dinheiro, registra
              entradas e saídas, e envia alertas — tudo sem precisar de planilhas
              ou apps complicados.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
              >
                Começar agora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
