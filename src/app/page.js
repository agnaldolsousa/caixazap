"use client";
import Planos from "./components/Planos";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-white text-gray-800">
      
      {/* Imagem ilustrativa no topo */}
      <img
        src="/images/grafico1.png.jpg"
        alt="Painel financeiro interativo"
        className="mb-8 w-full max-w-2xl rounded-2xl shadow-xl"
      />

      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Controle seu caixa direto pelo WhatsApp.
      </h1>
      <p className="text-lg md:text-xl mb-6 max-w-xl">
        O <strong>Caixazap</strong> facilita a gestão do seu dinheiro, registra entradas e saídas,
        e envia alertas — tudo sem precisar de planilhas ou apps complicados.
      </p>
      <button
        onClick={() => window.location.href = "/planos"}
        className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all"
      >
        Começar agora
      </button>

      {/* <Planos /> */}
    </main>
  );
}
