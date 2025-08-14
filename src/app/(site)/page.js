"use client";

export default function Home() {
  return (
    <main
      className="relative flex items-center justify-center min-h-screen px-6 py-10"
      style={{
        backgroundImage: "url('/images/grafico1.png.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay ajustado para não deixar muito azul */}
<div className="absolute inset-0 bg-black70"></div>


      {/* Card central menor e mais destacado */}
      <div className="relative z-10 bg-white/95 p-8 rounded-xl shadow-2xl max-w-lg text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
          Controle seu caixa direto pelo WhatsApp.
        </h1>
        <p className="text-lg mb-6 text-gray-700">
          O <strong>Caixazap</strong> facilita a gestão do seu dinheiro,
          registra entradas e saídas, e envia alertas — tudo sem precisar
          de planilhas ou apps complicados.
        </p>
        <button
          onClick={() => (window.location.href = "/planos")}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all text-lg font-semibold"
        >
          Começar agora
        </button>
      </div>
    </main>
  );
}
