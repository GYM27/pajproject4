import React, { useEffect, useState } from "react";
import { Container, Card, Badge, Form, Button, Spinner } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// --- IMPORTAÇÕES DE COMPONENTES ---
import DynamicModal from "../components/DynamicModal";
import EditLeadForm from "../components/EditLeadForm";
import NewLeadForm from "../components/NewLeadForm";

const LeadsKanban = () => {
  // 1. Extraímos as funções corretas da Store
  const { leads, loading, fetchMyLeads, deleteLead, restoreLead, handleBulkAction } = useLeadStore();
  const userRole = useUserStore((state) => state.userRole);
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  
  // 2. NOVO: Estado para controlar a vista da lixeira
  const [isTrashMode, setIsTrashMode] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    type: null,
    data: null,
  });

  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  // --- FUNÇÕES DE ABERTURA DE MODAL ---
  const openEdit = (lead) => {
    setModalConfig({ show: true, title: `Editar`, type: "EDIT_LEAD", data: lead });
  };

  const openCreate = (initialState = 1) => {
    setModalConfig({ show: true, title: "Criar Nova Lead", type: "CREATE_LEAD", data: { state: initialState } });
  };

  const openDeleteConfirm = (lead) => {
    setModalConfig({ show: true, title: "Mover para a Lixeira", type: "DELETE_CONFIRM", data: lead });
  };

  const openBulkDeleteConfirm = () => {
    if (!filters.userId) return;
    setModalConfig({ show: true, title: "Confirmar Limpeza", type: "BULK_DELETE", data: { userId: filters.userId } });
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  // 3. NOVO: O fetchMyLeads agora reage ao isTrashMode
  useEffect(() => {
    fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode });
  }, [userRole, filters.userId, isTrashMode, fetchMyLeads]);

  const columns = [
    { id: 1, title: "Novo", color: "#007bff" },
    { id: 2, title: "Em Análise", color: "#ffc107" },
    { id: 3, title: "Proposta", color: "#17a2b8" },
    { id: 4, title: "Ganho", color: "#28a745" },
    { id: 5, title: "Perdido", color: "#dc3545" },
  ];

  if (loading && leads.length === 0) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">A carregar painel...</p>
      </div>
    );
  }

  const selectedUser = users.find((u) => String(u.id) === String(filters.userId));
  const displayName = isAdmin
    ? selectedUser
      ? `${selectedUser.firstName} ${selectedUser.lastName}`
      : "GERAL ADMIN"
    : useUserStore.getState().firstName; 

  return (
    <Container fluid className="mt-4 px-4">
      {/* 1. CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className={`fw-bold m-0 ${isTrashMode ? "text-danger" : "text-secondary"}`}>
            {isTrashMode ? "LIXEIRA :" : "LEADS :"} <span className="text-dark opacity-75">{displayName}</span>
          </h2>
          <p className="text-muted small m-0">
            Total: {leads.length} leads encontradas
          </p>
        </div>

        <div className="d-flex gap-3 align-items-center">        
          
          {/* Botão de Alternância da Lixeira */}
          <Button
            variant={isTrashMode ? "secondary" : "outline-secondary"}
            onClick={() => setIsTrashMode(!isTrashMode)}
          >
            <i className={`bi ${isTrashMode ? "bi-arrow-left" : "bi-trash"} me-1`}></i>
            {isTrashMode ? "Sair da Lixeira" : "Ver Lixeira"}
          </Button>

          {/* Botões que só aparecem Fora da Lixeira */}
          {!isTrashMode && (
            <>
              <Button variant="primary" onClick={() => openCreate(1)}>
                <i className="bi bi-clipboard2-plus"></i>
                Nova Lead
              </Button>

              {isAdmin && filters.userId && leads.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  onClick={openBulkDeleteConfirm}
                  title="Limpar todas as leads deste utilizador"
                >
                  <i className="bi bi-trash-fill"></i> Mover Tudo
                </Button>
              )}
            </>
          )}

          {/* Botões que só aparecem Na Lixeira (Admin) */}
          {isTrashMode && isAdmin && filters.userId && leads.length > 0 && (
             <Button
                variant="success"
                onClick={() => handleBulkAction(filters.userId, "RESTORE_ALL", userRole, { userId: filters.userId, softDeleted: true })}
             >
               <i className="bi bi-arrow-counterclockwise me-1"></i> Restaurar Tudo
             </Button>
          )}

          {/* Filtro de Responsável (Admin) */}
          {isAdmin && (
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold small text-secondary">Responsável:</span>
              <Form.Select
                size="sm"
                style={{ width: "200px" }}
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              >
                <option value="">Todos</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </Form.Select>
            </div>
          )}
        </div>
      </div>

      {/* 2. ZONA KANBAN */}
      <div className="d-flex gap-3 pb-4" style={{ overflowX: "auto", minHeight: "80vh", alignItems: "flex-start" }}>
        {columns.map((col) => {
          const leadsNaColuna = leads.filter((l) => l.state === col.id);

          return (
            <div key={col.id} className="kanban-column bg-light rounded p-2 shadow-sm" style={{ minWidth: "280px", borderTop: `5px solid ${isTrashMode ? "#dc3545" : col.color}` }}>
              <div className="d-flex justify-content-between align-items-center mb-3 px-2 pt-1">
                <h6 className="fw-bold m-0 text-uppercase" style={{ fontSize: "0.85rem", color: "#555" }}>
                  {col.title}
                </h6>
                <div className="d-flex align-items-center gap-2">
                  {/* Esconde o botão de "Adicionar" rápido se estivermos na lixeira */}
                  {!isTrashMode && (
                    <Button variant="link" className="p-0 text-secondary" onClick={() => openCreate(col.id)}>
                      <i className="bi bi-plus-circle-fill"></i>
                    </Button>
                  )}
                  <Badge pill bg={isTrashMode ? "danger" : "secondary"} style={{ fontSize: "0.7rem" }}>
                    {leadsNaColuna.length}
                  </Badge>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                {leadsNaColuna.map((lead) => (
                  <Card key={lead.id} className="shadow-sm border-0 kanban-card">
                    <Card.Body className="p-3">
                      <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem", color: isTrashMode ? "#6c757d" : "#000" }}>
                        {isTrashMode && <i className="bi bi-trash me-2 text-danger"></i>}
                        {lead.title}
                      </h6>
                      <p className="text-muted mb-2 text-truncate" style={{ fontSize: "0.8rem" }}>
                        {lead.description || "Sem descrição"}
                      </p>
                      
                      {/* RODAPÉ DO CARD COM OS BOTÕES DINÂMICOS */}
                      <div className="d-flex justify-content-between align-items-end border-top pt-2 mt-2">
                        <div>
                          <div className="fw-bold" style={{ fontSize: "0.75rem", color: "#666" }}>
                            {lead.firstName}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                            {lead.formattedDate}
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          {isTrashMode ? (
                            /* BOTÕES MODO LIXEIRA */
                            isAdmin ? (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                  style={{ width: "26px", height: "26px" }}
                                  title="Restaurar Lead"
                                  onClick={() => restoreLead(lead.id, lead)}
                                >
                                  <i className="bi bi-arrow-counterclockwise" style={{ fontSize: "0.85rem" }}></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                  style={{ width: "26px", height: "26px" }}
                                  title="Eliminar Definitivamente"
                                  onClick={() => {
                                    if(window.confirm("Esta ação é irreversível. Deseja mesmo eliminar?")) {
                                      deleteLead(lead.id, userRole, true);
                                    }
                                  }}
                                >
                                  <i className="bi bi-x-circle" style={{ fontSize: "0.85rem" }}></i>
                                </Button>
                              </>
                            ) : (
                              <span className="text-muted" style={{ fontSize: "0.65rem", fontStyle: "italic" }}>
                                Aguarda Admin
                              </span>
                            )
                          ) : (
                            /* BOTÕES MODO NORMAL */
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="p-1 d-flex align-items-center justify-content-center"
                                style={{ width: "26px", height: "26px" }}
                                title="Editar Lead"
                                onClick={() => openEdit(lead)}
                              >
                                <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }}></i>
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="p-1 d-flex align-items-center justify-content-center"
                                style={{ width: "26px", height: "26px" }}
                                title="Mover para Lixeira"
                                onClick={() => openDeleteConfirm(lead)}
                              >
                                <i className="bi bi-trash3" style={{ fontSize: "0.85rem" }}></i>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL ÚNICO COM AS NOVAS OPÇÕES */}
      <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
        
        {/* Formulários */}
        {modalConfig.type === "EDIT_LEAD" && (
          <EditLeadForm
            leadData={modalConfig.data}
            onSuccess={() => { fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode }); closeModal(); }}
            onCancel={closeModal}
          />
        )}

        {modalConfig.type === "CREATE_LEAD" && (
          <NewLeadForm
            targetUserId={filters.userId}
            initialState={modalConfig.data.state}
            onSuccess={() => { fetchMyLeads(userRole, { userId: filters.userId, softDeleted: isTrashMode }); closeModal(); }}
            onCancel={closeModal}
          />
        )}

        {/* Confirmações de Apagar */}
        {modalConfig.type === "DELETE_CONFIRM" && (
          <div className="p-3 text-center">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: "2rem" }}></i>
            <p className="mt-3">Tem a certeza que deseja enviar a lead <strong>{modalConfig.data?.title}</strong> para a lixeira?</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="danger" onClick={async () => {
                // False indica que é soft-delete
                const success = await deleteLead(modalConfig.data.id, userRole, false);
                if (success) closeModal();
              }}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {modalConfig.type === "BULK_DELETE" && (
          <div className="p-3 text-center">
            <i className="bi bi-exclamation-octagon text-danger" style={{ fontSize: "2.5rem" }}></i>
            <h5 className="mt-3 fw-bold">Atenção!</h5>
            <p>Tem a certeza que deseja mover <strong>TODAS</strong> as leads deste utilizador para a lixeira?</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="danger" onClick={async () => {
                const success = await handleBulkAction(filters.userId, "SOFT_DELETE_ALL", userRole, { userId: filters.userId });
                if (success) closeModal();
              }}>
                Sim, Mover Tudo
              </Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </Container>
  );
};

export default LeadsKanban;