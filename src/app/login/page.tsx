'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Se já estiver logado, manda direto pro dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro(error.message ?? 'Falha ao entrar. Verifique e tente novamente.');
      return;
    }

    if (data.user) {
      router.push('/dashboard'); // ✅ Passo 3: redireciona
    }
  }

  return (
    <main className="relative min-h-screen">
      {/* Fundo com imagem */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/image/hero-mobile1.jpg"
          alt="Fundo CaixaZap"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-blue-600/10" />
      </div>

      {/* Card de login */}
      <div className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Entrar no CaixaZap</h1>
          <p className="text-gray-600 text-center mt-1">
            Use o e‑mail e a senha cadastrados.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
                required
                autoComplete="current-password"
              />
            </div>

            {erro && <div className="text-red-600 text-sm">{erro}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-4 py-2 transition shadow"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-1">
              Página exclusiva — acesse somente com o link enviado.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
