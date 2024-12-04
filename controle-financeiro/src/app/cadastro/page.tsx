'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroMovimentacao() {
    const [formData, setFormData] = useState({
        tipo: 'receita', // Receita ou Despesa
        valor: '',
        data: '',
        descricao: '',
        despesaTipo: '', // Fixa ou Variável
        meses: 1, // Número de meses para despesas fixas
        situacao: 'pendente' // Situação de pagamento (aplica-se a despesas)
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação simples
        if (!formData.valor || !formData.data || !formData.descricao) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        // Validação para despesas fixas
        if (formData.tipo === 'despesa' && formData.despesaTipo === 'fixa' && formData.meses <= 0) {
            setError('Por favor, informe um número de meses válido.');
            return;
        }

        // Validação para despesas
        if (formData.tipo === 'despesa' && !formData.situacao) {
            setError('Por favor, informe a situação da despesa (pago ou pendente).');
            return;
        }

        // Aqui você pode adicionar a lógica para enviar os dados para o backend.
        // Simulação de envio bem-sucedido:
        setError(null);
        console.log('Movimentação registrada:', formData);

        // Redirecionando para a página de lista de movimentações ou para o dashboard
        router.push('/movimentacoes');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Cadastro de Movimentação</h2>

                {/* Exibindo mensagem de erro */}
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

                    {/* Campos específicos para despesas */}
                    {formData.tipo === 'despesa' && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="despesaTipo" className="block text-sm font-medium text-gray-700">
                                    Tipo de Despesa
                                </label>
                                <select
                                    id="despesaTipo"
                                    name="despesaTipo"
                                    value={formData.despesaTipo}
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
                                        value={formData.meses}
                                        onChange={handleChange}
                                        min="1"
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="situacao" className="block text-sm font-medium text-gray-700">
                                    Situação da Despesa
                                </label>
                                <select
                                    id="situacao"
                                    name="situacao"
                                    value={formData.situacao}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="pago">Pago</option>
                                </select>
                            </div>
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
                            value={formData.valor}
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
        </div>
    );
}
