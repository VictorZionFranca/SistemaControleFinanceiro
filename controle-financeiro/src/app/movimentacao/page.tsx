'use client';

import { useState, useEffect } from 'react';

interface Movimentacao {
  id: number;
  tipo: string;
  valor: number;
  data: string;
  descricao: string;
  despesaTipo?: string;
  meses?: number;
  situacao?: string;
}

export default function VerMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  useEffect(() => {
    // Simulando a busca de dados (substituir por chamada API real)
    const mockData: Movimentacao[] = [
      {
        id: 1,
        tipo: 'receita',
        valor: 1000,
        data: '2024-12-01',
        descricao: 'Salário',
      },
      {
        id: 2,
        tipo: 'despesa',
        valor: 300,
        data: '2024-12-02',
        descricao: 'Conta de Luz',
        despesaTipo: 'fixa',
        meses: 12,
        situacao: 'pago',
      },
    ];
    setMovimentacoes(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 text-black">
      <h2 className="text-2xl font-semibold mb-6 text-center">Movimentações Financeiras</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-medium">Tipo</th>
              <th className="p-3 text-sm font-medium">Valor</th>
              <th className="p-3 text-sm font-medium">Data</th>
              <th className="p-3 text-sm font-medium">Descrição</th>
              <th className="p-3 text-sm font-medium">Tipo de Despesa</th>
              <th className="p-3 text-sm font-medium">Meses</th>
              <th className="p-3 text-sm font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.length > 0 ? (
              movimentacoes.map((movimentacao) => (
                <tr
                  key={movimentacao.id}
                  className="border-b hover:bg-gray-100 transition-colors"
                >
                  <td className="p-3 text-sm">{movimentacao.tipo}</td>
                  <td className="p-3 text-sm">{movimentacao.valor.toFixed(2)}</td>
                  <td className="p-3 text-sm">{movimentacao.data}</td>
                  <td className="p-3 text-sm">{movimentacao.descricao}</td>
                  <td className="p-3 text-sm">{movimentacao.despesaTipo || '-'}</td>
                  <td className="p-3 text-sm">
                    {movimentacao.meses ? `${movimentacao.meses} meses` : '-'}
                  </td>
                  <td className="p-3 text-sm">{movimentacao.situacao || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-5 text-center text-gray-500 text-sm"
                >
                  Nenhuma movimentação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
