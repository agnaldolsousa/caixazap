// src/app/(app)/layout.tsx
import '../globals.css'
import Link from 'next/link'
import AppSidebar from '@/components/AppSidebar'
import AuthGate from '../../components/AuthGate'

export const metadata = { title: 'CaixaZap' }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Topbar fixa com os dois botões */}
      <header className="flex items-center justify-between px-6 py-3 text-white">
        <Link href="/dashboard" className="font-extrabold text-xl hover:opacity-90">
          CaixaZap
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-semibold"
            title="Voltar ao Menu Principal"
          >
            Menu Principal
          </Link>
          <a
            href="/logout"
            className="rounded-xl border border-white/40 hover:bg-white/10 px-3 py-2 text-sm"
            title="Sair"
          >
            Sair
          </a>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar do seu projeto, do jeitinho que você tinha */}
        <AppSidebar />
        {/* Conteúdo protegido */}
        <main className="flex-1 px-6 py-8">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  )
}
