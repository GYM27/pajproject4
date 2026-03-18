import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';


// Define a store para o usuário
export const useUserStore = create(
  persist(
    (set) => ({
      username: "", // Variável de estado
      updateName: (username) => set({ username }), // Função para atualizar
    }),
    {
      name: 'user-storage', // Nome para o sessionStorage
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);