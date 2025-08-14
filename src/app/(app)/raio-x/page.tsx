'use client';

import { useState } from 'react';
import BandeirasForm from '@/components/BandeirasForm';
import BandeirasList from '@/components/BandeirasList';
import BandeirasResumo from '@/components/BandeirasResumo';

export default function RaioXPage() {
  // chave para forçar recarregamento nos filhos
  const [reloadKey, setReloadKey] = useState(0);

  // chamada quando salvar/excluir para atualizar lista + resumo
  const dispararReload = () => setReloadKey((k) => k + 1);

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400">
      {/* Cabeçalho da página */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-white text-2xl font-bold">CaixaZap</h1>
      </header>

      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-5">
        {/* Coluna esquerda: Form + Lista */}
        <section className="space-y-4">
          {/* Card de Cadastros */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Cadastros</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Cadastrar bandeira</h3>
                {/* Quando salvar, dispara reload para Lista e Resumo */}
                <BandeirasForm onSaved={dispararReload} />
              </div>

              {/* Ajuda/legendas (opcional) */}
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li>• Bandeiras (VR, Alelo, Sodexo…)</li>
                <li>• Taxas de Cartão</li>
                <li>• Impostos / Percentuais</li>
                <li>• Outros parâmetros</li>
              </ul>
            </div>
          </div>

          {/* Lista */}
          <BandeirasList reloadKey={reloadKey} />
        </section>

        {/* Coluna direita: Resumo (Médias) */}
        <aside className="md:sticky md:top-6 h-fit">
          <BandeirasResumo reloadKey={reloadKey} />
        </aside>
      </div>
    </main>
  );
}
