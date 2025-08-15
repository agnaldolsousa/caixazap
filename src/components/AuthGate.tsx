'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        router.replace('/login');        // 🔒 sem login → vai para /login
      } else {
        setReady(true);                  // ✅ logado → libera
      }
    });

    return () => { mounted = false; };
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-blue-800 to-blue-400 flex items-center justify-center">
        <p className="text-white/90">Carregando…</p>
      </main>
    );
  }

  return <>{children}</>;
}
