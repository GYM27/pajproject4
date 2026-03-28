import React, { useEffect, useState } from "react";
import { Container, Spinner, Button } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// Componentes extraídos
import KanbanHeader from "../components/Leads/KanbanHeader.jsx";
import KanbanColumn from "../components/Leads/KanbanColumn";
import DynamicModal from "../components/DynamicModal";
import EditLeadForm from "../components/Leads/EditLeadForm";
import NewLeadForm from "../components/Leads/NewLeadForm";

const COLUMNS_DEF = [
  { id: 1, title: "Novo", color: "#007bff" },
  { id: 2, title: "Em Análise", color: "#ffc107" },
  { id: 3, title: "Proposta", color: "#17a2b8" },
  { id: 4, title: "Ganho", color: "#28a745" },
  { id: 5, title: "Perdido", color: "#dc3545" },
];

const LeadsKanban = () => {
  const { leads, loading, fetchMyLeads, deleteLead, restoreLead, handleBulkAction } = useLeadStore();
  const { userRole, firstName: currentUserName } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  const [isTrashMode, setIsTrashMode] = useState(false);
  
  const [modalConfig, setModalConfig] = useState({ show: false, title: "", type: null, data: null });
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  useEffect(() => {
    if (isAdmin) userService.getAllUsers().then(setUsers).catch(console.error);
  }, [isAdmin]);

  useEffect(() => {
    fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode });
  }, [userRole, filters.userId, isTrashMode, fetchMyLeads]);

  // AÇÕES DE MODAL
  const modalActions = {
    openEdit: (lead) => setModalConfig({ show: true, title: "Editar", type: "EDIT_LEAD", data: lead }),
    openCreate: (state = 1) => setModalConfig({ show: true, title: "Criar Nova Lead", type: "CREATE_LEAD", data: { state } }),
    openDeleteConfirm: (lead) => setModalConfig({ show: true, title: "Mover para a Lixeira", type: "DELETE_CONFIRM", data: lead }),
    openBulkDeleteConfirm: () => filters.userId && setModalConfig({ show: true, title: "Confirmar Limpeza", type: "BULK_DELETE", data: { userId: filters.userId } }),
    openEmptyTrashConfirm: () => filters.userId && setModalConfig({ show: true, title: "Esvaziar Lixeira Definitivamente", type: "BULK_DELETE", data: { userId: filters.userId } }),
  };

  // FUNÇÕES DE CARTÃO
  const cardActions = {
    onEdit: modalActions.openEdit,
    onDeleteConfirm: modalActions.openDeleteConfirm,
    onRestore: (lead) => restoreLead(lead.id, lead),
    onHardDelete: (lead) => {
      if (window.confirm("Esta ação é irreversível. Deseja mesmo eliminar?")) deleteLead(lead.id, userRole, true);
    }
  };

  if (loading && leads.length === 0) {
    return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p>A carregar painel...</p></div>;
  }

  const selectedUser = users.find(u => String(u.id) === String(filters.userId));
  const displayName = isAdmin ? (selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "GERAL ADMIN") : currentUserName;

  return (
    <Container fluid className="mt-4 px-4">
      {/* 1. CABEÇALHO LIMPO */}
      <KanbanHeader 
        displayName={displayName} leadsCount={leads.length} isTrashMode={isTrashMode} setIsTrashMode={setIsTrashMode}
        isAdmin={isAdmin} filters={filters} setFilters={setFilters} users={users}
        actions={{
          ...modalActions,
          onRestoreAll: () => handleBulkAction(filters.userId, "RESTORE_ALL", userRole, { userId: filters.userId, softDeleted: true })
        }}
      />

      {/* 2. ZONA KANBAN */}
      <div className="d-flex gap-3 pb-4" style={{ overflowX: "auto", minHeight: "80vh", alignItems: "flex-start" }}>
        {COLUMNS_DEF.map((col) => (
          <KanbanColumn 
            key={col.id} col={col} 
            leads={leads.filter((l) => l.state === col.id)} 
            isTrashMode={isTrashMode} isAdmin={isAdmin} 
            onAddClick={modalActions.openCreate} 
            cardActions={cardActions} 
          />
        ))}
      </div>

      {/* 3. MODAIS */}
      <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
        {modalConfig.type === "EDIT_LEAD" && <EditLeadForm leadData={modalConfig.data} onSuccess={() => { fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode }); closeModal(); }} onCancel={closeModal} />}
        {modalConfig.type === "CREATE_LEAD" && <NewLeadForm targetUserId={filters.userId} initialState={modalConfig.data.state} onSuccess={() => { fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode }); closeModal(); }} onCancel={closeModal} />}
        {modalConfig.type === "DELETE_CONFIRM" && (
          <div className="p-3 text-center">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: "2rem" }}></i>
            <p className="mt-3">Enviar <strong>{modalConfig.data?.title}</strong> para a lixeira?</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { if (await deleteLead(modalConfig.data.id, userRole, false)) closeModal(); }}>Confirmar</Button>
            </div>
          </div>
        )}
        {modalConfig.type === "BULK_DELETE" && (
           <div className="p-3 text-center">
            <i className="bi bi-exclamation-octagon text-danger" style={{ fontSize: "2.5rem" }}></i>
            <p className="mt-3">Mover <strong>TODAS</strong> as leads para a lixeira?</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { if (await handleBulkAction(filters.userId, "SOFT_DELETE_ALL", userRole, { userId: filters.userId })) closeModal(); }}>Sim, Mover Tudo</Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </Container>
  );
};

export default LeadsKanban;