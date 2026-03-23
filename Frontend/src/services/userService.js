import api from './api';

/**
 * Serviço para gestão de dados do utilizador.
 */
export const userService = {
    /**
     * Obtém os dados do perfil do utilizador autenticado.
     */
    getMe: async () => {
        return await api("/users/me", "GET");
    },

    /**
     * Obtém a lista de todos os utilizadores (apenas para ADMIN).
     * Mapeia para o endpoint @GET /users no Java.
     */
    getAllUsers: async () => {
        // O wrapper 'api' já deve tratar a injeção do token no Header
        const response = await api("/users", "GET");
        
        // Proteção: Garante que devolvemos sempre um array para o .map no componente
        return Array.isArray(response) ? response : [];
    }
};