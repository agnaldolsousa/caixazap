'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // encerra a sessão no navegador
      await supabase.auth.signOut();
      // manda para o login
      router.replace('/login');
    })();
  }, [router]);

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400 flex items-center justify-center">
      <p className="text-white/90">Saindo…</p>
    </main>
  );
}
