'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/entradas', label: 'Entradas' },
  { href: '/despesas-fixas', label: 'Despesas Fixas' },
  { href: '/faturamento-mensal', label: 'Faturamento Mensal' },
  { href: '/raio-x', label: 'Raio-X' },
  { href: '/itens-cardapio', label: 'Itens do Cardápio' },
  { href: '/itens-manipulados', label: 'Itens Manipulados' },
  { href: '/cadastro-insumos', label: 'Cadastro de Insumos' },
  { href: '/upload-nota', label: 'Nota Fiscal (OCR)' }, // 👈 NOVO ITEM
  { href: '/lucro-atual', label: 'Lucro Atual' },
  { href: '/suporte', label: 'Suporte' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 p-4 bg-white/10 text-white">
      <div className="mb-4 text-lg font-bold">CaixaZap</div>
      <nav className="space-y-2">
        {items.map((i) => {
          const active = pathname?.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`block w-full text-left px-3 py-2 rounded-lg border
                ${active
                  ? 'bg-white/20 border-white/30'
                  : 'bg-blue-700/70 hover:bg-blue-700 border-blue-400/40'}`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
