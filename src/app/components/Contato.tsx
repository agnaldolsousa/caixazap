"use client";

export default function Contato() {
  return (
    <section className="py-16 px-4 bg-white text-gray-800 text-center">
      <h2 className="text-3xl font-bold mb-6">Entre em Contato</h2>
      <form className="max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Seu nome"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="email"
          placeholder="Seu e-mail"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="tel"
          placeholder="WhatsApp com DDD"
          className="w-full border rounded px-4 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
