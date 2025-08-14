'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Saida = {
  id: number;
  data: string;
  fornecedor: string;
  descricao: string;
  valor: number;
};

function getCurrentMonthYYYYMM() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}`;
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
  const [data, setData] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterMonth, setFilterMonth] = useState<string>(getCurrentMonthYYYYMM());
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

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

    setData('');
    setFornecedor('');
    setDescricao('');
    setValor('');
  }

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
    <div className="min-h-screen app-bg app-text px-6 py-10">
      <h1 className="app-title">Módulo: Saídas</h1>

      <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto">
        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="app-card flex-1">
          <div className="grid grid-cols-1 gap-3">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="app-input" required />
            <input type="text" placeholder="Fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="app-input" required />
            <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="app-input" required />
            <input type="number" step="0.01" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} className="app-input" required />
            <button type="submit" className="app-btn w-full">Salvar</button>
          </div>
        </form>

        {/* LISTAGEM + FILTROS */}
        <div className="app-card flex-1 flex flex-col">
          <div className="space-y-3 mb-4">
            {/* Filtro Mês */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="filtroMes" className="font-medium">Filtrar por Mês:</label>
                <input id="filtroMes" type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="app-input" disabled={!!(rangeStart && rangeEnd)} />
              </div>
              <button onClick={goToCurrentMonth} type="button" className="app-btn text-sm" disabled={!!(rangeStart && rangeEnd)}>Mês atual</button>
              <button onClick={() => setFilterMonth('')} type="button" className="app-btn text-sm" disabled={!!(rangeStart && rangeEnd)}>Limpar mês</button>
            </div>

            {/* Filtro Período */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex flex-col">
                <label htmlFor="inicio" className="font-medium">Data inicial</label>
                <input id="inicio" type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="app-input" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="fim" className="font-medium">Data final</label>
                <input id="fim" type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="app-input" />
              </div>
              <button onClick={clearPeriod} type="button" className="app-btn text-sm">Limpar período</button>

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
                <li key={s.id} className="border p-3 rounded bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      <p><strong>Data:</strong> <span className="tabular-nums">{s.data}</span></p>
                      <p><strong>Fornecedor:</strong> {s.fornecedor}</p>
                      <p><strong>Descrição:</strong> {s.descricao}</p>
                      <p><strong>Valor:</strong> <span className="tabular-nums">{currency.format(Number(s.valor || 0))}</span></p>
                    </div>
                    <button onClick={() => handleDelete(s.id)} type="button" className="shrink-0 !bg-red-600 hover:!bg-red-700 text-white px-3 py-2 rounded text-sm">Excluir</button>
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
