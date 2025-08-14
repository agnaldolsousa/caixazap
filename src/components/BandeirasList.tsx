'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Bandeira = {
  id: string;
  nome: string;
  taxa_percentual: number | string | null;
  grupo: 'voucher' | 'credito' | 'debito' | 'imposto' | 'marketing' | null;
  created_at: string;
};

const GRUPOS = [
  { value: 'voucher',   label: 'Voucher' },
  { value: 'credito',   label: 'Crédito' },
  { value: 'debito',    label: 'Débito' },
  { value: 'imposto',   label: 'Imposto' },
  { value: 'marketing', label: 'Marketing' },
] as const;

export default function BandeirasList({ reloadKey }: { reloadKey?: any }) {
  const [rows, setRows] = useState<Bandeira[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editGrupo, setEditGrupo] = useState<Bandeira['grupo']>('voucher');
  const [editTaxa, setEditTaxa] = useState(''); // string do input

  async function fetchBandeiras() {
    try {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabase
        .from('bandeiras')
        .select('id, nome, taxa_percentual, grupo, created_at')
        .order('nome', { ascending: true });

      if (error) throw error;
      setRows((data as Bandeira[]) ?? []);
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao carregar.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // Excluir
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta bandeira?')) return;

    const { error } = await supabase.from('bandeiras').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('Erro ao excluir. Tente novamente.');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  }

  // Entrar em edição
  function startEdit(r: Bandeira) {
    setEditingId(r.id);
    setEditNome(r.nome ?? '');
    setEditGrupo((r.grupo as any) ?? 'voucher');

    // converte valor para string amigável (usa vírgula no placeholder)
    const num = normalizeToNumber(r.taxa_percentual);
    setEditTaxa(Number.isFinite(num) ? String(num).replace('.', ',') : '');
  }

  // Cancelar edição
  function cancelEdit() {
    setEditingId(null);
    setEditNome('');
    setEditGrupo('voucher');
    setEditTaxa('');
  }

  // Salvar edição
  async function saveEdit() {
    if (!editingId) return;

    // normaliza taxa vinda do input (aceita "2,35" ou "2.35")
    const taxaNumber = normalizeToNumber(editTaxa);
    if (!Number.isFinite(taxaNumber)) {
      alert('Informe uma taxa válida (ex.: 2,35).');
      return;
    }

    const payload = {
      nome: editNome.trim(),
      grupo: editGrupo,
      taxa_percentual: taxaNumber,
    };

    const { error } = await supabase
      .from('bandeiras')
      .update(payload)
      .eq('id', editingId);

    if (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
      return;
    }

    // atualiza localmente
    setRows(prev =>
      prev.map(r =>
        r.id === editingId
          ? { ...r, ...payload }
          : r
      )
    );
    cancelEdit();
  }

  useEffect(() => { fetchBandeiras(); }, []);
  useEffect(() => { fetchBandeiras(); }, [reloadKey]);

  // ---------- util: normaliza número e formata ----------
  function normalizeToNumber(v: number | string | null): number {
    if (v == null) return NaN;
    let s = String(v).trim();

    // troca vírgula por ponto
    s = s.replace(',', '.');

    // remove pontos de milhar se existirem: "1.234.56" -> "1234.56"
    const parts = s.split('.');
    if (parts.length > 2) {
      const last = parts.pop()!;
      s = parts.join('') + '.' + last;
    }
    return Number(s);
  }

  const fmtPercent = (v: number | string | null) => {
    const num = normalizeToNumber(v);
    if (!Number.isFinite(num)) return '—';
    const rounded = Math.round(num * 100) / 100; // 2 casas
    return rounded.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <section className="mt-4 bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">Bandeiras (VR, Alelo, Sodexo…)</h3>
        <button
          onClick={fetchBandeiras}
          className="px-3 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800"
        >
          Recarregar
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Carregando…</div>
      ) : erro ? (
        <div className="text-red-600">Erro: {erro}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-600">Nenhuma bandeira cadastrada ainda.</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          {/* Cabeçalho */}
          <div className="grid grid-cols-12 bg-blue-50 text-blue-900 font-semibold text-sm border-b">
            <div className="col-span-4 px-3 py-2">Nome</div>
            <div className="col-span-3 px-3 py-2">Grupo</div>
            <div className="col-span-2 px-3 py-2 text-right">Taxa (%)</div>
            <div className="col-span-2 px-3 py-2 text-right">Criado</div>
            <div className="col-span-1 px-3 py-2 text-right">Ações</div>
          </div>

          {/* Linhas */}
          {rows.map((r, idx) => {
            const isEdit = editingId === r.id;

            return (
              <div
                key={r.id}
                className={`grid grid-cols-12 px-3 py-2 text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Nome */}
                <div className="col-span-4">
                  {isEdit ? (
                    <input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Nome"
                    />
                  ) : (
                    <span className="text-gray-800">{r.nome}</span>
                  )}
                </div>

                {/* Grupo */}
                <div className="col-span-3">
                  {isEdit ? (
                    <select
                      value={editGrupo ?? 'voucher'}
                      onChange={(e) => setEditGrupo(e.target.value as any)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {GRUPOS.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700 capitalize">{r.grupo ?? '—'}</span>
                  )}
                </div>

                {/* Taxa */}
                <div className="col-span-2 text-right">
                  {isEdit ? (
                    <input
                      value={editTaxa}
                      onChange={(e) => setEditTaxa(e.target.value)}
                      inputMode="decimal"
                      placeholder="Ex.: 2,35"
                      className="w-full text-right rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  ) : (
                    <span className="text-gray-800">{fmtPercent(r.taxa_percentual)}</span>
                  )}
                </div>

                {/* Criado */}
                <div className="col-span-2 text-right text-gray-600">
                  {new Date(r.created_at).toLocaleDateString('pt-BR')}
                </div>

                {/* Ações */}
                <div className="col-span-1 text-right space-x-1">
                  {isEdit ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-sm"
                        title="Salvar"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 shadow-sm"
                        title="Cancelar"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(r)}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm"
                        title="Excluir"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
