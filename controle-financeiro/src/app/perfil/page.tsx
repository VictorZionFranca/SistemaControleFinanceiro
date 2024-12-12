'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../../lib/useAuth'; // Hook personalizado para autenticação

export default function UserProfile() {
  const { user } = useAuth(); // Obtém o usuário autenticado
  const [resumo, setResumo] = useState({
    receitas: 0,
    despesas: 0,
  });

  const [loading, setLoading] = useState(true); // Estado para controle de carregamento

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        if (!user) return; // Verifica se o usuário está autenticado

        console.log('Buscando movimentações para o usuário:', user.uid); // Verifica o uid do usuário

        const movimentacoesRef = collection(db, 'movimentacoes');
        const q = query(movimentacoesRef, where('uid', '==', user.uid)); // Filtra pelo uid do usuário atual
        const querySnapshot = await getDocs(q);

        let totalReceitas = 0;
        let totalDespesas = 0;

        querySnapshot.forEach((doc) => {
          const movimentacao = doc.data();
          console.log('Movimentação encontrada:', movimentacao); // Verifique os dados de cada movimentação

          const { tipo, valor } = movimentacao;

          // Garantir que o valor seja um número válido
          const valorNumerico = parseFloat(valor);
          if (isNaN(valorNumerico)) {
            console.warn('Valor inválido encontrado:', valor);
            return;
          }

          if (tipo === 'receita') {
            totalReceitas += valorNumerico;
          } else if (tipo === 'despesa') {
            totalDespesas += valorNumerico;
          }
        });

        // Atualiza os estados com os valores calculados
        setResumo({
          receitas: totalReceitas,
          despesas: totalDespesas,
        });
      } catch (error) {
        console.error('Erro ao buscar movimentações:', error);
      } finally {
        setLoading(false); // Marca o carregamento como concluído
      }
    };

    fetchMovimentacoes();
  }, [user]); // Reexecuta a consulta se o usuário mudar

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-xl">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-xl">Por favor, faça login para visualizar suas movimentações.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">Perfil</h1>

      {/* Informações do perfil do usuário */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-black">
        <h2 className="text-2xl font-semibold text-gray-700">Informações Pessoais</h2>
        <p className="text-gray-600 mt-4"><strong>Nome:</strong> {user?.displayName || "Não informado"}</p>
        <p className="text-gray-600 mt-2"><strong>Email:</strong> {user?.email}</p>
      </div>

      {/* Resumo financeiro do usuário */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-gray-700">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-lg font-medium">Total de Receitas</p>
            <p className="text-2xl font-bold text-green-500">R$ {resumo.receitas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-lg font-medium">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-500">R$ {resumo.despesas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-lg font-medium">Saldo Final</p>
            <p className={`text-2xl font-bold ${resumo.receitas - resumo.despesas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {(resumo.receitas - resumo.despesas).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
