// src/app/(site)/page.js
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* bloco central com largura limitada (igual em qualquer tela/Vercel) */}
      <section className="mx-auto w-full max-w-6xl px-4 md:px-6 py-10">
        {/* área do hero: imagem ocupando o bloco e card sobreposto */}
        <div className="relative min-h-[520px] rounded-2xl shadow-xl overflow-hidden">
          {/* imagem cobre o bloco, sem esticar, com cantos arredondados */}
          <Image
            src="/images/hero-mobile1.jpg"   // ← sua imagem
            alt="Fundo CaixaZap"
            fill
            priority
            className="object-cover"
          />

          {/* card central por cima da imagem */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white/90 backdrop-blur rounded-2xl p-6 shadow-2xl">
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
        </div>
      </section>
    </main>
  );
}
