import api from './api';

export const clientsService = {
    // GET /clients ou GET /clients?userId=X
    getClients: async (userRole, filters = {}) => {
        const params = new URLSearchParams();
        if (userRole === "ADMIN" && filters.userId) params.append("userId", filters.userId);

        const queryString = params.toString();
        const url = queryString ? `/clients?${queryString}` : "/clients";
        return await api(url);
    },

    // --- ALTERAÇÃO: Rota correta para a Lixeira do Admin ---
    // Mapeia para @GET /clients/user/{userId}/trash
    getTrashByUserId: async (userId) => {
        return await api(`/clients/user/${userId}/trash`, "GET");
    },

    createClient: async (clientDto) => {
        return await api("/clients", "POST", clientDto);
    },

    updateClient: async (id, clientDto) => {
        return await api(`/clients/${id}`, "PUT", clientDto);
    },

    // DELETE /clients/{id} (Soft Delete)
    softDeleteClient: async (id) => {
        return await api(`/clients/${id}`, "DELETE");
    },

    // --- ALTERAÇÃO: Verbo PATCH conforme o seu Java ---
    // Mapeia para @PATCH /clients/{id}/restore
    restoreClient: async (id) => {
        return await api(`/clients/${id}/restore`, "PATCH");
    },

    // DELETE /clients/{id} (Hard Delete - Admin)
    permanentDeleteClient: async (id) => {
        return await api(`/clients/${id}`, "DELETE");
    },

    // --- ALTERAÇÃO: Rotas de Massa corrigidas para /status/... ---
    // Mapeia para @PATCH /clients/user/{userId}/status/deactivate-all
    softDeleteAllFromUser: async (userId) => {
        return await api(`/clients/user/${userId}/status/deactivate-all`, "PATCH");
    },

    // Mapeia para @PATCH /clients/user/{userId}/status/activate-all
    restoreAllFromUser: async (userId) => {
        return await api(`/clients/user/${userId}/status/activate-all`, "PATCH");
    },

    // Mapeia para @DELETE /clients/user/{userId}/trash
    emptyTrashByUserId: async (userId) => {
        return await api(`/clients/user/${userId}/trash`, "DELETE");
    },

    getAllTrash: async () => {
    return await api("/clients/trash", "GET");
    }
};