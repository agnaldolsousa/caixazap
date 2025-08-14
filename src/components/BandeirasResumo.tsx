'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Bandeira } from './BandeirasList';

type MediaPorGrupo = {
  grupo: GrupoKey;
  media: number | null; // null quando não há itens
  itens: number;
};

type GrupoKey = 'voucher' | 'credito' | 'debito' | 'imposto' | 'marketing';

const NOMES: Record<GrupoKey, string> = {
  voucher: 'Voucher',
  credito: 'Crédito',
  debito: 'Débito',
  imposto: 'Imposto',
  marketing: 'Marketing',
};

const GRUPOS: GrupoKey[] = ['voucher', 'credito', 'debito', 'imposto', 'marketing'];

export default function BandeirasResumo({ reloadKey }: { reloadKey?: any }) {
  const [rows, setRows] = useState<Bandeira[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function fetchAll() {
    try {
      setLoading(true);
      setErro(null);
      const { data, error } = await supabase
        .from('bandeiras')
        .select('id, nome, taxa_percentual, grupo');

      if (error) throw error;
      setRows((data as Bandeira[]) ?? []);
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao carregar.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchAll(); }, [reloadKey]);

  const calculo = useMemo(() => {
    // agrega por grupo, ignorando registros sem grupo
    const porGrupo: MediaPorGrupo[] = GRUPOS.map((g) => {
      const subset = rows.filter(r => r.grupo === g); // não força 'voucher' quando null
      const soma = subset.reduce((acc, r) => acc + Number(r.taxa_percentual ?? 0), 0);
      const media = subset.length ? soma / subset.length : null; // null => mostra “—”
      return { grupo: g, media, itens: subset.length };
    });

    const todas = rows
      .map(r => Number(r.taxa_percentual ?? NaN))
      .filter(v => Number.isFinite(v)) as number[];

    const mediaGeral = todas.length
      ? todas.reduce((s, v) => s + v, 0) / todas.length
      : null;

    return { porGrupo, mediaGeral, totalItens: todas.length };
  }, [rows]);

  const fmt = (v: number | null) =>
    v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">Resumo</h3>
        <button
          onClick={fetchAll}
          className="px-3 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800"
        >
          Recarregar
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Carregando…</div>
      ) : erro ? (
        <div className="text-red-600">Erro: {erro}</div>
      ) : (
        <>
          {/* Caixinhas: nome à esquerda, média à direita */}
          <div className="space-y-2">
            {calculo.porGrupo.map((g) => (
              <div
                key={g.grupo}
                className="flex items-center justify-between rounded-lg border border-white/40 bg-gradient-to-r from-white/80 to-white/60 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-700">
                  {NOMES[g.grupo]} <span className="text-xs text-gray-400">({g.itens})</span>
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {fmt(g.media)} %
                </span>
              </div>
            ))}
          </div>

          {/* divisor */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

          {/* Total / média geral */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200/60 bg-blue-50/70 px-3 py-3">
            <div className="text-sm">
              <div className="font-semibold text-blue-900">Média geral</div>
              <div className="text-blue-800/80">Base: {calculo.totalItens} taxa(s)</div>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {fmt(calculo.mediaGeral)} %
            </div>
          </div>
        </>
      )}
    </section>
  );
}
