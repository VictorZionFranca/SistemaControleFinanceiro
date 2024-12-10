'use client';

import React, { useState, useEffect } from 'react';
import { getRelatorioMensal, getRelatorioPorTipo } from './relatoriosService';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import { DocumentData } from 'firebase/firestore';
import { FaFileDownload } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Movimentacao = {
  descricao: string;
  valor: number;
  data: string;
  tipo: 'receita' | 'despesa';
  situacao: 'paga' | 'pendente';
  despesaTipo?: string;
  meses?: number[];
};

const Relatorio: React.FC = () => {
  const [dados, setDados] = useState<Movimentacao[]>([]);
  const [tipo, setTipo] = useState<'receita' | 'despesa' | 'todos'>('todos');
  const [situacao, setSituacao] = useState<'paga' | 'pendente' | 'todos'>('todos');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchDados = async () => {
      let rawData: DocumentData[] = [];
      if (tipo === 'todos') {
        rawData = await getRelatorioMensal(mes, ano);
      } else {
        rawData = await getRelatorioPorTipo(tipo);
      }

      const data: Movimentacao[] = rawData.map((item) => ({
        descricao: item.descricao ?? '',
        valor: item.valor ?? 0,
        data: item.data ?? '',
        tipo: item.tipo === 'receita' ? 'receita' : 'despesa',
        situacao: item.situacao ?? 'paga',
        despesaTipo: item.despesaTipo ?? '',
        meses: Array.isArray(item.meses) ? item.meses : [],
      }));

      // Filtrando os dados conforme os filtros aplicados
      let filteredData = data;
      if (situacao !== 'todos') {
        filteredData = filteredData.filter((item) => item.situacao.toLowerCase() === situacao.toLowerCase());
      }
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.data);
        return itemDate.getMonth() + 1 === mes && itemDate.getFullYear() === ano;
      });

      setDados(filteredData);
    };

    fetchDados();
  }, [tipo, situacao, mes, ano]);

  const totalReceitas = dados.filter((mov) => mov.tipo === 'receita').reduce((acc, mov) => acc + mov.valor, 0);
  const totalDespesas = dados.filter((mov) => mov.tipo === 'despesa').reduce((acc, mov) => acc + mov.valor, 0);

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

  const formatarDataBrasileira = (data: string): string => {
    const dataObj = new Date(data);
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const gerarPDFRelatorio = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    const titulo = 'Relatório Financeiro';
    const tituloX = (doc.internal.pageSize.width - doc.getTextWidth(titulo)) / 2;
    doc.text(titulo, tituloX, 20);

    const dataInicio = `01/${mes.toString().padStart(2, '0')}/${ano}`;
    const dataFim = new Date(ano, mes, 0);
    const dataFimFormatada = `${dataFim.getDate().toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
    const periodo = `Período: de ${dataInicio} a ${dataFimFormatada}`;

    doc.setFontSize(12);
    doc.text(periodo, 10, 30);
    doc.line(10, 35, doc.internal.pageSize.width - 10, 35);

    const despesasPendentes = dados.filter(
      (mov) => mov.tipo === 'despesa' && mov.situacao === 'pendente'
    );
    const totalDespesasPendentes = despesasPendentes.reduce((acc, mov) => acc + mov.valor, 0);

    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, 10, 45);
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, 10, 50);
    doc.text(`Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`, 10, 55);
    doc.text(`Total de Despesas Pendentes: R$ ${totalDespesasPendentes.toFixed(2)}`, 10, 60);

    doc.line(10, 65, doc.internal.pageSize.width - 10, 65);

    let yOffset = 75;
    dados.forEach((movimentacao, index) => {
      if (movimentacao.tipo === 'despesa' && movimentacao.situacao === 'pendente') {
        return;
      }

      doc.setFontSize(12);
      doc.text(`Movimentação ${index + 1}:`, 10, yOffset);
      yOffset += 5;
      doc.text(`Descrição: ${movimentacao.descricao}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Valor: R$ ${movimentacao.valor.toFixed(2)}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Data: ${formatarDataBrasileira(movimentacao.data)}`, 10, yOffset);
      yOffset += 5;
      doc.text(`Tipo: ${movimentacao.tipo === 'receita' ? 'Receita' : 'Despesa'}`, 10, yOffset);

      if (movimentacao.tipo === 'despesa') {
        yOffset += 5;
        doc.text(`Situação: ${movimentacao.situacao === 'paga' ? 'Pago' : 'Pendente'}`, 10, yOffset);
        yOffset += 5;
        doc.text(`Tipo de Despesa: ${movimentacao.despesaTipo === 'fixa' ? 'Fixa' : 'Variável'}`, 10, yOffset);

        // Se a despesa for fixa, exibir o intervalo de meses
        if (movimentacao.despesaTipo === 'fixa' && movimentacao.meses && movimentacao.meses.length > 0) {
          yOffset += 5;
          const mesesOrdenados = [...movimentacao.meses].sort((a, b) => a - b);
          const primeiroMes = mesesOrdenados[0];
          const ultimoMes = mesesOrdenados[mesesOrdenados.length - 1];

          // Calculando ano e mês
          const primeiroAno = Math.floor(primeiroMes / 12);
          const primeiroMesNome = (primeiroMes % 12) + 1;
          const ultimoAno = Math.floor(ultimoMes / 12);
          const ultimoMesNome = (ultimoMes % 12) + 1;

          // Formatando os meses
          const intervalo = `${primeiroMesNome.toString().padStart(2, '0')}/${primeiroAno} a ${ultimoMesNome.toString().padStart(2, '0')}/${ultimoAno}`;
          doc.text(`Meses: ${intervalo}`, 10, yOffset);
        }
      }

      yOffset += 10;

      if (index < dados.length - 1) {
        doc.line(10, yOffset, doc.internal.pageSize.width - 10, yOffset);
        yOffset += 5;
      }

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 10;
      }
    });

    if (despesasPendentes.length > 0) {
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 10;
      }

      doc.setFontSize(16);
      doc.text('Despesas Pendentes', 10, yOffset);
      yOffset += 10;

      despesasPendentes.forEach((pendente, index) => {
        doc.setFontSize(12);
        doc.text(`Pendência ${index + 1}:`, 10, yOffset);
        yOffset += 5;
        doc.text(`Descrição: ${pendente.descricao}`, 10, yOffset);
        yOffset += 5;
        doc.text(`Valor: R$ ${pendente.valor.toFixed(2)}`, 10, yOffset);
        yOffset += 5;
        doc.text(`Data: ${formatarDataBrasileira(pendente.data)}`, 10, yOffset);
        yOffset += 5;
        doc.text(`Tipo: ${pendente.despesaTipo === 'fixa' ? 'Fixa' : 'Variável'}`, 10, yOffset);
        yOffset += 5;

        // Exibir os meses das despesas pendentes
        if (pendente.meses && pendente.meses.length > 0) {
          const mesesFormatados = pendente.meses.map((mes) => {
            const ano = Math.floor(mes / 12);
            const mesNome = (mes % 12) + 1;
            return `${mesNome.toString().padStart(2, '0')}/${ano}`;
          });
          doc.text(`Meses: ${mesesFormatados.join(', ')}`, 10, yOffset);
          yOffset += 10;
        }

        if (yOffset > 270) {
          doc.addPage();
          yOffset = 10;
        }
      });
    }

    doc.save('relatorio_financeiro.pdf');
  };

  return (
    <div className="container mx-auto px-4 py-6 text-black">
      <h2 className="text-xl font-semibold mb-6 text-center">Relatório Financeiro</h2>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex-1 sm:max-w-xs">
          <label className="block mb-1 font-medium">Tipo de Movimentação:</label>
          <select
            onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa' | 'todos')}
            className="p-2 border rounded w-full"
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        <div className="flex-1 sm:max-w-xs">
          <label className="block mb-1 font-medium">Situação:</label>
          <select
            onChange={(e) => setSituacao(e.target.value as 'paga' | 'pendente' | 'todos')}
            className="p-2 border rounded w-full"
          >
            <option value="todos">Todos</option>
            <option value="paga">Pago</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        <div className="flex-1 sm:max-w-xs">
          <label className="block mb-1 font-medium">Mês:</label>
          <input
            type="number"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            min={1}
            max={12}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="flex-1 sm:max-w-xs">
          <label className="block mb-1 font-medium">Ano:</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      {/* Gráfico e Detalhes */}
      {totalReceitas === 0 && totalDespesas === 0 ? (
        <div className="text-center text-xl">Nenhum dado disponível para o período selecionado.</div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Gráfico */}
          {/* Gráfico */}
          <div className="w-full flex justify-center">
            <div
              className="w-full sm:max-w-md lg:max-w-3xl"
              style={{ height: "300px" }}
            >
              <Chart
                type="bar"
                data={data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top" },
                  },
                  scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          {/* Detalhes das Movimentações */}
          <div className="w-full max-w-4xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Detalhes das Movimentações</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Descrição</th>
                    <th className="border p-2">Valor</th>
                    <th className="border p-2">Data</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((movimentacao, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{movimentacao.descricao}</td>
                      <td className="border p-2">{movimentacao.valor.toFixed(2)}</td>
                      <td className="border p-2">{formatarDataBrasileira(movimentacao.data)}</td>
                      <td className="border p-2">
                        {movimentacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </td>
                      <td className="border p-2">
                        {movimentacao.situacao === 'paga' ? 'Pago' : 'Pendente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Gerar PDF */}
      <div className="text-center mt-6">
        <button
          onClick={gerarPDFRelatorio}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          <FaFileDownload className="inline mr-2" /> Gerar PDF
        </button>
      </div>
    </div>
  );
};

export default Relatorio;
