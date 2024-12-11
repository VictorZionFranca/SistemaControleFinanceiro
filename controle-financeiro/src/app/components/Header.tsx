"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig"; // Certifique-se de ter o auth configurado
import { useAuth } from "../../lib/useAuth"; // Importe o hook que fornece o estado de autenticação

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth(); // Agora o user é obtido através do useAuth
  const router = useRouter();

  // Função para logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Realiza o logout no Firebase
      router.push("/login"); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className={`bg-gray-800 text-white p-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sistema Financeiro</h1>

        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white"
            >
              {user.displayName || "Usuário"} {/* Exibe o nome do usuário */}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                <ul className="space-y-2 py-2 px-4">
                  <li>
                    <button
                      onClick={() => router.push("/perfil")}
                      className="block w-full text-left py-1 px-2 hover:bg-gray-200 rounded-md"
                    >
                      Perfil
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-1 px-2 hover:bg-gray-200 rounded-md"
                    >
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
