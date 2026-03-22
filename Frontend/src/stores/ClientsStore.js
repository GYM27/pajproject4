import { create } from "zustand";

export const useClientStore = create((set, get) => ({
  // --- ESTADO (CAMPOS DE MEMÓRIA) ---
  clients: [],
  loading: false,
  error: null,

  // --- AÇÕES (LÓGICA DE NEGÓCIO) ---

  // 1. Carregar Clientes do Utilizador (GET /me)
  fetchMyClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        "http://localhost:8080/LuisF-proj4/rest/clients",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            token: localStorage.getItem("token"),
          },
        },
      );

      if (!response.ok) throw new Error("Erro ao carregar clientes");

      const data = await response.json();
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 2. Adicionar Cliente (POST)
  addClient: async (clientDto) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        "http://localhost:8080/LuisF-proj4/rest/clients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(clientDto),
        },
      );

      if (!response.ok) throw new Error("Dados inválidos ou erro no servidor");

      const newClient = await response.json();

      // ATUALIZAÇÃO IMUTÁVEL: Adiciona o novo cliente à lista existente
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

  // 3. Editar Cliente (PUT)
  updateClient: async (id, clientDto) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:8080/LuisF-proj4/rest/clients/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(clientDto),
        },
      );

      if (!response.ok) throw new Error("Erro ao atualizar cliente");

      const updatedClient = await response.json();

      // ATUALIZAÇÃO IMUTÁVEL: Substitui apenas o cliente editado no array
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

  // 4. Soft Delete (POST /{id}/delete)
  deleteClient: async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/LuisF-proj4/rest/clients/${id}`,
        {
          method: "DELETE",
          headers: { token: localStorage.getItem("token") },
        },
      );

      if (!response.ok) throw new Error("Erro ao remover cliente");

      // REMOÇÃO LOCAL: Filtra o cliente da lista para que ele desapareça do ecrã
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },
}));
