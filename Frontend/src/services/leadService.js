import api from './api';

export const leadService = {
  // GET /leads (User) ou GET /leads/admin (com QueryParams)
  getLeads: async (role, filters = {}) => {
    const isAdmin = role === "ADMIN";
    const endpoint = isAdmin ? "/leads/admin" : "/leads";
    
    const params = new URLSearchParams();

    // 
    // O utilizador comum precisa de enviar softDeleted para ver a sua lixeira no endpoint /leads
    if (filters.state) params.append("state", filters.state);
    
    if (filters.softDeleted !== undefined) {
      params.append("softDeleted", filters.softDeleted);
    }

    // --- ALTERAÇÃO: O userId continua a ser exclusivo do Admin ---
    if (isAdmin && filters.userId) {
      params.append("userId", filters.userId);
    }
    
    const queryString = params.toString();
    const finalUrl = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return await api(finalUrl);
  },

  // POST /leads ou POST /leads/admin/{userId}
  createLead: async (leadData, role, targetUserId = null) => {
    if (role === "ADMIN" && targetUserId) {
      return await api(`/leads/admin/${targetUserId}`, "POST", leadData);
    }
    return await api("/leads", "POST", leadData);
  },

  // PUT /leads/{id} ou PUT /leads/admin/{id}
  updateLead: async (id, leadData, role) => {
    const endpoint = role === "ADMIN" ? `/leads/admin/${id}` : `/leads/${id}`;
    return await api(endpoint, "PUT", leadData);
  },

  // DELETE /leads/{id} (Soft Delete) ou DELETE /admin/{id} (Hard Delete)
  deleteLead: async (id, role, permanent = false) => {
    // Só tenta o Hard Delete se for ADMIN e se o pedido for permanente
    if (role === "ADMIN" && permanent) {
      return await api(`/leads/admin/${id}`, "DELETE");
    }
    // Caso contrário, faz sempre Soft Delete na rota normal
    return await api(`/leads/${id}`, "DELETE");
  },

  // Função para mover para a lixeira
softDeleteLead: async (leadId) => {
  // Como o teu Java ignora os campos nulos, podes enviar só isto:
  const payload = {
    softDeleted: true
  };
  
  // Faz o PUT para o teu endpoint adminSuperEdit
  const response = await api.put(`/leads/admin/${leadId}`, "PUT", payload);
  return response.data;
},

// Função para tirar da lixeira (Restaurar)
restoreLead: async (leadId) => {
  const payload = {
    softDeleted: false
  };
  
  const response = await api.put(`/leads/admin/${leadId}`, "PUT", payload);
  return response.data;
},

  // AÇÕES EM MASSA (ADMIN)
  softDeleteAllFromUser: async (userId) => {
    return await api(`/leads/admin/${userId}/softdeleteall`, "POST");
  },

  restoreAllFromUser: async (userId) => {
    return await api(`/leads/admin/${userId}/softundeleteall`, "POST");
  },

  emptyTrashByUserId: async (userId) => {
    return await api(`/leads/admin/${userId}/trash`, "DELETE");
  }
};