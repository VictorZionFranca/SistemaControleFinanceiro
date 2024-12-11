"use client"; // Diretiva para tratar como Client Component

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import Link from "next/link"; // Import do Link do Next.js

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Reseta mensagens de erro

        try {
            // Cria o usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Atualiza o perfil do usuário com o nome
            await updateProfile(userCredential.user, { displayName: name });

            // Salva os dados adicionais no Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                email,
                createdAt: new Date().toISOString(),
            });

            // Redireciona para o dashboard
            router.push("/dashboard");
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                setError(err.message); // Mensagem de erro específica do Firebase
            } else {
                setError("Ocorreu um erro desconhecido."); // Caso o erro seja de outro tipo
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-4">Registrar</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-300"
                            required
                        />
                    </div>
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
                    >
                        Registrar
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-700">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
