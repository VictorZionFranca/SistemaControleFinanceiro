'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useAuth } from "../../lib/useAuth"; 
import { FaRegUserCircle, FaRegUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth(); // Obtém o usuário autenticado
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

  // Função para fechar o dropdown quando clicar fora dele
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target && !target.closest(".dropdown")) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Função de alternância para dropdown, para também suportar teclado
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <header className={`bg-gray-800 text-white p-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sistema Financeiro</h1>

        {user && (
          <div className="relative dropdown mr-4">
            <button
              onClick={toggleDropdown}
              onKeyDown={(e) => e.key === "Enter" && toggleDropdown()}
              aria-expanded={dropdownOpen}
              className="text-white flex items-center"
            >
              <FaRegUserCircle className="mr-2 text-xl" />
              {user.displayName || "Usuário"} {/* Exibe o nome do usuário */}
              {dropdownOpen ? (
                <IoIosArrowUp className="ml-2 text-xl" />
              ) : (
                <IoIosArrowDown className="ml-2 text-xl" />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                <ul className="space-y-2 py-2 px-4">
                  <li>
                    <button
                      onClick={() => router.push("/perfil")}
                      onBlur={closeDropdown} // Fecha o dropdown ao sair do botão
                      className="w-full text-left py-1 px-2 hover:bg-gray-200 rounded-md flex items-center"
                    >
                      <FaRegUser className="mr-2" />
                      Perfil
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      onBlur={closeDropdown}
                      className="w-full text-left py-1 px-2 hover:bg-gray-200 rounded-md flex items-center"
                    >
                      <MdLogout className="mr-2" />
                      Logout
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
