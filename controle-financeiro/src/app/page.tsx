export default function Home() {
  const resumo = {
    receitas: 5000,
    despesas: 3000,
  };

  const estatisticas = {
    despesasFixas: 3,
    despesasVariaveis: 5,
  };

  return (
    <>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Dashboard Financeiro</h1>

        {/* Resumo do Mês */}
        <section className="bg-gray-100 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Resumo do Mês</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-lg font-medium">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-500">R$ {resumo.receitas}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-lg font-medium">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-500">R$ {resumo.despesas}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-lg font-medium">Saldo Final</p>
              <p className={`text-2xl font-bold ${resumo.receitas - resumo.despesas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {resumo.receitas - resumo.despesas}
              </p>
            </div>
          </div>
        </section>

        {/* Estatísticas de Despesas */}
        <section className="bg-gray-100 rounded-lg shadow-md p-6">
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
