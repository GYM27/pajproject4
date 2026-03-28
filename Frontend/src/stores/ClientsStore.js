import { create } from "zustand";
import { clientsService } from "../services/clientsService";

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // Guardamos o contexto atual para poder fazer refetch após qualquer ação
  _currentUserRole: null,
  _currentFilters: {},

  fetchClients: async (userRole, filters = {}) => {
    set({
      loading: true,
      error: null,
      // Memoriza o contexto atual
      _currentUserRole: userRole,
      _currentFilters: filters,
    });
    try {
      const apiFilters = {
        userId: filters.userId || null,
        showTrash: !!filters.showTrash,
      };
      const data = await clientsService.getClients(userRole, apiFilters);
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Refetch interno — usa o contexto memorizado
  _refetch: async () => {
    const { _currentUserRole, _currentFilters, fetchClients } = get();
    await fetchClients(_currentUserRole, _currentFilters);
  },

  // --- GESTÃO INDIVIDUAL ---


  // --- ADICIONAR NOVO CLIENTE ---
  addClient: async (clientData, targetUserId = null) => {
    set({ loading: true, error: null });
    try {
      if (targetUserId) {
        // Admin: Cria o cliente para um utilizador específico
        await clientsService.createClientForUser(targetUserId, clientData);
      } else {
        // Normal (ou Admin para si mesmo): Cria usando o token atual
        await clientsService.createClient(clientData);
      }

      // Opcional: Atualiza a lista na store
      await get()._refetch();
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },


  deleteClient: async (id, isPermanent = false) => {
    set({ loading: true });
    try {
      if (isPermanent) {
        await clientsService.permanentDeleteClient(id);
      } else {
        await clientsService.softDeleteClient(id);
      }
      // Refetch real em vez de update local
      await get()._refetch();
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

restoreClient: async (id) => {
  
  set({ loading: true, error: null });
  
  try {
 
    await clientsService.restoreClient(id);
       
        await get()._refetch();
    
        return true;
  } catch (error) {
    console.error('❌ [RESTORE] Erro:', error.message);
    set({ error: error.message, loading: false });
    return false;
  }
},

  // updateClient (necessário para o EditClientForm)
  updateClient: async (id, clientDto) => {
    set({ loading: true });
    try {
      await clientsService.updateClient(id, clientDto);
      await get()._refetch();
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // --- AÇÕES EM MASSA ---
  handleBulkAction: async (
    userId,
    actionType,
    currentUserRole,
    currentFilters,
  ) => {
    if (!userId) return false;

    // 1. Ativa o loading e limpa a lista atual para forçar o React a "sentir" a mudança
    set({ loading: true, clients: [] });

    try {
      switch (actionType) {
        case "RESTORE_ALL":
          await clientsService.restoreAllFromUser(userId);
          break;
        case "DEACTIVATE_ALL":
          await clientsService.softDeleteAllFromUser(userId);
          break;
        case "EMPTY_TRASH":
          await clientsService.emptyTrashByUserId(userId);
          break;
        default:
          break;
      }

      // 2. Pequena pausa (opcional) para garantir que o Java terminou a transação na BD
      // Alguns servidores DB demoram milissegundos a refletir o UPDATE
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. Chama o fetch com uma cópia limpa dos filtros
      await get().fetchClients(currentUserRole, { ...currentFilters });

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));
