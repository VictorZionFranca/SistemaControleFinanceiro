import { useState, useEffect } from "react";
import { auth } from "./firebaseConfig"; // Ajuste o caminho conforme a estrutura do seu projeto
import { User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Adiciona estado de loading

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Atualiza o estado do usuário
      setLoading(false); // Para de mostrar o "loading" quando a verificação estiver concluída
    });

    return () => unsubscribe(); // Limpeza ao desmontar o componente
  }, []);

  return { user, loading };
}
