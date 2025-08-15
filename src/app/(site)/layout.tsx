// src/app/(site)/layout.tsx
import Navbar from '../components/Navbar'; // caminho relativo seguro

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* espaçador da altura da navbar */}
      <div className="h-16 md:h-20" />

      {/* usa o fundo global; adiciona container central */}
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          {children}
        </div>
      </main>
    </>
  );
}
