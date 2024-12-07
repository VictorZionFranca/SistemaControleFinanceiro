'use client'

import React, { useState, useEffect } from 'react';
import { getRelatorioMensal, getRelatorioPorTipo, getRelatorioAnual, getRelatorioPorSituacao } from './relatoriosService';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Relatorio: React.FC = () => {
  const [dados, setDados] = useState<any[]>([]);
  const [tipo, setTipo] = useState<'receita' | 'despesa' | 'todos'>('todos');
  const [situacao, setSituacao] = useState<'pago' | 'pendente'>('pago');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchDados = async () => {
      let data: any[] = [];

      if (tipo === 'todos') {
        data = await getRelatorioMensal(mes, ano);  // Pode ser ajustado para outros filtros
      } else {
        data = await getRelatorioPorTipo(tipo);
      }

      // Filtro por situação
      if (situacao && tipo === 'despesa') {
        data = data.filter(item => item.situacao?.toLowerCase() === situacao.toLowerCase());
      }

      // Filtro por tipo de movimentação
      if (tipo !== 'todos') {
        data = data.filter(item => item.tipo?.toLowerCase() === tipo.toLowerCase());
      }

      setDados(data);
    };

    fetchDados();
  }, [tipo, situacao, mes, ano]);

  const totalReceitas = dados.filter(mov => mov.tipo === 'receita').reduce((acc, mov) => acc + mov.valor, 0);
  const totalDespesas = dados.filter(mov => mov.tipo === 'despesa').reduce((acc, mov) => acc + mov.valor, 0);

  const data = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        label: 'Valores',
        data: [totalReceitas, totalDespesas],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const gerarPDFRelatorio = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório Financeiro', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, 10, 20);
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, 10, 25);
    doc.text(`Saldo: R$ ${totalReceitas - totalDespesas}`, 10, 30);

    let yOffset = 40;
    dados.forEach((movimentacao, index) => {
      doc.setFontSize(12);
      doc.text(`Movimentação ${index + 1}:`, 10, yOffset);
      yOffset += 5;
      doc.text(`Descrição: ${movimentacao.descricao}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Valor: R$ ${movimentacao.valor.toFixed(2)}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Data: ${movimentacao.data}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Tipo: ${movimentacao.tipo === 'receita' ? 'Receita' : 'Despesa'}`, 10, yOffset);
      yOffset += 10;

      if (index < dados.length - 1) {
        doc.setLineWidth(0.5);
        doc.line(10, yOffset, 200, yOffset);
        yOffset += 5;
      }
    });

    if (yOffset > 260) {
      doc.addPage();
      yOffset = 10;
      doc.text('Relatório Financeiro (continuação)', 10, yOffset);
    }

    doc.save('relatorio_financeiro.pdf');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-6 text-center">Relatório Financeiro</h2>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <select
          onChange={e => setTipo(e.target.value as 'receita' | 'despesa' | 'todos')}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="todos">Todos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>

        <select
          onChange={e => setSituacao(e.target.value as 'pago' | 'pendente')}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
        </select>

        <input
          type="number"
          value={mes}
          onChange={e => setMes(Number(e.target.value))}
          min={1}
          max={12}
          className="p-2 border rounded w-full sm:w-auto"
        />
        <input
          type="number"
          value={ano}
          onChange={e => setAno(Number(e.target.value))}
          className="p-2 border rounded w-full sm:w-auto"
        />
      </div>

      {/* Gráfico */}
      {totalReceitas === 0 && totalDespesas === 0 ? (
        <div className="text-center">Nenhum dado encontrado para o relatório.</div>
      ) : (
        <div className="w-full max-w-2xl mx-auto mb-6">
          <Chart type="bar" data={data} />
        </div>
      )}

      {/* Resumo */}
      <div className="mt-6 text-center">
        <p className="text-lg">Total de Receitas: R$ {totalReceitas.toFixed(2)}</p>
        <p className="text-lg">Total de Despesas: R$ {totalDespesas.toFixed(2)}</p>
        <p className="text-lg">Saldo: R$ {(totalReceitas - totalDespesas).toFixed(2)}</p>
      </div>

      {/* Exportar PDF */}
      <div className="mt-6 text-center">
        <button
          onClick={gerarPDFRelatorio}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 w-full sm:w-auto"
        >
          Exportar para PDF
        </button>
      </div>
    </div>
  );
};

export default Relatorio;
