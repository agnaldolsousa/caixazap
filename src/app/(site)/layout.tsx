// src/app/(site)/layout.tsx
import Navbar from '../components/Navbar'; 

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      {/* Espaço da altura da navbar */}
      <div className="h-16 md:h-20" />

      {/* Conteúdo das páginas */}
      <main className="w-full">{children}</main>
    </div>
  );
}
