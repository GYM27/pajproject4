import { create } from "zustand";
import api from "../services/api"; // Utilizo o meu serviço central para gerir os pedidos

export const useLeadStore = create((set, get) => ({
  // Defino o estado inicial para as leads, controlo de carregamento e erros
  leads: [],
  loading: false,
  error: null,

  // --- Funções de interação com a API ---

  // Vou buscar todas as minhas leads ao servidor
  fetchMyLeads: async () => {
    set({ loading: true, error: null });
    try {
      // Chamo o endpoint /leads que já injeta o meu token automaticamente
      const data = await api("/leads");
      set({ leads: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Envio os dados de uma nova lead para o sistema
  addLead: async (leadDto) => {
    set({ loading: true, error: null });
    try {
      const newLead = await api("/leads", "POST", leadDto);

      // Se o servidor criar com sucesso, adiciono logo à minha lista local
      // Uso o spread para manter a imutabilidade do estado
      set((state) => ({
        leads: [newLead, ...state.leads],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Atualizo os dados ou o estado de uma lead específica
  updateLead: async (id, leadDto) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await api(`/leads/${id}`, "PUT", leadDto);

      // Percorro a lista e substituo apenas a lead que acabei de editar
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Removo uma lead (o backend trata de fazer o soft delete)
  deleteLead: async (id) => {
    set({ error: null });
    try {
      await api(`/leads/${id}`, "DELETE");

      // Para a interface ser rápida, filtro a lead da lista local imediatamente
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // Função utilitária para filtrar leads por estado (ex: para os cards do dashboard)
  getLeadsByState: (stateId) => {
    return get().leads.filter((l) => l.state === stateId);
  },
}));
