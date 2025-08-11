'use client';
import Image from "next/image";
import React from "react";

export default function ContatoPage() {
  async function enviarContato(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      nome: String(data.get('nome') || ''),
      email: String(data.get('email') || ''),
      whatsapp: String(data.get('whatsapp') || ''),
      mensagem: String(data.get('mensagem') || ''),
    };

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha no envio');
      alert('Mensagem enviada! Já já eu retorno 😉');
      form.reset();
    } catch (err) {
      console.error(err);
      alert('Não consegui enviar agora. Tente novamente em instantes.');
    }
  }

  return (
    <div className="relative min-h-screen px-6 py-10 flex items-center justify-center">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-mobile.jpg"
          alt="Fundo Contato CaixaZap"
          fill
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-blue-500/30"></div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white/95 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center drop-shadow-sm">
          Entre em Contato
        </h1>

        <form className="space-y-4" onSubmit={enviarContato}>
          <input
            name="nome"
            type="text"
            placeholder="Seu nome"
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Seu e-mail"
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
            required
          />

          <input
            name="whatsapp"
            type="tel"
            placeholder="WhatsApp com DDD"
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
          />

          <textarea
            name="mensagem"
            placeholder="Sua mensagem"
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
            rows={4}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
