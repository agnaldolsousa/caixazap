'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Saida = {
  id: number;
  data: string;        // YYYY-MM-DD
  fornecedor: string;
  descricao: string;
  valor: number;
};

// Helpers
function getCurrentMonthYYYYMM() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}`; // ex: 2025-08
}
function monthRange(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const next = new Date(y, m, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  return { start: fmt(start), endExclusive: fmt(next) };
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function SaidasPage() {
  // FORM
  const [data, setData] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  // LISTA
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [loading, setLoading] = useState(false);

  // FILTROS
  // 1) Mês (YYYY-MM) — usa <input type="month" />
  const [filterMonth, setFilterMonth] = useState<string>(getCurrentMonthYYYYMM());
  // 2) Período (prioridade quando ambos preenchidos)
  const [rangeStart, setRangeStart] = useState<string>(''); // YYYY-MM-DD
  const [rangeEnd, setRangeEnd] = useState<string>('');     // YYYY-MM-DD

  const totalPeriodo = useMemo(
    () => saidas.reduce((acc, s) => acc + (Number(s.valor) || 0), 0),
    [saidas]
  );

  async function fetchSaidas() {
    setLoading(true);
    try {
      let query = supabase.from('saida').select('*');

      if (rangeStart && rangeEnd) {
        const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
        const end = rangeEnd >= rangeStart ? rangeEnd : rangeStart;
        query = query.gte('data', start).lte('data', end);
      } else if (filterMonth && filterMonth.trim() !== '') {
        const { start, endExclusive } = monthRange(filterMonth);
        query = query.gte('data', start).lt('data', endExclusive);
      }

      const { data, error } = await query.order('data', { ascending: false });
      if (error) {
        console.error(error);
        alert('Erro ao buscar saídas: ' + error.message);
        return;
      }
      setSaidas((data || []) as Saida[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSaidas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, rangeStart, rangeEnd]);

  // SALVAR
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valorNumber = parseFloat(String(valor).replace(',', '.'));
    if (Number.isNaN(valorNumber)) {
      alert('Informe um valor numérico válido.');
      return;
    }

    const { data: inserted, error } = await supabase
      .from('saida')
      .insert([{ data, fornecedor, descricao, valor: valorNumber }])
      .select();

    if (error) {
      alert('Erro ao salvar: ' + error.message);
      return;
    }

    if (inserted && inserted.length > 0) {
      const novo = inserted[0] as Saida;

      // Se está em período: valida no período; senão, valida no mês selecionado
      let pertence = true;
      if (rangeStart && rangeEnd) {
        const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
        const end = rangeEnd >= rangeStart ? rangeEnd : rangeStart;
        pertence = novo.data >= start && novo.data <= end;
      } else if (filterMonth && filterMonth.trim() !== '') {
        const { start, endExclusive } = monthRange(filterMonth);
        pertence = novo.data >= start && novo.data < endExclusive;
      }

      if (pertence) setSaidas((prev) => [novo, ...prev]);
    }

    // Limpa form
    setData('');
    setFornecedor('');
    setDescricao('');
    setValor('');
  }

  // EXCLUIR
  async function handleDelete(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir este registro?');
    if (!confirmar) return;

    const { error } = await supabase.from('saida').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }
    setSaidas((prev) => prev.filter((s) => s.id !== id));
  }

  function clearPeriod() {
    setRangeStart('');
    setRangeEnd('');
  }
  function goToCurrentMonth() {
    setFilterMonth(getCurrentMonthYYYYMM());
    clearPeriod();
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400 text-white">
      <h1 className="text-2xl font-bold text-center mb-6">Módulo: Saídas</h1>

      <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto">
        {/* FORMULÁRIO (esquerda) */}
        <form
          onSubmit={handleSubmit}
          className="bg-white text-black p-6 rounded-lg shadow-md flex-1"
        >
          <div className="grid grid-cols-1 gap-3">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Fornecedor"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
            >
              Salvar
            </button>
          </div>
        </form>

        {/* LISTAGEM + FILTROS (direita) */}
        <div className="bg-white text-black p-6 rounded-lg shadow-md flex-1 flex flex-col">
          {/* FILTROS */}
          <div className="space-y-3 mb-4">
            {/* Filtro por MÊS (apenas mês) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="filtroMes" className="font-medium">
                  Filtrar por Mês:
                </label>
                <input
                  id="filtroMes"
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="p-2 border rounded"
                  disabled={!!(rangeStart && rangeEnd)} // desabilita se período ativo
                />
              </div>
              <button
                onClick={goToCurrentMonth}
                className="text-sm px-3 py-2 rounded border hover:bg-gray-100"
                type="button"
                title="Ir para o mês atual"
                disabled={!!(rangeStart && rangeEnd)}
              >
                Mês atual
              </button>
              <button
                onClick={() => setFilterMonth('')}
                className="text-sm px-3 py-2 rounded border hover:bg-gray-100"
                type="button"
                title="Limpar filtro de mês"
                disabled={!!(rangeStart && rangeEnd)}
              >
                Limpar mês
              </button>
            </div>

            {/* Filtro por PERÍODO */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex flex-col">
                <label htmlFor="inicio" className="font-medium">Data inicial</label>
                <input
                  id="inicio"
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="fim" className="font-medium">Data final</label>
                <input
                  id="fim"
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
              <button
                onClick={clearPeriod}
                className="text-sm px-3 py-2 rounded border hover:bg-gray-100"
                type="button"
                title="Limpar período"
              >
                Limpar período
              </button>

              <div className="sm:ml-auto text-sm text-gray-700">
                <span className="font-semibold">Total do período: </span>
                {currency.format(totalPeriodo)}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-2">Saídas Registradas</h2>

          {loading ? (
            <p>Carregando...</p>
          ) : saidas.length === 0 ? (
            <p>Nenhuma saída registrada.</p>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {saidas.map((s) => (
                <li
                  key={s.id}
                  className="border p-3 rounded bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      <p>
                        <strong>Data:</strong>{' '}
                        <span className="tabular-nums">{s.data}</span>
                      </p>
                      <p><strong>Fornecedor:</strong> {s.fornecedor}</p>
                      <p><strong>Descrição:</strong> {s.descricao}</p>
                      <p>
                        <strong>Valor:</strong>{' '}
                        <span className="tabular-nums">
                          {currency.format(Number(s.valor || 0))}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="shrink-0 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                      type="button"
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
