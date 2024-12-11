"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { auth } from "../lib/firebaseConfig";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth"; // Métodos corretos
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carregamento para verificar o estado de autenticação
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Configura a persistência do login apenas uma vez quando o componente for montado
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Verifique o estado do usuário assim que o componente for montado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // Usuário logado, armazene no estado
            setIsLoggedIn(true);
          } else {
            // Usuário não autenticado
            setIsLoggedIn(false);
          }
          setLoading(false); // Finaliza a verificação de autenticação
        });

        // Cleanup para desinscrever quando o componente for desmontado
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Erro ao configurar persistência de sessão:", error);
        setLoading(false); // Finaliza a verificação de autenticação mesmo com erro
      });
  }, []);

  useEffect(() => {
    // Não faz nada se a verificação ainda está em andamento
    if (loading) return;

    // Verifique se o usuário está logado antes de acessar páginas restritas
    if (!isLoggedIn && !["/login", "/registro"].includes(pathname)) {
      router.push("/login"); // Redireciona para a página de login
    }
  }, [isLoggedIn, pathname, router, loading]);

  const isAuthPage = ["/login", "/registro"].includes(pathname);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen">
        {/* Sidebar será exibido apenas se não estiver nas páginas de login ou registro */}
        {!isAuthPage && (
          <Sidebar className="fixed top-16 left-0 h-full" />
        )}

        <div className={`flex-1 ${!isAuthPage ? "ml-16" : ""} bg-gray-100`}>
          {/* O Header será exibido apenas se não estiver nas páginas de login ou registro */}
          {!isAuthPage && (
            <Header className="fixed top-0 left-0 right-0" />
          )}

          {/* Conteúdo principal, com ajustes dependendo da página */}
          <main className={`p-4 ${!isAuthPage ? "pt-20" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
