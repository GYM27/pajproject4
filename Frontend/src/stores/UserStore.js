import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Store global para gerir o perfil do utilizador.
 * Mudamos 'username' para 'firstName' para alinhar com o DTO do Java.
 */
export const useUserStore = create(
  persist(
    (set) => ({
      // 1. ESTADO: Guardamos o nome próprio (ex: "Luís") e não o login (ex: "luis123")
      firstName: "", 

      // 2. AÇÃO: Função para atualizar o nome no mural global
      setFirstName: (name) => set({ firstName: name }), 

      setUserRole: (role) => set({userRole: role}),

      // 3. AÇÃO EXTRA: Limpar os dados (útil para o Logout)
      clearUser: () => set({ firstName: "", userRole: "" }),
    }),
    {
      name: "user-storage", 
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);