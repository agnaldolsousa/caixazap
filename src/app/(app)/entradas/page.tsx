// src/app/entradas/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Forma = { id: string; nome?: string; descricao?: string };

type Entrada = {
  id: string;
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
  formas_recebimento_id?: string | null; // FK (UUID)
};

function toBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function toDateBR(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString('pt-BR');
}

export default function EntradasPage() {
  // --------- formulário (esquerda)
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [formaId, setFormaId] = useState('');

  // --------- formas para o <select>
  const [formas, setFormas] = useState<Forma[]>([]);
  const mapaFormas = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of formas) m.set(f.id, f.nome ?? f.descricao ?? '');
    return m;
  }, [formas]);

  // --------- lista / filtro (direita)
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [mesFiltro, setMesFiltro] = useState(
    () => new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  const totalMes = useMemo(
    () => entradas.reduce((s, e) => s + Number(e.valor || 0), 0),
    [entradas]
  );

  // --------- carregar formas (preenche o select)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('formas_recebimento')
        .select('id, nome, descricao')
        .order('nome', { ascending: true });
      if (error) {
        console.error('Erro ao carregar formas:', error.message, error.details);
        return;
      }
      setFormas((data as Forma[]) ?? []);
    })();
  }, []);

  // --------- carregar mês (sem join)
  async function carregarMes() {
    try {
      setLoading(true);
      const [anoStr, mesStr] = mesFiltro.split('-');
      const ano = Number(anoStr);
      const mes = Number(mesStr) - 1;

      const inicio = new Date(ano, mes, 1).toISOString().slice(0, 10);
      const fim = new Date(ano, mes + 1, 0).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('entradas')
        .select('id, descricao, valor, data, formas_recebimento_id')
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: false });

      if (error) {
        console.error('Supabase select error:', error.message, error.details);
        throw error;
      }
      setEntradas((data as Entrada[]) ?? []);
    } catch (err) {
      console.error('Erro ao carregar entradas:', err);
      setEntradas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMes();
  }, [mesFiltro]);

  // --------- salvar nova entrada
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao.trim() || !valor || !data) {
      alert('Preencha Descrição, Valor e Data.');
      return;
    }
    if (!formaId) {
      alert('Selecione a forma de recebimento.');
      return;
    }

    try {
      const payload = {
        descricao: descricao.trim(),
        valor: Number(valor),
        data, // YYYY-MM-DD
        formas_recebimento_id: formaId, // UUID da forma
      };

      const { error } = await supabase.from('entradas').insert(payload);
      if (error) {
        console.error('Supabase insert error:', error.message, error.details);
        throw error;
      }

      // limpa o formulário
      setDescricao('');
      setValor('');
      setData(new Date().toISOString().slice(0, 10));
      setFormaId('');

      // refetch ou troca mês
      if (data.slice(0, 7) === mesFiltro) {
        await carregarMes();
      } else {
        setMesFiltro(data.slice(0, 7));
      }
    } catch (err: any) {
      console.error('Erro ao salvar entrada:', err?.message || err);
      alert(`Não foi possível salvar: ${err?.message || 'Erro desconhecido'}`);
    }
  }

  // --------- excluir entrada
  async function handleDelete(id: string) {
    const ok = confirm('Tem certeza que deseja excluir esta entrada?');
    if (!ok) return;

    try {
      setDeletandoId(id);
      const { error } = await supabase.from('entradas').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error.message, error.details);
        throw error;
      }
      // remove localmente sem recarregar
      setEntradas((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error('Erro ao excluir:', err?.message || err);
      alert(`Não foi possível excluir: ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setDeletandoId(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400">
      <h1 className="text-center text-white text-3xl font-extrabold mb-8">
        Entradas
      </h1>

      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6">

        {/* Esquerda: formulário */}
        <section className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nova Entrada</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-gray-900"
            />

            <input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-gray-900"
            />

            <select
              value={formaId}
              onChange={(e) => setFormaId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-gray-900"
            >
              <option value="">Selecione uma forma</option>
              {formas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome ?? f.descricao}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-gray-900"
            />

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Salvar
            </button>
          </form>
        </section>

        {/* Direita: lista + filtro */}
        <section className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Mês:</label>
              <input
                type="month"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="p-2 border border-gray-300 rounded text-gray-900"
              />
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 leading-tight">Total no mês</p>
              <p className="text-base font-bold text-gray-800">
                {toBRL(totalMes)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-600">Carregando…</div>
          ) : entradas.length === 0 ? (
            <div className="p-4 bg-white rounded border text-gray-600">
              Nenhuma entrada neste mês.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-blue-50 text-blue-900 font-semibold text-sm border-b">
                <div className="col-span-4 px-3 py-2">Item</div>
                <div className="col-span-2 px-3 py-2 text-right">Forma</div>
                <div className="col-span-3 px-3 py-2 text-right">Valor</div>
                <div className="col-span-2 px-3 py-2 text-right">Data</div>
                <div className="col-span-1 px-3 py-2 text-right">Ações</div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {entradas.map((e) => {
                  const nomeForma = e.formas_recebimento_id
                    ? (mapaFormas.get(e.formas_recebimento_id) || '—')
                    : '—';
                  const desabilitado = deletandoId === e.id;

                  return (
                    <div
                      key={e.id}
                      className="grid grid-cols-12 px-3 py-2 text-sm odd:bg-white even:bg-gray-50"
                    >
                      <div className="col-span-4 text-gray-800 truncate">{e.descricao}</div>
                      <div className="col-span-2 text-right text-gray-800">{nomeForma}</div>
                      <div className="col-span-3 text-right text-gray-800">{toBRL(Number(e.valor))}</div>
                      <div className="col-span-2 text-right text-gray-600">{toDateBR(e.data)}</div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={desabilitado}
                          className={`px-2 py-1 rounded-lg font-semibold border transition
                                      ${desabilitado
                                        ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400'
                                        : 'border-red-500 text-red-600 hover:bg-red-50'}`}
                          title="Excluir"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
