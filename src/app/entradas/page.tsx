'use client'

import { useState } from 'react'

export default function NovaEntrada() {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [forma, setForma] = useState('')
  const [data, setData] = useState('')

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <form className="bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl w-[600px]">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Nova Entrada</h1>

        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <input
          type="text"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <select
          value={forma}
          onChange={(e) => setForma(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        >
          <option value="">Selecione uma forma</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="cartao">Cartão</option>
          <option value="pix">PIX</option>
        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded text-lg font-semibold hover:opacity-90 transition"
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
