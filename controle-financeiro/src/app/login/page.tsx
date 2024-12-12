'use client';

import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para controle de carregamento
  const router = useRouter(); // Hook de navegação

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reseta mensagens de erro
    setLoading(true); // Inicia o carregamento enquanto faz a requisição

    try {
      // Definindo a persistência para que a sessão seja mantida após o recarregamento da página
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Armazenar o token ou UID no localStorage (não é necessário se a persistência estiver configurada corretamente)
      localStorage.setItem("auth_token", userCredential.user.uid);

      router.push("/"); // Redireciona para a página inicial após login bem-sucedido
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("user-not-found")) {
          // Se o e-mail não foi encontrado
          setError("Seu e-mail e sua senha estão incorretos.");
        } else if (err.message.includes("wrong-password")) {
          // Se a senha estiver errada
          setError("Sua senha está errada.");
        } else {
          setError("Seu e-mail ou sua senha estão incorretos.");
        }
      } else {
        setError("Sua senha está incorreta.");
      }
    } finally {
      setLoading(false); // Remove o carregamento após a tentativa

      // Esconde o erro após 2 segundos
      if (error) {
        setTimeout(() => {
          setError(""); // Limpa o erro após 2 segundos
        }, 2000);
      }
    }
  };

  return (
    <div className="flex items-center justify-center mt-28 bg-gray-100 text-black">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="text-red-600 bg-red-100 border-l-4 border-red-500 p-3 mb-4 rounded-md">
              <strong className="font-semibold">Erro: </strong>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={loading} // Desabilita o botão durante o carregamento
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/registro" className="text-indigo-600 hover:text-indigo-700">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
