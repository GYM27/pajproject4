import { useNavigate } from "react-router-dom";

export const useResourceActions = (openModal, filters, stores) => {
    const navigate = useNavigate();
    const { leadStore, clientStore, userRole } = stores;

    // --- LÓGICA DE LEADS ---
    const leadActions = {
        onView: (lead) => navigate(`/leads/${lead.id}`), // Navega para detalhes
        onEdit: (lead) => openModal("EDIT_LEAD", "Editar Lead", lead), // Abre modal de edição
        onDelete: (lead) => openModal("SOFT_DELETE", "Mover para Lixeira", lead), // Abre confirmação
        openCreate: (stateId = 1) => navigate("/leads/new", {
            state: { targetId: filters?.userId, initialState: stateId }
        }),
        onBulkDelete: () => openModal("BULK_SOFT_DELETE", "Mover Tudo para Lixeira", { userId: filters?.userId }),
        onRestoreAll: () => leadStore.handleBulkAction(filters?.userId, "RESTORE_ALL", userRole, filters),
        onEmptyTrash: () => openModal("BULK_HARD_DELETE", "Esvaziar Lixeira Definitivamente", { userId: filters?.userId }),
    };

    // --- LÓGICA DE CLIENTES ---
    const clientActions = {
        onView: (client) => navigate(`/clients/${client.id}`),
        onEdit: (client) => openModal("EDIT_CLIENT", "Editar Cliente", client),
        onDelete: (client) => openModal("SOFT_DELETE", "Remover Cliente", client),
        openCreate: () => navigate("/clients/new", { state: { targetId: filters?.userId } }),
        onBulkDelete: () => openModal("BULK_SOFT_DELETE", "Mover Tudo para Lixeira", { userId: filters?.userId }),
        onRestoreAll: () => clientStore.handleBulkAction(filters?.userId, "RESTORE_ALL", userRole, filters),
        onEmptyTrash: () => clientStore.handleBulkAction(filters?.userId, "EMPTY_TRASH", userRole, filters),
    };

    return {
        leads: {
            ...leadActions,
            cardActions: {
                onView: leadActions.onView,   // Ativa o ícone do Olho
                onEdit: leadActions.onEdit,   // Ativa o ícone do Lápis
                onDelete: leadActions.onDelete, // Ativa o ícone do Lixo
                //Passa a função se for ADMIN, caso contrário passa 'undefined'
                onRestore: userRole === "ADMIN" ? (lead) => leadStore.restoreLead(lead.id, lead) : undefined,
                onHardDelete: (lead) => openModal("HARD_DELETE", "Eliminar Permanente", lead),
            }
        },
        clients: {
            ...clientActions,
            cardActions: {
                // onView: clientActions.onView,
                onEdit: clientActions.onEdit,
                onDelete: clientActions.onDelete,
                onRestore: userRole === "ADMIN" ? (client) => clientStore.restoreClient(client.id): undefined,
                onHardDelete: (client) => openModal("HARD_DELETE", "Eliminar Permanente", client),
            }
        }
    };
};