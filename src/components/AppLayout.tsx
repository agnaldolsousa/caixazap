import { ReactNode } from 'react'

type AppLayoutProps = {
  title?: string
  children: ReactNode
}

export default function AppLayout({ title = 'CaixaZap', children }: AppLayoutProps) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 bg-gradient-to-b from-blue-800 to-blue-400">
      <div className="mx-auto w-full max-w-5xl">
        {/* Topo */}
        <header className="mb-4 md:mb-6 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-extrabold text-white drop-shadow">
            {title}
          </h1>

          {/* 👉 agora sempre visível (antes: hidden md:flex) */}
          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/20 transition"
            >
              Menu Principal
            </a>
            <a
              href="/login"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/20 transition"
            >
              Sair
            </a>
          </div>
        </header>

        {/* GRID: mobile 1 coluna; desktop 2 colunas (sidebar 260px + conteúdo) */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-[260px,1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-white/10 p-3 md:p-4 shadow-sm ring-1 ring-white/10 backdrop-blur">
            <h2 className="mb-3 text-base md:text-lg font-semibold text-white/90">Módulos</h2>
            <nav className="space-y-2">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: '1. Despesas Fixas', href: '/despesas-fixas' },
                { label: '2. Entradas', href: '/entradas/nova' }, // ajuste se sua rota for /entradas
                { label: '3. Saídas', href: '/saidas' },
                { label: 'Nota Fiscal (OCR)', href: '/upload-nota' },
                { label: 'Planos', href: '/planos' },
                { label: 'Contato', href: '/contato' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block w-full rounded-xl bg-blue-600/90 px-3 py-2 text-left text-sm md:text-base text-white shadow hover:bg-blue-600 active:scale-[0.99] transition"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Conteúdo */}
          <main className="rounded-2xl bg-white p-4 md:p-6 shadow-xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
