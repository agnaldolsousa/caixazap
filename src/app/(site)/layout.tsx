// src/app/(site)/layout.tsx
import Navbar from '../components/Navbar'; // caminho relativo seguro

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* espaçador da altura da navbar */}
      <div className="h-16 md:h-20" />
      {/* usa só o fundo global definido no globals.css */}
      <main className="min-h-screen">{children}</main>
    </>
  );
}
