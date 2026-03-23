import api from './api';

export const leadService = {
  // Centraliza a busca com filtros e distinção Admin/User
  getLeads: async (role, filters = {}) => {
    const endpoint = role === "ADMIN" ? "/leads/admin" : "/leads";
    
    // Constrói query string dinamicamente
    const params = new URLSearchParams();
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.state) params.append("state", filters.state);
    
    const queryString = params.toString();
    const finalUrl = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return await api(finalUrl);
  },

  // Criação (Normal ou Atribuição por Admin)
  createLead: async (leadData, role, targetUserId = null) => {
    if (role === "ADMIN" && targetUserId) {
      return await api(`/leads/admin/${targetUserId}`, "POST", leadData);
    }
    return await api("/leads", "POST", leadData);
  },

  // Update dinâmico
  updateLead: async (id, leadDto, role) => {
    const endpoint = role === "ADMIN" ? `/leads/admin/${id}` : `/leads/${id}`;
    return await api(endpoint, "PUT", leadDto);
  },

  // Delete dinâmico (Soft ou Hard dependendo do Role no Backend)
  deleteLead: async (id, role) => {
    const endpoint = role === "ADMIN" ? `/leads/admin/${id}` : `/leads/${id}`;
    return await api(endpoint, "DELETE");
  }
};