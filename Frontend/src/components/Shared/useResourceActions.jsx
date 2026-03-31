import { useNavigate } from "react-router-dom";

export const useResourceActions = (openModal, filters, stores) => {
    const navigate = useNavigate();
    const { leadStore, clientStore, userRole } = stores;

    // Variável auxiliar para verificar permissões
    const isAdmin = userRole === "ADMIN";

    // --- LÓGICA DE LEADS ---
    const leadActions = {
        // Ações Base (Todos)
        onView: (lead) => navigate(`/leads/${lead.id}`),
        onEdit: (lead) => openModal("EDIT_LEAD", "Editar Lead", lead),
        onDelete: (lead) => openModal("SOFT_DELETE", "Mover para Lixeira", lead),
        openCreate: (stateId = 1) => navigate("/leads/new", { state: { targetId: filters?.userId, initialState: stateId } }),

        // Ações Bulk (Todos)
        onBulkDelete: () => openModal("BULK_SOFT_DELETE", "Mover Tudo para Lixeira", { userId: filters?.userId }),

        // AÇÕES EXCLUSIVAS DE ADMIN (Individuais e Bulk)
        // Se for ADMIN cria a função que abre o modal, se não, fica undefined
        onRestore: isAdmin ? (lead) => openModal("RESTORE_LEAD", "Restaurar Lead", lead) : undefined,
        onRestoreAll: isAdmin ? () => openModal("RESTORE_ALL", "Restaurar Todos os Itens", { userId: filters?.userId }) : undefined,
        onEmptyTrash: isAdmin ? () => openModal("BULK_HARD_DELETE", "Esvaziar Lixeira Definitivamente", { userId: filters?.userId }) : undefined,
    };

    // --- LÓGICA DE CLIENTES ---
    const clientActions = {
        // Ações Base (Todos)
        onView: (client) => navigate(`/clients/${client.id}`),
        onEdit: (client) => openModal("EDIT_CLIENT", "Editar Cliente", client),
        onDelete: (client) => openModal("SOFT_DELETE", "Remover Cliente", client),
        openCreate: () => navigate("/clients/new", { state: { targetId: filters?.userId } }),

        // Ações Bulk (Todos)
        onBulkDelete: () => openModal("BULK_SOFT_DELETE", "Mover Tudo para Lixeira", { userId: filters?.userId }),

        // AÇÕES EXCLUSIVAS DE ADMIN (Individuais e Bulk)
        onRestore: isAdmin ? (client) => openModal("RESTORE_CLIENT", "Restaurar Cliente", client) : undefined,
        onRestoreAll: isAdmin ? () => openModal("RESTORE_ALL", "Restaurar Todos os Itens", { userId: filters?.userId }) : undefined,
        onEmptyTrash: isAdmin ? () => openModal("BULK_HARD_DELETE", "Esvaziar Lixeira Definitivamente", { userId: filters?.userId }) : undefined,
    };

    return {
        leads: {
            ...leadActions,
            // O mapeamento dos botões dos Cards fica agora super limpo
            cardActions: {
                onView: leadActions.onView,
                onEdit: leadActions.onEdit,
                onDelete: leadActions.onDelete,
                onRestore: leadActions.onRestore,
                onHardDelete: leadActions.onHardDelete,
            }
        },
        clients: {
            ...clientActions,

            cardActions: {
               // onView: clientActions.onView,
                onEdit: clientActions.onEdit,
                onDelete: clientActions.onDelete,
                onRestore: clientActions.onRestore,
                onHardDelete: clientActions.onHardDelete,
            }
        }
    };
};