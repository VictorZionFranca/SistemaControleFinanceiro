import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Sistema Financeiro",
  description: "Gerenciamento de movimentações financeiras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        {/* Sidebar fixa à esquerda */}
        <Sidebar className="fixed top-16 left-0 h-full" />

        {/* Conteúdo principal, com margem à esquerda para evitar sobreposição com o Sidebar */}
        <div className="flex-1 min-h-screen bg-gray-100 ml-16"> {/* ml-16 para dar espaço ao sidebar */}
          {/* Header fixo no topo */}
          <Header className="fixed top-0 left-0 right-0" />
          
          {/* Conteúdo que começa após o header */}
          <main className="p-4 pt-20">{children}</main> {/* pt-20 para deixar espaço abaixo do header fixo */}
        </div>
      </body>
    </html>
  );
}
