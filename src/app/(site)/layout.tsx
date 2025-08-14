import Navbar from '@/app/components/Navbar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="h-16 md:h-20" />
      {children}
    </>
  );
}
