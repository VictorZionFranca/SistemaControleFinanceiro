'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../lib/firebaseConfig';
import type { User } from 'firebase/auth';

// Interface para representar os dados da movimentação
interface Movimentacao {
    tipo: 'receita' | 'despesa';
    valor: number;
    data: string;
    descricao: string;
    despesaTipo?: 'fixa' | 'variavel';
    meses?: number;
    situacao?: 'pago' | 'pendente';
    uid?: string;
}

export default function CadastroMovimentacao() {
    const [formData, setFormData] = useState<Movimentacao>({
        tipo: 'receita',
        valor: 0,
        data: '',
        descricao: '',
    });
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState<boolean>(false);

    // Obter o usuário autenticado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === 'despesaTipo' && value === 'variavel') {
                return {
                    ...prev,
                    [name]: value,
                    situacao: 'pago', // Define automaticamente como pago
                };
            }

            if (name === 'despesaTipo' && value === 'fixa') {
                return {
                    ...prev,
                    [name]: value,
                    situacao: 'pendente', // Define automaticamente como pendente
                };
            }

            return {
                ...prev,
                [name]: name === 'valor' || name === 'meses' ? parseFloat(value) || 0 : value,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.valor || !formData.data || !formData.descricao) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        if (!user) {
            setError('Você precisa estar autenticado para cadastrar movimentações.');
            return;
        }

        try {
            // Adicionar o `uid` do usuário autenticado à movimentação
            const dataToSave = {
                ...formData,
                uid: user.uid, // Associar ao usuário autenticado
            };

            await addDoc(collection(db, 'movimentacoes'), dataToSave);

            setShowNotification(true);
            setError(null);

            setFormData({
                tipo: 'receita',
                valor: 0,
                data: '',
                descricao: '',
            });

            setTimeout(() => setShowNotification(false), 2500);
        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            setError('Erro ao registrar movimentação.');
        }
    };

    return (
        <div className="flex items-center justify-center text-black">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Cadastro de Movimentação</h2>

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                            Tipo de Movimentação
                        </label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="receita">Receita</option>
                            <option value="despesa">Despesa</option>
                        </select>
                    </div>

                    {formData.tipo === 'despesa' && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="despesaTipo" className="block text-sm font-medium text-gray-700">
                                    Tipo de Despesa
                                </label>
                                <select
                                    id="despesaTipo"
                                    name="despesaTipo"
                                    value={formData.despesaTipo || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Selecione</option>
                                    <option value="fixa">Fixa</option>
                                    <option value="variavel">Variável</option>
                                </select>
                            </div>

                            {formData.despesaTipo === 'fixa' && (
                                <div className="mb-4">
                                    <label htmlFor="meses" className="block text-sm font-medium text-gray-700">
                                        Quantos meses será registrada?
                                    </label>
                                    <input
                                        id="meses"
                                        name="meses"
                                        type="number"
                                        value={formData.meses || 1}
                                        onChange={handleChange}
                                        min="1"
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="mb-4">
                        <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                            Valor
                        </label>
                        <input
                            id="valor"
                            name="valor"
                            type="number"
                            value={formData.valor || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700">
                            Data
                        </label>
                        <input
                            id="data"
                            name="data"
                            type="date"
                            value={formData.data}
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                            Descrição
                        </label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                    >
                        Registrar Movimentação
                    </button>
                </form>
            </div>

            {showNotification && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg">
                    Movimentação registrada com sucesso!
                </div>
            )}
        </div>
    );
}
