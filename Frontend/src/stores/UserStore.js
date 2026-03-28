import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Store global para gerir o perfil do utilizador.
 * Mudamos 'username' para 'firstName' para alinhar com o DTO do Java.
 */
export const useUserStore = create(
  persist(
    (set) => ({
      firstName: "",
      userRole: "",
      photoUrl: "", // Adicionado campo de foto
      setFirstName: (name) => set({ firstName: name }),
      setUserRole: (role) => set({ userRole: role }),
      setPhotoUrl: (url) => set({ photoUrl: url }), // Adicionada ação
      clearUser: () => set({ firstName: "", userRole: "", photoUrl: "" }),
    }),
    { name: "user-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);