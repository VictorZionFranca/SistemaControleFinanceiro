"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BsList, BsFillHouseDoorFill, BsFillCalendar2PlusFill, BsEye, BsClipboard2Data
} from "react-icons/bs";

interface SidebarProps {
  className?: string; // Adiciona a propriedade className
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <aside
      className={`bg-gray-800 text-white h-screen transition-all duration-300 shadow-md ${isOpen ? "w-64" : "w-16"} flex flex-col ${className}`}
    >
      <button
        onClick={toggleSidebar}
        className="py-3 px-5 focus:outline-none hover:bg-gray-700 rounded-lg mt-2 mb-3 text-2xl"
      >
        {isOpen ? <BsList /> : <BsList />}
      </button>

      <nav className="flex flex-col flex-grow">
        <ul>
          {[ 
            { href: "/", icon: <BsFillHouseDoorFill />, label: "Inicio" },
            { href: "/cadastro", icon: <BsFillCalendar2PlusFill />, label: "Cadastro de Movimentação" },
            { href: "/movimentacao", icon: <BsEye />, label: "Ver Movimentação" },
            { href: "/relatorios", icon: <BsClipboard2Data />, label: "Relatórios" },
          ].map((item, index) => (
            <Link href={item.href} key={item.href}>
              <li
                className={`flex items-center py-3 mb-3 px-6 font-medium text-sm rounded-lg transition-all duration-300 ${pathname === item.href
                  ? "bg-gray-700 text-blue-500"
                  : "hover:bg-gray-600"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-500 ${isOpen
                    ? "opacity-100 max-w-full ml-2"
                    : "opacity-0 max-w-0"
                    }`}
                  style={{
                    transitionProperty: isOpen ? "opacity, max-width" : "none",
                    transitionDelay: isOpen ? `${index * 0.12}s` : "0s",
                  }}
                >
                  {item.label}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </aside>
  );
}