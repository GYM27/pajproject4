import { create } from "zustand";
import { leadService } from "../services/LeadService";

export const useLeadStore = create((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  viewingUserName: "",

  // --- BUSCA DE DADOS ---
  fetchMyLeads: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await leadService.getLeads(userRole, filters);

      const processedLeads = data.map((lead) => ({
        ...lead,
        formattedDate: lead.date
          ? new Date(lead.date.split(".")[0]).toLocaleDateString("pt-PT")
          : "Sem data",
      }));

      set({
        leads: processedLeads,
        loading: false,
        viewingUserName: processedLeads.length > 0 ? processedLeads[0].name : ""
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // --- CRIAÇÃO E EDIÇÃO ---
  addLead: async (leadDto, userRole, targetUserId = null) => {
    set({ loading: true, error: null });
    try {
      const newLead = await leadService.createLead(leadDto, userRole, targetUserId);
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

  updateLead: async (id, leadDto, userRole) => {
    set({ loading: true });
    try {
      const updatedLead = await leadService.updateLead(id, leadDto, userRole);
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

  // --- LÓGICA DA LIXEIRA (REUTILIZÁVEL) ---

  // 1. Eliminação Temporária (Soft Delete)
  deleteLead: async (id, userRole) => {
    try {
      await leadService.deleteLead(id, userRole);
      // Remove da lista atual (ativos) para simular o comportamento da lixeira
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // 2. Restaurar Lead (Exclusivo Admin)
  restoreLead: async (id, userRole) => {
    set({ loading: true });
    try {
      // Chama o endpoint de undelete/restore do seu Java
      await leadService.restoreLead(id, userRole); 
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id), // Remove da lista de "apagados"
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // 3. Eliminação Permanente (Hard Delete - Exclusivo Admin)
  permanentDeleteLead: async (id, userRole) => {
    set({ loading: true });
    try {
      await leadService.permanentDeleteLead(id, userRole); // DELETE real na BD
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Adicionar à useLeadStore.js
// 1. Restaurar Todas as Leads (Admin)
restoreAllLeads: async (targetUserId, userRole) => {
  try {
    await leadService.restoreAllLeads(targetUserId, userRole); // Endpoint POST .../restoreall
    set({ leads: [] }); // Limpa a lista da lixeira após restaurar
    return true;
  } catch (err) { set({ error: err.message }); return false; }
},

// 2. Esvaziar Lixeira / Apagar Tudo Permanentemente (Admin)
emptyTrashLeads: async (targetUserId, userRole) => {
  try {
    await leadService.emptyTrash(targetUserId, userRole); // Endpoint DELETE .../emptytrash
    set({ leads: [] });
    return true;
  } catch (err) { set({ error: err.message }); return false; }
},

  // --- AUXILIARES ---
  setViewingUserName: (name) => set({ viewingUserName: name }),
  
  getLeadsByState: (stateId) => get().leads.filter((l) => l.state === stateId),
}));