export default function Planos() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-400 p-6">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-10">Nossos Planos</h1>
        <div className="flex flex-col lg:flex-row justify-center gap-8">

          {/* Plano Grátis */}
          <div className="bg-white rounded-xl shadow-lg p-8 w-[400px]">
            <h2 className="text-2xl font-bold text-gray-800">Grátis</h2>
            <p className="text-base text-gray-600 mt-1">Ideal para começar</p>
            <p className="text-3xl font-bold mt-4 text-gray-800">R$ 0/mês</p>
            <button className="bg-blue-700 text-white mt-6 px-8 py-3 rounded hover:bg-blue-800 font-semibold">
              Escolher
            </button>
          </div>

          {/* Plano Pro */}
          <div className="bg-white rounded-xl shadow-lg p-8 w-[400px]">
            <h2 className="text-2xl font-bold text-gray-800">Pro</h2>
            <p className="text-base text-gray-600 mt-1">Mais recursos e suporte</p>
            <p className="text-3xl font-bold mt-4 text-gray-800">R$ 29/mês</p>
            <button className="bg-blue-700 text-white mt-6 px-8 py-3 rounded hover:bg-blue-800 font-semibold">
              Escolher
            </button>
          </div>

          {/* Plano Empresa */}
          <div className="bg-white rounded-xl shadow-lg p-8 w-[400px]">
            <h2 className="text-2xl font-bold text-gray-800">Empresa</h2>
            <p className="text-base text-gray-600 mt-1">Soluções personalizadas</p>
            <p className="text-3xl font-bold mt-4 text-gray-800">Sob consulta</p>
            <button className="bg-blue-700 text-white mt-6 px-8 py-3 rounded hover:bg-blue-800 font-semibold">
              Falar com vendas
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
