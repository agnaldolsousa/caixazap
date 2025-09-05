import Image from "next/image";

export default function ContatoPage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-blue-500/20"></div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white/95 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center drop-shadow-sm">
  Entre em Contato
</h1>

        <form className="space-y-4">
          <input
  type="text"
  placeholder="Seu nome"
  className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
/>

<input
  type="email"
  placeholder="Seu e-mail"
  className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
/>

<input
  type="text"
  placeholder="WhatsApp com DDD"
  className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
/>

<textarea
  placeholder="Sua mensagem"
  className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
  rows={4}
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
