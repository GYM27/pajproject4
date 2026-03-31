import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Esta é a minha "gaveta global" de dados do utilizador.
 * Uso o 'persist' para que, se eu fizer F5 na página, os dados não desapareçam.
 * Guardo tudo no 'sessionStorage' para que a sessão feche se eu fechar o browser.
 */
export const useUserStore = create(
    persist(
        (set) => ({
            // 1. O meu estado inicial (o que o utilizador é antes de fazer login)
            username: "",   // O login técnico (ex: @admin123)
            firstName: "",  // O nome próprio
            lastName: "",   // O apelido
            email: "",      // O correio eletrónico
            userRole: "",   // Se é ADMIN ou USER
            photoUrl: "",   // A foto de perfil
            isAuthenticated: false, // Atalho rápido para saber se está logado

            // 2. Ação principal: Guardar o utilizador todo de uma vez.
            // Em vez de ter 10 funções 'setNome', 'setEmail', etc.,
            // recebo o objeto (userData) que vem do Java e guardo tudo aqui.
            setUser: (userData) => set({
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                userRole: userData.userRole,
                photoUrl: userData.photoUrl || "",
                isAuthenticated: true
            }),

            // 3. Ação para quando eu quiser mudar apenas a foto (sem refrescar o resto)
            setPhotoUrl: (url) => set({ photoUrl: url }),

            // 4. O botão de emergência: Limpa tudo no Logout
            clearUser: () => set({
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                userRole: "",
                photoUrl: "",
                isAuthenticated: false
            }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
);