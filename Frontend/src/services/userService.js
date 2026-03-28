import api from './api';

/**
 * Serviço centralizado para gestão de utilizadores.
 */
export const userService = {
    /**
     * Obtém os dados do perfil do utilizador autenticado.
     */
    getMe: async () => {
        return await api("/users/me", "GET");
    },

    /**
     * Obtém a lista de todos os utilizadores (Apenas ADMIN).
     */
    getAllUsers: async () => {
        const response = await api("/users", "GET");
        return Array.isArray(response) ? response : [];
    },

    /**
     * Obtém um utilizador específico pelo ID (Apenas ADMIN).
     * Necessário para carregar perfis alheios.
     */
    getUserById: async (id) => {
        return await api(`/users/${id}`, "GET");
    },

    /**
     * Alterna o estado do utilizador (Ativar/Desativar).
     */
    toggleUserStatus: async (id, action) => {
        // action deve ser "softdelete" ou "softundelete"
        return await api(`/users/${id}/${action}`, "PATCH");
    },

    /**
     * Elimina o utilizador definitivamente do sistema.
     */
    deleteUserPermanent: async (id) => {
        return await api(`/users/${id}`, "DELETE");
    }
};