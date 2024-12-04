"use client";

interface HeaderProps {
    className?: string; // Adiciona a propriedade className
  }
  
  export default function Header({ className }: HeaderProps) {
    return (
      <header className={`bg-gray-800 text-white p-4 ${className}`}>
        {/* Seu conteúdo do Header */}
        <h1 className="text-2xl font-bold">Sistema Financeiro</h1>
      </header>
    );
  }
  