// src/app/contato/page.tsx
export const metadata = {
  title: 'Contato — CaixaZap',
};

export default function Contato() {
  return (
    <div className="app-bg app-text min-h-screen pt-24 px-4 flex items-center justify-center">
      <form className="app-card w-full max-w-2xl p-8 md:p-10">
        <h1 className="app-title text-3xl md:text-4xl">Entre em Contato</h1>

        <input
          type="text"
          placeholder="Seu nome"
          className="app-input text-lg mb-6 md:mb-8"
        />

        <input
          type="email"
          placeholder="Seu e-mail"
          className="app-input text-lg mb-6 md:mb-8"
        />

        <input
          type="text"
          placeholder="WhatsApp com DDD"
          className="app-input text-lg mb-8"
        />

        <button
          type="submit"
          className="app-btn w-full py-3 md:py-4 text-lg"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
