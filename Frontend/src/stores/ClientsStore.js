import { create } from "zustand";
import api from "../services/api"; // Importa o motor central

export const useClientStore = create((set) => ({
  // --- ESTADO ---
  clients: [],
  loading: false,
  error: null,

  // --- AÇÕES ---

  // 1. Carregar Clientes (GET /clients)
  fetchMyClients: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Se for Admin e houver filtro de lixeira, a rota muda no Java
      const endpoint = (userRole === "ADMIN" && filters.showDeleted) 
        ? "/clients/admin/deleted" 
        : "/clients";
        
      const data = await api(endpoint);
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 2. Adicionar Cliente (POST /clients)
  addClient: async (clientDto) => {
    set({ loading: true, error: null });
    try {
      const newClient = await api("/clients", "POST", clientDto);
      set((state) => ({
        clients: [...state.clients, newClient],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // 3. Editar Cliente (PUT /clients/{id})
  updateClient: async (id, clientDto) => {
    set({ loading: true, error: null });
    try {
      const updatedClient = await api(`/clients/${id}`, "PUT", clientDto);
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

  // 4. Mover para Lixeira (Soft Delete - POST /clients/{id}/delete)
  deleteClient: async (id) => {
    set({ error: null });
    try {
      // Seguindo a lógica do Projeto 3: Mover para lixeira em vez de apagar real
      await api(`/clients/${id}/delete`, "POST");

      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // --- NOVAS AÇÕES DE LIXEIRA (REUTILIZÁVEIS) ---

  // 5. Restaurar Cliente (Exclusivo Admin - POST /clients/{id}/restore)
  restoreClient: async (id) => {
    set({ loading: true });
    try {
      await api(`/clients/${id}/restore`, "POST"); // Endpoint do seu Java
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id), // Remove da lista de apagados
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // 6. Eliminar Permanente (Exclusivo Admin - DELETE /clients/{id}/permanent)
  permanentDeleteClient: async (id) => {
    set({ loading: true });
    try {
      await api(`/clients/${id}/permanent`, "DELETE"); // Hard Delete real
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));