import api from './api';

/**
 * Serviço para gestão de dados do utilizador.
 */
export const userService = {
    /**
     * Obtém os dados do perfil do utilizador autenticado através do endpoint /me.
     * O wrapper 'api' injeta automaticamente o token do localStorage no Header.
     */
    getMe: async () => {
        // Chamamos a API centralizada indicando apenas o caminho e o método.
        // O tratamento de erros (401, 403, 500) já é feito pelo api.js.
        return await api("/users/me", "GET");
    }
};