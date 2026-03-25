import { create } from "zustand";
// --- MANUTENÇÃO: Importação sem .js conforme as boas práticas do Vite ---
import { leadService } from "../services/leadService";


export const useLeadStore = create((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  viewingUserName: "",

  
  // Função auxiliar para processar dados vindos do backend
  _processLeads: (data) => data.map((lead) => ({
    ...lead,
    state: lead.state ? parseInt(lead.state, 10) : 1,
    formattedDate: lead.date
      ? new Date(lead.date.split(".")[0]).toLocaleDateString("pt-PT")
      : "Sem data",
  })),

  // --- BUSCA DE DADOS ---
  fetchMyLeads: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await leadService.getLeads(userRole, filters);
      const processed = get()._processLeads(data);
      set({ 
        leads: processed, 
        loading: false, 
        viewingUserName: processed.length > 0 ? processed[0].name : "" 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // --- REINTEGRAÇÃO: Função para criar Leads (Add) ---
  addLead: async (leadDto, userRole, targetUserId = null) => {
    set({ loading: true, error: null });
    try {
      const newLead = await leadService.createLead(leadDto, userRole, targetUserId);
      const processed = get()._processLeads([newLead])[0];
      
      set((state) => ({
        leads: [processed, ...state.leads],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // --- REINTEGRAÇÃO: Função para editar Leads (Update) ---
  updateLead: async (id, leadDto, userRole) => {
    set({ loading: true });
    try {
      const updatedLead = await leadService.updateLead(id, leadDto, userRole);
      const processed = get()._processLeads([updatedLead])[0];

      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? processed : l)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // --- GESTÃO DE LIXEIRA E SEGURANÇA ---

  // Eliminação Individual (Proteção contra Hard Delete acidental por utilizador comum)
  deleteLead: async (id, userRole, permanent = false) => {
    // ALTERAÇÃO: Forçamos que apenas ADMIN pode fazer eliminação permanente
    const isActuallyPermanent = (userRole === "ADMIN") && permanent;
    
    try {
      await leadService.deleteLead(id, userRole, isActuallyPermanent);
      // Remove da lista local para atualizar o UI imediatamente
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      return true;
    } catch (err) { 
      set({ error: err.message }); 
      return false; 
    }
  },

  // Restaurar Lead Individual
  restoreLead: async (id, leadData) => {
    set({ loading: true });
    try {
      // O backend usa o superAdminUpdate para restauro individual enviando softDelete: false
      const updatedData = { ...leadData, softDelete: false };
      await leadService.updateLead(id, updatedData, "ADMIN");
      
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

  // --- AÇÕES EM MASSA (ADMIN) ---
  handleBulkAction: async (userId, actionType, currentUserRole, currentFilters) => {
    if (!userId) return false;
    set({ loading: true });
    try {
      if (actionType === "RESTORE_ALL") {
        await leadService.restoreAllFromUser(userId);
      } else if (actionType === "SOFT_DELETE_ALL") {
        await leadService.softDeleteAllFromUser(userId);
      }
      // Pedimos à store para ir buscar as leads novamente à API
      // Isto garante 100% que o ecrã vai mostrar exatamente o que está na base de dados
      await get().fetchMyLeads(currentUserRole, currentFilters);
      
      set({loading: false }); 
      return true;
    } catch (err) { 
      set({ error: err.message, loading: false }); 
      return false; 
    }
  },

  // --- AUXILIARES ---
  setViewingUserName: (name) => set({ viewingUserName: name }),
  getLeadsByState: (stateId) => get().leads.filter((l) => l.state === stateId),
}));