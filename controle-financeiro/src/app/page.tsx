'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export default function Home() {
  const [resumo, setResumo] = useState({
    receitas: 0,
    despesas: 0,
  });

  const [estatisticas, setEstatisticas] = useState({
    despesasFixas: 0,
    despesasVariaveis: 0,
  });

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'movimentacoes'));
        let totalReceitas = 0;
        let totalDespesas = 0;
        let despesasFixas = 0;
        let despesasVariaveis = 0;

        querySnapshot.forEach((doc) => {
          const movimentacao = doc.data();
          const { tipo, valor, despesaTipo } = movimentacao;

          if (tipo === 'receita') {
            totalReceitas += valor;
          } else if (tipo === 'despesa') {
            totalDespesas += valor;
            if (despesaTipo === 'fixa') {
              despesasFixas += 1;
            } else if (despesaTipo === 'variavel') {
              despesasVariaveis += 1;
            }
          }
        });

        // Atualiza os estados com os valores calculados
        setResumo({
          receitas: totalReceitas,
          despesas: totalDespesas,
        });

        setEstatisticas({
          despesasFixas,
          despesasVariaveis,
        });
      } catch (error) {
        console.error("Erro ao buscar movimentações:", error);
      }
    };

    fetchMovimentacoes();
  }, []);

  return (
    <>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">Dashboard Financeiro</h1>

        {/* Resumo do Mês */}
        <section className="bg-gray-100 rounded-lg shadow-md p-6 mb-8 text-black">
          <h2 className="text-2xl font-semibold mb-4">Resumo do Mês</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </section>

        {/* Estatísticas de Despesas */}
        <section className="bg-gray-100 rounded-lg shadow-md p-6 text-black">
          <h2 className="text-2xl font-semibold mb-4">Estatísticas de Despesas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-lg font-medium">Despesas Fixas</p>
              <p className="text-2xl font-bold">{estatisticas.despesasFixas}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-lg font-medium">Despesas Variáveis</p>
              <p className="text-2xl font-bold">{estatisticas.despesasVariaveis}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
