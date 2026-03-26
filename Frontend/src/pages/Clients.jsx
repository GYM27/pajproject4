import { useNavigate } from "react-router-dom";
import { useClientStore } from "../stores/ClientsStore";
import { useUserStore } from "../stores/UserStore";
import { useEffect, useState } from "react";
import { Container, Button, Spinner, Row, Col, Form } from "react-bootstrap";
import EditClientForm from "../components/EditClientForm";
import { userService } from "../services/userService";
import "../App.css";

// IMPORTA O MODAL
import DynamicModal from "../components/DynamicModal";

const Clients = () => {
  const {
    clients,
    loading,
    fetchClients,
    deleteClient,
    restoreClient,
    handleBulkAction,
  } = useClientStore();

  const userRole = useUserStore((state) => state.userRole);
  const isAdmin = userRole === "ADMIN";
  const navigate = useNavigate();

  const [openCardId, setOpenCardId] = useState(null);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [filters, setFilters] = useState({ userId: "" });

  // ESTADO PARA OS MODAIS DE CONFIRMAÇÃO
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    type: null,
    data: null,
  });

  const [users, setUsers] = useState([]); // Novo estado para a lista de users

  useEffect(() => {
    // Carrega os utilizadores apenas se for ADMIN
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  // Funções de abertura de modais
  const openSoftDeleteConfirm = (client) => {
    setModalConfig({
      show: true,
      title: "Mover para Lixeira",
      type: "SOFT_DELETE",
      data: client,
    });
  };

  const openHardDeleteConfirm = (client) => {
    setModalConfig({
      show: true,
      title: "Eliminação Permanente",
      type: "HARD_DELETE",
      data: client,
    });
  };

  const openBulkActionConfirm = (actionType) => {
    const titles = {
      DEACTIVATE_ALL: "Mover Tudo para Lixeira",
      RESTORE_ALL: "Restaurar Todos os Clientes",
      EMPTY_TRASH: "Esvaziar Lixeira Definitivamente",
    };
    setModalConfig({
      show: true,
      title: titles[actionType],
      type: actionType,
      data: { userId: filters.userId },
    });
  };

  useEffect(() => {
  //a Store decide o endpoint com base no showTrash e userId
  fetchClients(userRole, { 
    userId: filters.userId || null, 
    showTrash: isTrashMode 
  });
}, [userRole, filters.userId, isTrashMode, fetchClients]);

  const toggleCard = (id) => {
    setOpenCardId(openCardId === id ? null : id);
  };

  if (loading && clients.length === 0) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p>A carregar...</p>
      </Container>
    );
  }

  // Adiciona esta função antes do return
  const openEdit = (client) => {
    setModalConfig({
      show: true,
      title: `Editar Cliente: ${client.name}`,
      type: "EDIT_CLIENT",
      data: client,
    });
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className={`fw-bold m-0 ${isTrashMode ? "text-danger" : "text-secondary"}`}
        >
          {isTrashMode ? "LIXEIRA DE CLIENTES" : "GESTÃO DE CLIENTES"}
        </h2>

        <div className="d-flex gap-2">
          <Button
            variant={isTrashMode ? "secondary" : "outline-secondary"}
            onClick={() => setIsTrashMode(!isTrashMode)}
          >
            <i
              className={`bi ${isTrashMode ? "bi-arrow-left" : "bi-trash"} me-1`}
            ></i>
            {isTrashMode ? "Voltar" : "Ver Lixeira"}
          </Button>

          {isTrashMode && isAdmin && filters.userId && clients.length > 0 && (
            <>
              <Button
                variant="success"
                onClick={() => openBulkActionConfirm("RESTORE_ALL")}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Restaurar
                Tudo
              </Button>
              <Button
                variant="danger"
                onClick={() => openBulkActionConfirm("EMPTY_TRASH")}
              >
                <i className="bi bi-x-circle me-1"></i> Esvaziar Lixeira
              </Button>
            </>
          )}

          {!isTrashMode && (
            <Button variant="primary" onClick={() => navigate("/clients/new")}>
              <i className="bi bi-person-plus me-1"></i> Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-3 rounded shadow-sm mb-4 border">
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">
                  Responsável pelas Leads
                </Form.Label>
                <Form.Select
                  value={filters.userId}
                  onChange={(e) => setFilters({ userId: e.target.value })}
                >
                  <option value="">Selecione um utilizador...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            {!isTrashMode && filters.userId && clients.length > 0 && (
              <Col md={6} className="d-flex align-items-end">
                <Button
                  variant="outline-danger"
                  onClick={() => openBulkActionConfirm("DEACTIVATE_ALL")}
                >
                  <i className="bi bi-trash-fill me-1"></i> Mover Tudo para
                  Lixeira
                </Button>
              </Col>
            )}
          </Row>
        </div>
      )}

      <div className="lista-clientes">
        {clients.length === 0 ? (
          <div className="text-center p-5 bg-light rounded border">
            <i className="bi bi-folder2-open display-4 text-muted"></i>
            <p className="mt-3 text-muted">
              {isTrashMode
                ? "Lixeira vazia ou utilizador não selecionado."
                : "Nenhum cliente encontrado."}
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className={`clientes-card ${openCardId === client.id ? "aberto" : "fechado"}`}
              onClick={() => toggleCard(client.id)}
              style={{ borderLeftColor: isTrashMode ? "#dc3545" : "#007bff" }}
            >
              <div className="card-header-modern">
                <strong className="org-name">
                  {isTrashMode && (
                    <i className="bi bi-trash me-2 text-danger"></i>
                  )}
                  {client.organization || "Sem Organização"}
                </strong>
                <i
                  className={`bi ${openCardId === client.id ? "bi-chevron-up" : "bi-chevron-down"} text-muted`}
                ></i>
              </div>
              <div className="card-detalhes">
                <hr className="mt-0" />
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="mb-1">
                      <i className=""></i>
                      <strong>Nome:</strong> {client.name}
                    </p>

                    <p className="mb-1">
                      <i className="bi bi-envelope text-muted me-2"></i>
                      <strong></strong> {client.email}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      {client.phone}
                    </p>
                  </Col>
                </Row>
                <div
                  className="card-actions border-top"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isTrashMode ? (
                    isAdmin ? (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2"
                          onClick={() => restoreClient(client.id)}
                        >
                          <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                          Restaurar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openHardDeleteConfirm(client)}
                        >
                          <i className="bi bi-x-circle me-1"></i> Eliminar
                          Permanente
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted small fst-italic">
                        Aguarda Admin
                      </span>
                    )
                  ) : (
                    <>
                      {/* SUBSTITUA O BOTÃO DE EDITAR POR ESTE: */}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openEdit(client)} // Abre o Modal em vez de navegar
                      >
                        <i className="bi bi-pencil me-1"></i> Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openSoftDeleteConfirm(client)}
                      >
                        <i className="bi bi-trash3 me-1"></i> Lixeira
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÕES */}
      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "SOFT_DELETE" && (
          <div className="text-center p-3">
            <i className="bi bi-exclamation-triangle text-warning display-4"></i>
            <p className="mt-3">
              Mover <strong>{modalConfig.data?.organization}</strong> para a
              lixeira?
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await deleteClient(modalConfig.data.id, false);
                  closeModal();
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {modalConfig.type === "HARD_DELETE" && (
          <div className="text-center p-3">
            <i className="bi bi-exclamation-octagon text-danger display-4"></i>
            <p className="mt-3">
              Esta ação é irreversível. Eliminar{" "}
              <strong>{modalConfig.data?.organization}</strong> permanentemente?
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await deleteClient(modalConfig.data.id, true);
                  closeModal();
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}

        {(modalConfig.type === "DEACTIVATE_ALL" ||
          modalConfig.type === "RESTORE_ALL" ||
          modalConfig.type === "EMPTY_TRASH") && (
          <div className="text-center p-3">
            <i
              className={`bi ${modalConfig.type === "RESTORE_ALL" ? "bi-info-circle text-primary" : "bi-exclamation-octagon text-danger"} display-4`}
            ></i>
            <h5 className="mt-3">Confirmar ação em massa?</h5>
            <p className="text-muted">
              Isto afetará todos os clientes listados.
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant={
                  modalConfig.type === "RESTORE_ALL" ? "success" : "danger"
                }
                onClick={async () => {
                  // Passamos userRole e os filtros para que a store possa atualizar os dados corretamente após a ação
                  await handleBulkAction(
                    modalConfig.data.userId,
                    modalConfig.type,
                    userRole,
                    { ...filters, showTrash: isTrashMode },
                  );
                  closeModal();
                }}
              >
                Sim, Continuar
              </Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </Container>
  );
};

export default Clients;
