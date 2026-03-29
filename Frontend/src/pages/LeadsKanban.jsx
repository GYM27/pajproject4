import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// Componentes da Pasta Shared
import { useModalManager } from "../components/useModalManager.jsx";
import { useResourceActions } from "../components/Shared/useResourceActions.jsx";
import GenericModalContent from "../components/Shared/GenericModalContent";

// Componentes de Leads
import KanbanHeader from "../components/Leads/KanbanHeader.jsx";
import KanbanColumn from "../components/Leads/KanbanColumn";
import DynamicModal from "../components/DynamicModal";
import EditLeadForm from "../components/Leads/EditLeadForm";

const COLUMNS_DEF = [
  { id: 1, title: "Novo", color: "#007bff" },
  { id: 2, title: "Em Análise", color: "#ffc107" },
  { id: 3, title: "Proposta", color: "#17a2b8" },
  { id: 4, title: "Ganho", color: "#28a745" },
  { id: 5, title: "Perdido", color: "#dc3545" },
];

const LeadsKanban = () => {
  // 1. Estados e Stores
  const leadStore = useLeadStore();
  const { userRole, firstName: currentUserName } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  const [isTrashMode, setIsTrashMode] = useState(false);

  // 2. Gestão de Modais via Shared Hook
  const { modalConfig, openModal, closeModal } = useModalManager();

  // 3. Ações Centralizadas (Shared Logic)
  const { leads: actions } = useResourceActions(openModal, filters, { leadStore, userRole });

  // 4. Carregamento de Dados
  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    leadStore.fetchMyLeads(userRole, {
      userId: filters.userId,
      softDeleted: isTrashMode
    });
  }, [userRole, filters.userId, isTrashMode, leadStore.fetchMyLeads]);

  if (leadStore.loading && leadStore.leads.length === 0) {
    return (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p>A carregar painel...</p>
        </div>
    );
  }

  // Definição do nome a exibir no cabeçalho
  const selectedUser = users.find(u => String(u.id) === String(filters.userId));
  const displayName = isAdmin
      ? (selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "GERAL ADMIN")
      : currentUserName;

  return (
      <Container fluid className="mt-4 px-4">
        {/* Cabeçalho com ações injetadas do hook shared */}
        <KanbanHeader
            displayName={displayName}
            leadsCount={leadStore.leads.length}
            isTrashMode={isTrashMode}
            setIsTrashMode={setIsTrashMode}
            isAdmin={isAdmin}
            filters={filters}
            setFilters={setFilters}
            users={users}
            actions={{
              ...actions,
              onRestoreAll: () => leadStore.handleBulkAction(
                  filters.userId,
                  "RESTORE_ALL",
                  userRole,
                  { userId: filters.userId, softDeleted: true }
              )
            }}
        />

        {/* Zona Kanban com cardActions injetados do hook shared */}
        <div className="d-flex gap-3 pb-4" style={{ overflowX: "auto", minHeight: "80vh", alignItems: "flex-start" }}>
          {COLUMNS_DEF.map((col) => (
              <KanbanColumn
                  key={col.id}
                  col={col}
                  leads={leadStore.leads.filter((l) => l.state === col.id)}
                  isTrashMode={isTrashMode}
                  isAdmin={isAdmin}
                  onAddClick={actions.openCreate}
                  cardActions={actions.cardActions}
              />
          ))}
        </div>

        {/* Modal Único Dinâmico */}
        <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
          {modalConfig.type === "EDIT_LEAD" ? (
              <EditLeadForm
                  leadData={modalConfig.data}
                  onSuccess={() => {
                    leadStore.fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode });
                    closeModal();
                  }}
                  onCancel={closeModal}
              />
          ) : (
              /* Conteúdo Genérico para Confirmações (Soft Delete, Hard Delete, Bulk) */
              <GenericModalContent
                  type={modalConfig.type}
                  data={modalConfig.data}
                  onCancel={closeModal}
                  onConfirm={async (data) => {
                      // 1. Criamos um "dicionário" com as ações correspondentes a cada tipo
                      const actionMap = {
                          "SOFT_DELETE": () => leadStore.deleteLead(data.id, userRole, false),
                          "HARD_DELETE": () => leadStore.deleteLead(data.id, userRole, true),
                          "BULK_SOFT_DELETE": () => leadStore.handleBulkAction(data.userId, "SOFT_DELETE_ALL", userRole, { userId: filters.userId }),
                          "BULK_HARD_DELETE": () => leadStore.handleBulkAction(data.userId, "EMPTY_TRASH", userRole, { userId: filters.userId })
                      };

                      // 2. Procuramos a função certa com base no tipo de modal atual
                      const actionToExecute = actionMap[modalConfig.type];

                      // 3. Se a função existir, executamos!
                      if (actionToExecute) {
                          const success = await actionToExecute();
                          if (success) closeModal();
                      }
                  }}
              />
          )}
        </DynamicModal>
      </Container>
  );
};

export default LeadsKanban;