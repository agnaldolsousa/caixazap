// Ajuste completo do layout e visual do módulo Despesas Fixas
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Despesa = {
  id: string
  nome: string
  valor: number
  vencimento: string
}

export default function DespesasFixasPage() {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState(dayjs().format('YYYY-MM-DD'))
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [mesFiltro, setMesFiltro] = useState(dayjs().format('YYYY-MM-DD'))

  const carregarDespesas = async () => {
    const inicio = dayjs(mesFiltro).startOf('month').format('YYYY-MM-DD')
    const fim = dayjs(mesFiltro).endOf('month').format('YYYY-MM-DD')

    const { data, error } = await supabase
      .from('despesas_fixas')
      .select('*')
      .gte('vencimento', inicio)
      .lte('vencimento', fim)

    if (!error && data) setDespesas(data as Despesa[])
  }

  const salvarDespesa = async () => {
    if (!nome || !valor) return

    const { error } = await supabase.from('despesas_fixas').insert({
      nome,
      valor: Number(valor),
      vencimento: dayjs(vencimento).startOf('day').toISOString(),
    })

    if (!error) {
      setNome('')
      setValor('')
      setVencimento(dayjs().format('YYYY-MM-DD'))
      carregarDespesas()
    }
  }

  const excluirDespesa = async (id: string) => {
    await supabase.from('despesas_fixas').delete().eq('id', id)
    carregarDespesas()
  }

  useEffect(() => {
    carregarDespesas()
  }, [mesFiltro])

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400">
      <h1 className="text-center text-white text-2xl font-bold mb-6">Módulo: Despesas Fixas</h1>

      <div className="flex flex-col md:flex-row justify-center gap-8">
        {/* Formulário de Cadastro */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md w-full md:w-[600px]">
          <input
            type="text"
            placeholder="Nome da Despesa"
            className="w-full p-4 mb-4 border border-gray-300 rounded text-lg text-gray-900"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor Mensal"
            className="w-full p-4 mb-4 border border-gray-300 rounded text-lg text-gray-900"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <input
            type="date"
            className="w-full p-4 mb-6 border border-gray-300 rounded text-lg text-gray-900"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />
          <button
            className="w-full bg-blue-800 text-white py-4 rounded text-lg font-semibold hover:bg-blue-700"
            onClick={salvarDespesa}
          >
            Salvar
          </button>
        </div>

        {/* Lista de Despesas */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md w-full md:w-[600px] max-h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Despesas Lançadas</h2>
            <input
              type="date"
              className="p-3 border border-gray-300 rounded text-lg text-gray-900"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
            />
          </div>

          {despesas.length === 0 ? (
            <p className="text-gray-600 text-base">Nenhuma despesa neste mês.</p>
          ) : (
            <ul className="space-y-2">
              {despesas.map((item) => (
                <li
                  key={item.id}
                  className="bg-white rounded p-4 shadow flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800 font-medium text-lg">{item.nome}</p>
                    <p className="text-gray-600 text-base">
                      R$ {item.valor.toFixed(2)} - {dayjs(item.vencimento).format('DD/MM/YYYY')}
                    </p>
                  </div>
                  <button
                    className="text-red-600 font-bold hover:underline"
                    onClick={() => excluirDespesa(item.id)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
