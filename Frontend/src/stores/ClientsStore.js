import { create } from "zustand";
import { clientsService } from "../services/clientsService";

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // --- BUSCA DINÂMICA ajustado para o novo findClientsWithFilters ---
  fetchClients: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      let data;
      // Agora passamos showTrash (boolean) e userId diretamente.
      // O Bean no Java decidirá se filtra por utilizador ou mostra tudo.
      const apiFilters = {
        userId: filters.userId || null,
        showTrash: !!filters.showTrash // Garante que é booleano
      };

      data = await clientsService.getClients(userRole, apiFilters);
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // --- GESTÃO INDIVIDUAL ---
  deleteClient: async (id, isPermanent = false) => {
    try {
      if (isPermanent) {
        await clientsService.permanentDeleteClient(id);
      } else {
        await clientsService.softDeleteClient(id);
      }
      // UI Update instantâneo
      set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
      return true;
    } catch (err) { 
      set({ error: err.message }); 
      return false; 
    }
  },

  restoreClient: async (id) => {
    try {
      await clientsService.restoreClient(id);
      set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
      return true;
    } catch (err) { 
      set({ error: err.message }); 
      return false; 
    }
  },

  // --- AÇÕES EM MASSA (Sincronizadas com o Bulk Update do Java) ---
  handleBulkAction: async (userId, actionType, currentUserRole, currentFilters) => {
    if (!userId) return false;
    set({ loading: true });
    try {
      switch (actionType) {
        case 'RESTORE_ALL': 
          await clientsService.restoreAllFromUser(userId); 
          break;
        case 'DEACTIVATE_ALL': 
          await clientsService.softDeleteAllFromUser(userId); 
          break;
        case 'EMPTY_TRASH': 
          await clientsService.emptyTrashByUserId(userId); 
          break;
        default: break;
      }
      
      
      // trará a lista vazia (ou atualizada) com 100% de certeza.
      await get().fetchClients(currentUserRole, currentFilters);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));