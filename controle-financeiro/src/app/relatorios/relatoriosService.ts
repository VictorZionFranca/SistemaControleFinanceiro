// src/relatorios/relatoriosService.ts

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';  // Usando a instância db já configurada

// Função para obter o relatório mensal
export const getRelatorioMensal = async (mes: number, ano: number) => {
  const movimentacoesRef = collection(db, 'movimentacoes');
  
  // Definindo o início e o fim do mês
  const inicioMes = new Date(ano, mes - 1, 1);  // Início do mês
  const fimMes = new Date(ano, mes, 1);         // Início do próximo mês (fim do mês atual)

  console.log("Início do mês:", inicioMes);
  console.log("Fim do mês:", fimMes);

  const q = query(
    movimentacoesRef,
    where('data', '>=', inicioMes.toISOString().split('T')[0]),  // Comparando no formato YYYY-MM-DD
    where('data', '<', fimMes.toISOString().split('T')[0])       // Comparando no formato YYYY-MM-DD
  );

  const querySnapshot = await getDocs(q);
  console.log("Número de documentos encontrados:", querySnapshot.size);

  if (querySnapshot.empty) {
    console.log("Nenhuma movimentação encontrada para este mês.");
    return [];
  }

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    console.log("Documento:", data);
    return data;
  });
};

// Função para obter o relatório anual
export const getRelatorioAnual = async (ano: number) => {
  const movimentacoesRef = collection(db, 'movimentacoes');
  
  // Definindo o início e o fim do ano
  const inicioAno = new Date(ano, 0, 1);  // Início do ano
  const fimAno = new Date(ano + 1, 0, 1); // Início do próximo ano (fim do ano atual)

  const q = query(
    movimentacoesRef,
    where('data', '>=', inicioAno.toISOString().split('T')[0]),  // Comparando no formato YYYY-MM-DD
    where('data', '<', fimAno.toISOString().split('T')[0])       // Comparando no formato YYYY-MM-DD
  );

  const querySnapshot = await getDocs(q);
  console.log("Número de documentos encontrados para o ano:", querySnapshot.size);

  if (querySnapshot.empty) {
    console.log("Nenhuma movimentação encontrada para este ano.");
    return [];
  }

  return querySnapshot.docs.map((doc) => doc.data());
};

// Função para obter o relatório por tipo de movimentação (receita ou despesa)
export const getRelatorioPorTipo = async (tipo: 'receita' | 'despesa') => {
  const movimentacoesRef = collection(db, 'movimentacoes');
  const q = query(movimentacoesRef, where('tipo', '==', tipo));  // Filtro pelo tipo
  
  const querySnapshot = await getDocs(q);
  console.log("Número de documentos encontrados para o tipo:", tipo, querySnapshot.size);

  if (querySnapshot.empty) {
    console.log(`Nenhuma movimentação encontrada para o tipo: ${tipo}`);
    return [];
  }

  return querySnapshot.docs.map((doc) => doc.data());
};

// Função para obter o relatório por situação (pago ou pendente)
export const getRelatorioPorSituacao = async (situacao: 'pago' | 'pendente') => {
  const movimentacoesRef = collection(db, 'movimentacoes');
  const q = query(movimentacoesRef, where('situacao', '==', situacao));  // Filtro pela situação
  
  const querySnapshot = await getDocs(q);
  console.log("Número de documentos encontrados para a situação:", situacao, querySnapshot.size);

  if (querySnapshot.empty) {
    console.log(`Nenhuma movimentação encontrada para a situação: ${situacao}`);
    return [];
  }

  return querySnapshot.docs.map((doc) => doc.data());
};
