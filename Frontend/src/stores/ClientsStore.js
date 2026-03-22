import { create } from "zustand";
import api from "../services/api"; // Importa o motor central

export const useClientStore = create((set) => ({
  // --- ESTADO ---
  clients: [],
  loading: false,
  error: null,

  // --- AÇÕES ---

  // 1. Carregar Clientes (GET /clients)
  fetchMyClients: async () => {
    // Otimização: Só carrega se a lista estiver vazia para evitar pedidos duplos do StrictMode
    set({ loading: true, error: null });
    try {
      // O api.js já conhece a BASE_URL e injeta o token
      const data = await api("/clients");
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

      // Atualização Imutável: Adiciona ao array local para refletir no UI sem novo fetch
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

      // Substitui apenas o objeto editado
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

  // 4. Eliminar Cliente (DELETE /clients/{id})
  deleteClient: async (id) => {
    set({ error: null });
    try {
      // Se o servidor devolver 204 No Content, o api.js retorna true
      await api(`/clients/${id}`, "DELETE");

      // Remoção Local: Retira da lista imediatamente
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },
}));
