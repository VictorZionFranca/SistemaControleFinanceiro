"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
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
      if (err instanceof FirebaseError) {
        setError(err.message); // Mensagem de erro específica do Firebase
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false); // Remove o carregamento após a tentativa
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring focus:ring-indigo-300"
            disabled={loading} // Desabilita o botão durante o carregamento
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-4 text-center">
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
