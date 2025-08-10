export default function Contato() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <form className="bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl w-[600px]">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Entre em Contato</h1>

        <input
          type="text"
          placeholder="Seu nome"
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <input
          type="email"
          placeholder="Seu e-mail"
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <input
          type="text"
          placeholder="WhatsApp com DDD"
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-4 rounded text-lg font-semibold hover:bg-blue-800 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
