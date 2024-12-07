'use client';

import React, { useState, useEffect } from 'react';
import { getRelatorioMensal, getRelatorioPorTipo } from './relatoriosService';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import { DocumentData } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Movimentacao = {
  descricao: string;
  valor: number;
  data: string;
  tipo: 'receita' | 'despesa';
  situacao: 'paga' | 'pendente';
  despesaTipo?: string;
  meses?: number;
};

const Relatorio: React.FC = () => {
  const [dados, setDados] = useState<Movimentacao[]>([]);
  const [tipo, setTipo] = useState<'receita' | 'despesa' | 'todos'>('todos');
  const [situacao, setSituacao] = useState<'paga' | 'pendente'>('paga');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchDados = async () => {
      let rawData: DocumentData[] = [];
      let data: Movimentacao[] = [];

      // Busca os dados de acordo com o tipo selecionado
      if (tipo === 'todos') {
        rawData = await getRelatorioMensal(mes, ano);
      } else {
        rawData = await getRelatorioPorTipo(tipo);
      }

      // Mapeamento para garantir compatibilidade com Movimentacao
      data = rawData.map((item) => ({
        descricao: item.descricao ?? '',
        valor: item.valor ?? 0,
        data: item.data ?? '',
        tipo: item.tipo === 'receita' ? 'receita' : 'despesa',
        situacao: item.situacao ?? 'paga',
        despesaTipo: item.despesaTipo ?? '',
        meses: item.meses ?? 0,  // Certifique-se de incluir o campo 'meses' aqui, se necessário
      }));

      console.log('Dados filtrados antes da situação', data); // Verifique os dados no console

      // Filtro por tipo (despesa ou receita)
      if (tipo !== 'todos') {
        data = data.filter((item) => item.tipo === tipo);
      }

      // Filtro por situação (paga ou pendente) - garantindo que não haja espaços extras
      if (situacao) {
        console.log('Filtro aplicado para situação:', situacao); // Verifique se o valor de situação está correto
        data = data.filter((item) => item.situacao.trim() === situacao);
      }

      // Filtro por mês e ano
      data = data.filter((item) => {
        const itemDate = new Date(item.data);
        return itemDate.getMonth() + 1 === mes && itemDate.getFullYear() === ano;
      });

      setDados(data);
    };

    fetchDados();
  }, [tipo, situacao, mes, ano]);

  // Calcular totais de receitas e despesas
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

  // Função para gerar o relatório em PDF
  const gerarPDFRelatorio = () => {
    const doc = new jsPDF();

    // Definindo fonte
    doc.setFontSize(16);

    // Título centralizado
    const titulo = 'Relatório Financeiro';
    const tituloX = (doc.internal.pageSize.width - doc.getTextWidth(titulo)) / 2;
    doc.text(titulo, tituloX, 20);

    // Adicionando uma linha logo abaixo do título
    doc.setLineWidth(0.5);
    doc.line(10, 25, doc.internal.pageSize.width - 10, 25);

    // Adicionando a data do relatório
    const dataInicio = `01/${mes.toString().padStart(2, '0')}/${ano}`;
    const dataFim = new Date(ano, mes, 0); // último dia do mês
    const dataFimFormatada = `${dataFim.getDate().toString().padStart(2, '0')}/${(mes).toString().padStart(2, '0')}/${ano}`;
    const periodo = `Período: de ${dataInicio} a ${dataFimFormatada}`;

    doc.setFontSize(12);
    doc.text(periodo, 10, 30);

    // Linha de separação entre período e totais
    doc.line(10, 35, doc.internal.pageSize.width - 10, 35);

    // Seção de Totais
    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, 10, 45);
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, 10, 50);
    doc.text(`Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`, 10, 55);

    // Linha de separação entre totais e movimentações
    doc.line(10, 60, doc.internal.pageSize.width - 10, 60);

    let yOffset = 70;
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

      // Verificação para despesas, mostrando mais detalhes
      if (movimentacao.tipo === 'despesa') {
        if (movimentacao.despesaTipo === 'fixa') {
          yOffset += 10;
          doc.text(`Tipo de Despesa: Fixa`, 10, yOffset);
          yOffset += 5;
          // Verifica se meses é um número e exibe corretamente
          if (typeof movimentacao.meses === 'number' && movimentacao.meses > 0) {
            doc.text(`Meses: ${movimentacao.meses}`, 10, yOffset); // Aqui é apenas o valor do número
          } else {
            doc.text(`Meses: Não definido`, 10, yOffset);
          }
        } else if (movimentacao.despesaTipo === 'variavel') {
          yOffset += 10;
          doc.text(`Tipo de Despesa: Variável`, 10, yOffset);
          yOffset += 5;
        }
        doc.text(`Situação: ${movimentacao.situacao === 'paga' ? 'Pago' : 'Pendente'}`, 10, yOffset + 10);
        yOffset += 15;
      }

      yOffset += 10; // Espaço entre movimentações

      if (index < dados.length - 1) {
        doc.setLineWidth(0.5);
        doc.line(10, yOffset, doc.internal.pageSize.width - 10, yOffset);
        yOffset += 5;
      }
    });

    // Se o conteúdo ultrapassar a página, adicionar uma nova
    if (yOffset > 260) {
      doc.addPage();
      yOffset = 10;
      doc.text('Relatório Financeiro (continuação)', 10, yOffset);
    }

    // Seção para adicionar as despesas pendentes ao final do relatório
    const despesasPendentes = dados.filter(movimentacao => movimentacao.tipo === 'despesa' && movimentacao.situacao === 'pendente');

    if (despesasPendentes.length > 0) {
      doc.addPage();  // Adiciona uma nova página para as despesas pendentes
      doc.setFontSize(16);
      doc.text('Despesas Pendentes', 10, 20);  // Título da seção

      let yOffsetPendente = 30;

      despesasPendentes.forEach((movimentacao, index) => {
        doc.setFontSize(12);
        doc.text(`Movimentação ${index + 1}:`, 10, yOffsetPendente);
        yOffsetPendente += 5;
        doc.text(`Descrição: ${movimentacao.descricao}`, 10, yOffsetPendente);
        yOffsetPendente += 5;
        doc.text(`Valor: R$ ${movimentacao.valor.toFixed(2)}`, 10, yOffsetPendente);
        yOffsetPendente += 5;
        doc.text(`Data: ${movimentacao.data}`, 10, yOffsetPendente);
        yOffsetPendente += 5;
        doc.text(`Tipo: ${movimentacao.tipo === 'receita' ? 'Receita' : 'Despesa'}`, 10, yOffsetPendente);

        // Verificação para despesas, mostrando mais detalhes
        if (movimentacao.tipo === 'despesa') {
          if (movimentacao.despesaTipo === 'fixa') {
            yOffsetPendente += 10;
            doc.text(`Tipo de Despesa: Fixa`, 10, yOffsetPendente);
            yOffsetPendente += 5;
            // Verifica se meses é um número e exibe corretamente
            if (typeof movimentacao.meses === 'number' && movimentacao.meses > 0) {
              doc.text(`Meses: ${movimentacao.meses}`, 10, yOffsetPendente); // Aqui é apenas o valor do número
            } else {
              doc.text(`Meses: Não definido`, 10, yOffsetPendente);
            }
          } else if (movimentacao.despesaTipo === 'variavel') {
            yOffsetPendente += 10;
            doc.text(`Tipo de Despesa: Variável`, 10, yOffsetPendente);
            yOffsetPendente += 5;
          }

          doc.text(`Situação: Pendente`, 10, yOffsetPendente + 10);
          yOffsetPendente += 15;
        }

        yOffsetPendente += 10; // Espaço entre movimentações

        if (index < despesasPendentes.length - 1) {
          doc.setLineWidth(0.5);
          doc.line(10, yOffsetPendente, doc.internal.pageSize.width - 10, yOffsetPendente);
          yOffsetPendente += 5;
        }
      });
    }

    doc.save('relatorio_financeiro.pdf');
  };

  return (
    <div className="container mx-auto px-4 py-6 text-black">
      <h2 className="text-xl font-semibold mb-6 text-center">Relatório Financeiro</h2>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <select
          onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa' | 'todos')}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="todos">Todos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>

        <select
          onChange={(e) => setSituacao(e.target.value as 'paga' | 'pendente')}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="paga">Pago</option>
          <option value="pendente">Pendente</option>
        </select>

        <input
          type="number"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          min={1}
          max={12}
          className="p-2 border rounded w-full sm:w-auto"
        />
        <input
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
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
