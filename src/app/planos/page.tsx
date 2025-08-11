'use client';

import Image from 'next/image';

export default function Planos() {
  const planos = [
    {
      nome: 'Básico',
      preco: 'R$ 29/mês',
      descricao: 'Ideal para pequenos negócios',
      beneficios: [
        'Controle básico de caixa',
        'Exportação simples de relatórios',
        'Suporte via e-mail'
      ]
    },
    {
      nome: 'Pro',
      preco: 'R$ 59/mês',
      descricao: 'Recursos avançados e relatórios',
      beneficios: [
        'Tudo do Básico',
        'Relatórios avançados e gráficos',
        'Suporte via WhatsApp'
      ]
    },
    {
      nome: 'Premium',
      preco: 'R$ 99/mês',
      descricao: 'Tudo incluso + suporte VIP',
      beneficios: [
        'Tudo do Pro',
        'Consultoria personalizada',
        'Suporte VIP 24h'
      ]
    }
  ];

  return (
    <div className="relative min-h-screen px-6 py-10 flex items-center justify-center">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-mobile1.jpg"
          alt="Planos CaixaZap"
          fill
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-8npm run devue-700/40"></div>
      </div>

      {/* Conteúdo */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {planos.map((plano, index) => (
          <div
            key={index}
            className="bg-white/90 rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{plano.nome}</h2>
            <p className="text-lg font-semibold text-blue-700 mb-4">{plano.preco}</p>
            <p className="text-gray-600 mb-4">{plano.descricao}</p>
            <ul className="text-gray-700 mb-6 list-disc pl-5 space-y-1">
              {plano.beneficios.map((beneficio, i) => (
                <li key={i}>{beneficio}</li>
              ))}
            </ul>
            <a
              href="#"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Assinar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
