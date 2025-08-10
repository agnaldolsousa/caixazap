"use client";

export default function Planos() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-gray-900">
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/grafico2.png.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Camada escura por cima da imagem */}
        <div className="w-full h-full bg-black/30" />
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-10 z-10 text-white drop-shadow-md">
        Nossos Planos
      </h2>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-center z-10">
        {/* Plano 1 */}
        <div className="bg-white/90 border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition w-80 text-center">
          <h3 className="text-xl font-bold mb-2">Grátis</h3>
          <p className="mb-4">Ideal para começar</p>
          <p className="text-2xl font-semibold mb-4">R$ 0/mês</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Escolher
          </button>
        </div>

        {/* Plano 2 */}
        <div className="bg-white/90 border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition w-80 text-center">
          <h3 className="text-xl font-bold mb-2">Pro</h3>
          <p className="mb-4">Mais recursos e suporte</p>
          <p className="text-2xl font-semibold mb-4">R$ 29/mês</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Escolher
          </button>
        </div>

        {/* Plano 3 */}
        <div className="bg-white/90 border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition w-80 text-center">
          <h3 className="text-xl font-bold mb-2">Empresa</h3>
          <p className="mb-4">Soluções personalizadas</p>
          <p className="text-2xl font-semibold mb-4">Sob consulta</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Falar com vendas
          </button>
        </div>
      </div>
    </main>
  );
}
