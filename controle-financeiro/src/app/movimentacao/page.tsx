'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

interface Movimentacao {
  id: string;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedMovimentacao, setSelectedMovimentacao] =
    useState<Movimentacao | null>(null);
  const [editedDescricao, setEditedDescricao] = useState<string>('');
  const [editedValor, setEditedValor] = useState<number>(0);
  const [editedTipoDespesa, setEditedTipoDespesa] = useState<string>('');
  const [editedMeses, setEditedMeses] = useState<number | string>('');
  const [editedSituacao, setEditedSituacao] = useState<string>('');

  // Fetch movimentacoes
  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'movimentacoes'));
        const fetchedMovimentacoes: Movimentacao[] = [];
        querySnapshot.forEach((doc) => {
          const movimentacaoData = doc.data();
          fetchedMovimentacoes.push({
            id: doc.id,
            tipo: movimentacaoData.tipo,
            valor: movimentacaoData.valor,
            data: movimentacaoData.data,
            descricao: movimentacaoData.descricao,
            despesaTipo: movimentacaoData.despesaTipo || undefined,
            meses: movimentacaoData.meses || undefined,
            situacao: movimentacaoData.situacao || undefined,
          });
        });
        setMovimentacoes(fetchedMovimentacoes);
      } catch (error) {
        console.error('Erro ao buscar movimentações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimentacoes();
  }, []);

  // Função para abrir o modal de edição
  const openModal = (movimentacao: Movimentacao) => {
    setSelectedMovimentacao(movimentacao);
    setEditedDescricao(movimentacao.descricao);
    setEditedValor(movimentacao.valor);
    setEditedTipoDespesa(movimentacao.despesaTipo || '');
    setEditedMeses(movimentacao.meses || '');
    setEditedSituacao(movimentacao.situacao || '');
    setIsModalOpen(true);
  };

  // Função para fechar o modal de edição
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovimentacao(null);
  };

  // Função para abrir o modal de exclusão
  const openDeleteModal = (movimentacao: Movimentacao) => {
    setSelectedMovimentacao(movimentacao);
    setIsDeleteModalOpen(true);
  };

  // Função para fechar o modal de exclusão
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMovimentacao(null);
  };

  // Função para excluir a movimentação
  const handleDelete = async () => {
    if (selectedMovimentacao) {
      try {
        await deleteDoc(doc(db, 'movimentacoes', selectedMovimentacao.id));
        setMovimentacoes((prev) =>
          prev.filter((mov) => mov.id !== selectedMovimentacao.id)
        );
        closeDeleteModal();
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error);
      }
    }
  };

  // Função para atualizar a movimentação
  const handleUpdate = async () => {
    if (selectedMovimentacao) {
      try {
        const movimentacaoRef = doc(
          db,
          'movimentacoes',
          selectedMovimentacao.id
        );

        // Converter meses para número apenas se o valor não for vazio
        const mesesNumber =
          editedTipoDespesa === 'fixa' && editedMeses !== ''
            ? Number(editedMeses)
            : undefined;

        const updatedMovimentacao: Partial<Movimentacao> = {
          descricao: editedDescricao,
          valor: editedValor,
          despesaTipo: editedTipoDespesa,
          meses: mesesNumber, // Somente adiciona o valor se for definido
          situacao: editedSituacao || undefined,
        };

        // Remover campos que não são necessários
        Object.keys(updatedMovimentacao).forEach((key) => {
          if (updatedMovimentacao[key as keyof Movimentacao] === undefined) {
            delete updatedMovimentacao[key as keyof Movimentacao];
          }
        });

        await updateDoc(movimentacaoRef, updatedMovimentacao);

        // Atualizando o estado
        setMovimentacoes((prev) =>
          prev.map((mov) =>
            mov.id === selectedMovimentacao.id
              ? { ...mov, ...updatedMovimentacao }
              : mov
          )
        );

        closeModal();
      } catch (error) {
        console.error('Erro ao atualizar movimentação:', error);
      }
    }
  };

  // Função para formatar o valor monetário no padrão brasileiro
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Função para formatar a data no padrão brasileiro
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 text-black">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Movimentações Financeiras
      </h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          {/* Tabela para dispositivos maiores */}
          <div className="hidden md:block">
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
                  <th className="p-3 text-sm font-medium">Ações</th>
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
                      <td className="p-3 text-sm">
                        R$ {movimentacao.valor.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(movimentacao.data).toLocaleDateString(
                          'pt-BR'
                        )}
                      </td>
                      <td className="p-3 text-sm">{movimentacao.descricao}</td>
                      <td className="p-3 text-sm">
                        {movimentacao.despesaTipo || '-'}
                      </td>

                      {/* Exibir "-" se o tipo for "variável", senão exibe os meses */}
                      <td className="p-3 text-sm">
                        {movimentacao.despesaTipo === 'variavel' ||
                        movimentacao.meses === undefined
                          ? '-'
                          : `${movimentacao.meses} meses`}
                      </td>

                      <td className="p-3 text-sm">
                        {movimentacao.situacao || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        <button
                          className="text-yellow-500 hover:text-yellow-700"
                          onClick={() => openModal(movimentacao)}
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 ml-4"
                          onClick={() => openDeleteModal(movimentacao)}
                        >
                          <FaTrashAlt className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-5 text-center text-gray-500 text-sm"
                    >
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Layout em formato de cartão para dispositivos móveis */}
          <div className="block md:hidden">
            {movimentacoes.length > 0 ? (
              movimentacoes.map((movimentacao) => (
                <div
                  key={movimentacao.id}
                  className="bg-white shadow-md rounded-lg mb-4 p-4"
                >
                  <p className="text-sm font-medium">
                    <span className="font-bold">Tipo:</span> {movimentacao.tipo}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Valor:</span> R${' '}
                    {movimentacao.valor.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Data:</span>{' '}
                    {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Descrição:</span>{' '}
                    {movimentacao.descricao}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Tipo de Despesa:</span>{' '}
                    {movimentacao.despesaTipo || '-'}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Meses:</span>{' '}
                    {movimentacao.despesaTipo === 'variavel' ||
                    movimentacao.meses === undefined
                      ? '-'
                      : `${movimentacao.meses} meses`}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-bold">Situação:</span>{' '}
                    {movimentacao.situacao || '-'}
                  </p>
                  <div className="flex space-x-4 mt-2">
                    <button
                      className="text-yellow-500 hover:text-yellow-700"
                      onClick={() => openModal(movimentacao)}
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => openDeleteModal(movimentacao)}
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm">
                Nenhuma movimentação encontrada.
              </div>
            )}
          </div>

          {/* Modal de Edição */}
          {isModalOpen && selectedMovimentacao && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-xl font-semibold mb-4">
                  Editar Movimentação
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={editedDescricao}
                    onChange={(e) => setEditedDescricao(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={editedValor}
                    onChange={(e) => setEditedValor(Number(e.target.value))}
                  />
                </div>

                {/* Condição para renderizar o campo "Tipo de Despesa" apenas se o tipo for "despesa" */}
                {selectedMovimentacao.tipo === 'despesa' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Tipo de Despesa
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedTipoDespesa}
                        onChange={(e) => {
                          setEditedTipoDespesa(e.target.value);
                          // Se for "variável", ocultamos o campo "Situação"
                          if (e.target.value === 'variavel') {
                            setEditedSituacao('paga'); // Assumindo que a despesa já foi paga
                          }
                        }}
                      >
                        <option value="fixa">Fixa</option>
                        <option value="variavel">Variável</option>
                      </select>
                    </div>

                    {/* Exibir o campo Meses somente se o tipo de despesa for "fixa" */}
                    {editedTipoDespesa === 'fixa' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Meses
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={editedMeses}
                          onChange={(e) => setEditedMeses(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Condição para renderizar o campo "Situação" apenas se o tipo for "fixa" */}
                {selectedMovimentacao.tipo === 'despesa' &&
                  editedTipoDespesa === 'fixa' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Situação
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedSituacao}
                        onChange={(e) => setEditedSituacao(e.target.value)}
                      >
                        <option value="paga">Paga</option>
                        <option value="pendente">Pendente</option>
                      </select>
                    </div>
                  )}

                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleUpdate}
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão */}
          {isDeleteModalOpen && selectedMovimentacao && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-xl font-semibold mb-4">
                  Tem certeza que deseja excluir?
                </h3>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    onClick={closeDeleteModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                    onClick={handleDelete}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
