import { create } from "zustand";
import { clientsService } from "../services/clientsService.js";

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // --- BUSCA ---
  fetchClients: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      let data;
      // Se estivermos a ver a lixeira como Admin
      if (userRole === "ADMIN" && filters.showTrash && filters.userId) {
        data = await clientsService.getTrashByUserId(filters.userId);
      } else {
        data = await clientsService.getClients(userRole, filters);
      }
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
      set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
      return true;
    } catch (err) { set({ error: err.message }); return false; }
  },

  // --- REINTEGRAÇÃO: Função para editar Clientes (Update) ---
updateClient: async (id, clientDto) => {
  set({ loading: true, error: null });
  try {
    const updatedClient = await clientsService.updateClient(id, clientDto);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
      loading: false,
    }));
    return true;
  } catch (err) {
    set({ error: err.message, loading: false });
    return false;
  }
},

  restoreClient: async (id) => {
    try {
      await clientsService.restoreClient(id); // Usa PATCH internamente
      set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
      return true;
    } catch (err) { set({ error: err.message }); return false; }
  },

  // --- AÇÕES EM MASSA (ADMIN) ---
  // ALTERAÇÃO: Recebe também o userRole e os filtros para poder atualizar o ecrã a seguir
  handleBulkAction: async (userId, actionType, currentUserRole, currentFilters) => {
    set({ loading: true });
    try {
      switch (actionType) {
        case 'RESTORE_ALL': await clientsService.restoreAllFromUser(userId); break;
        case 'DEACTIVATE_ALL': await clientsService.softDeleteAllFromUser(userId); break;
        case 'EMPTY_TRASH': await clientsService.emptyTrashByUserId(userId); break;
        default: break;
      }
      // Pede à API os dados atualizados em vez de limpar a lista
      await get().fetchClients(currentUserRole, currentFilters);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));