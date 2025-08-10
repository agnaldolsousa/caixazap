"use client";

export default function Contato() {
  return (
    <section className="app-bg py-16 px-4">
      <div className="max-w-lg mx-auto app-card">
        <h2 className="app-title">Entre em Contato</h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            className="app-input"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            className="app-input"
          />
          <textarea
            placeholder="Sua mensagem"
            className="app-input h-32 resize-none"
          ></textarea>
          <button type="submit" className="app-btn w-full">
            Enviar Mensagem
          </button>
        </form>
      </div>
    </section>
  );
}
