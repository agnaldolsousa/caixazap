'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const GRUPOS = [
  { value: 'voucher',   label: 'Voucher (VR, Alelo, Sodexo...)' },
  { value: 'credito',   label: 'Cartão de Crédito' },
  { value: 'debito',    label: 'Cartão de Débito' },
  { value: 'imposto',   label: 'Imposto' },
  { value: 'marketing', label: 'Marketing' },
];

export default function BandeirasForm({ onSaved }: { onSaved?: () => void }) {
  const [nome, setNome]   = useState('');
  const [taxa, setTaxa]   = useState('');
  const [grupo, setGrupo] = useState<'voucher'|'credito'|'debito'|'imposto'|'marketing'>('voucher');
  const [saving, setSaving] = useState(false);
  const [erro, setErro]     = useState<string | null>(null);

  // normaliza e valida taxa (permite "2,35" ou "2.35")
  function parseTaxaToNumber(v: string) {
    const num = Number(String(v).replace(',', '.'));
    return Number.isNaN(num) ? NaN : num;
  }

  function formatTaxaOut(v: string) {
    const n = parseTaxaToNumber(v);
    if (Number.isNaN(n)) return v;
    // exibe com vírgula e 2 casas ao sair do campo
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const taxaNum = parseTaxaToNumber(taxa);

    if (!nome.trim()) {
      setErro('Informe o nome.');
      return;
    }
    if (Number.isNaN(taxaNum) || taxaNum < 0) {
      setErro('Informe uma taxa válida (ex.: 2,35).');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('bandeiras')
        .insert([{ nome: nome.trim(), taxa_percentual: taxaNum, grupo }]);

      if (error) throw error;

      setNome('');
      setTaxa('');
      setGrupo('voucher');
      onSaved?.();
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3">Cadastrar bandeira</h3>

     <div className="grid grid-cols-12 gap-3">
  {/* NOME – ocupa a linha inteira no desktop */}
  <div className="col-span-12">
    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
    <input
      className="w-full rounded-md border border-blue-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-3 py-2"
      placeholder="Ex.: VR, Alelo, Sodexo, Visa Crédito…"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      autoComplete="off"
    />
  </div>

  {/* LINHA: Grupo | Taxa | Botão  — nunca quebra/encolhe */}
  <div className="col-span-12">
    <div className="
      md:grid md:grid-cols-[minmax(220px,1fr)_120px_96px]
      md:gap-3
      flex flex-wrap gap-3 items-end
    ">
      {/* GRUPO */}
      <div className="shrink-0">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Grupo</label>
        <select
          className="w-full min-w-[220px] rounded-md border border-blue-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 px-3 py-2"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value as any)}
        >
          {GRUPOS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* TAXA */}
      <div className="shrink-0">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Taxa (%)</label>
        <input
          type="text"
          inputMode="decimal"
          className="w-full min-w-[120px] rounded-md border border-blue-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-3 py-2 text-right"
          placeholder="Ex.: 2,35"
          value={taxa}
          onChange={(e) => {
            let v = e.target.value.replace(/[^\d,]/g, '');
            v = v.replace(/,(?=.*,)/g, '');
            setTaxa(v);
          }}
          autoComplete="off"
        />
      </div>

      {/* BOTÃO */}
      <div className="shrink-0 self-end">
        <button
          type="submit"
          disabled={saving}
          className="w-full min-w-[96px] rounded-md bg-blue-700 text-white font-semibold px-3 py-2 hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  </div>
</div>

      {erro && <div className="text-red-600 text-sm mt-2">{erro}</div>}
    </form>
  );
}
