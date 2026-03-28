import api from "./api";

export const clientsService = {
  // ROTEADOR CENTRAL DE LISTAGEM
  getClients: async (userRole, filters = {}) => {
    const { userId, showTrash } = filters;

    // 1. SE O ECRÃ PEDIR A LIXEIRA
    if (showTrash) {
      if (userId) {
        // Lixeira de um user específico (Mapeia para @GET /clients/user/{userId}/trash)
        return await api(`/clients/user/${userId}/trash`, "GET");
      } else {
        // Lixeira Global (Mapeia para @GET /clients/trash)
        return await api("/clients/trash", "GET");
      }
    }

    // 2. SE O ECRÃ PEDIR OS ATIVOS (Padrão)
    const params = new URLSearchParams();
    if (userRole === "ADMIN" && userId) {
      params.append("userId", userId);
    }

    const queryString = params.toString();
    const url = queryString ? `/clients?${queryString}` : "/clients";

    return await api(url, "GET");
  },

  // --- Rota para a Lixeira do Admin ---
  // Mapeia para @GET /clients/user/{userId}/trash
  getTrashByUserId: async (userId) => {
    return await api(`/clients/user/${userId}/trash`, "GET");
  },

  // Mapeia para @POST /clients no Java
  // Metodo: addClient
  createClient: async (clientDto) => {
    return await api("/clients", "POST", clientDto);
  },

  // Mapeia para @POST /clients/user/{userId} no Java
  // Metodo: createClientForUser (Exclusivo Admin)
  createClientForUser: async (userId, clientDto) => {
    return await api(`/clients/user/${userId}`, "POST", clientDto);
  },

  // Mapeia para @PUT /clients/{id} no Java
  // Metodo: updateClient
  updateClient: async (id, clientDto) => {
    return await api(`/clients/${id}`, "PUT", clientDto);
  },

  // Mapeia para @DELETE /clients/{id} no Java
  // Metodo: softDelete
  softDeleteClient: async (id) => {
    return await api(`/clients/${id}`, "DELETE");
  },

  // --- Verbo PATCH conforme o Java ---
  // Mapeia para @PATCH /clients/{id}/restore no Java
  // Metodo: restoreClient
  restoreClient: async (id) => {
    return await api(`/clients/${id}/restore`, "PATCH");
  },

  // Mapeia para @DELETE /clients/{id}/permanent no Java
  // Metodo: permanentDelete (Hard Delete - Admin)
  permanentDeleteClient: async (id) => {
    return await api(`/clients/${id}/permanent`, "DELETE");
  },

  // --- ALTERAÇÃO: Rotas de Massa corrigidas para /status/... ---
  // Mapeia para @PATCH /clients/user/{userId}/status/deactivate-all no Java
  // Metodo: softDeleteAllUserClients
  softDeleteAllFromUser: async (userId) => {
    return await api(`/clients/user/${userId}/status/deactivate-all`, "PATCH");
  },

  // Mapeia para @PATCH /clients/user/{userId}/status/activate-all no Java
  // Metodo: restoreAllUserClients
  restoreAllFromUser: async (userId) => {
    return await api(`/clients/user/${userId}/status/activate-all`, "PATCH");
  },

  // Mapeia para @DELETE /clients/user/{userId}/trash no Java
  // Metodo: emptyTrash
  emptyTrashByUserId: async (userId) => {
    return await api(`/clients/user/${userId}/trash`, "DELETE");
  },

  // Mapeia para @GET /clients/trash no Java
  // Metodo: getAllDeletedClients (Admin - Lixeira global)
  getAllTrash: async () => {
    return await api("/clients/trash", "GET");
  }
};