import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Caixazap",
  description: "App simples para gerenciar mensagens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-white text-gray-900">
        <Navbar />
        <main className="p-4 min-h-[80vh]">{children}</main>
        <footer className="bg-gray-200 text-center p-2 text-sm text-gray-600">
          © {new Date().getFullYear()} Caixazap. Todos os direitos reservados.
        </footer>
      </body>
    </html>
  );
}
