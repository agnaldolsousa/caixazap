'use client'

import Link from 'next/link'

const modulos = [
  { id: 1, nome: 'Despesas Fixas', link: '/modulos/despesas-fixas' },
  { id: 2, nome: 'Faturamento Mensal', link: '/modulos/faturamento-mensal' },
  { id: 3, nome: 'DNA da Empresa', link: '/modulos/dna' },
  { id: 4, nome: 'Itens do Cardápio', link: '/modulos/itens-cardapio' },
  { id: 5, nome: 'Itens Manipulados (Receitas)', link: '/modulos/itens-manipulados' },
  { id: 6, nome: 'Cadastro de Insumos', link: '/modulos/insumos' },
  { id: 7, nome: 'Ficha Técnica Manipulação', link: '/modulos/ficha-manipulacao' },
  { id: 8, nome: 'Ficha Técnica', link: '/modulos/ficha-tecnica' },
  { id: 9, nome: 'Lucro Atual', link: '/modulos/lucro-atual' },
  { id: 10, nome: 'Preço de Venda (PV)', link: '/modulos/preco-venda' },
  { id: 11, nome: 'Combos', link: '/modulos/combos' },
  { id: 12, nome: 'Fechamento de Caixa', link: '/modulos/fechamento-caixa' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-400 p-8">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-gray-800 tracking-wide drop-shadow">
          MENU PRINCIPAL
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {modulos.map((modulo) => (
            <Link
              key={modulo.id}
              href={modulo.link}
              className="block text-white text-lg md:text-xl font-extrabold tracking-wide py-8 px-6 bg-blue-800 rounded-xl shadow-lg hover:bg-blue-600 hover:scale-105 transition-all text-center"

            >
              {modulo.id}. {modulo.nome}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
