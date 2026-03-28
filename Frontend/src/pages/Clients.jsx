import React, { useEffect, useState } from "react";
import { Container, Spinner, Button, Row, Col } from "react-bootstrap";
import { useClientStore } from "../stores/ClientsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// COMPONENTES IMPORTADOS
import ClientsHeader from "../components/Clients/ClientsHeader";
import ClientCard from "../components/Clients/ClientCard";
import DynamicModal from "../components/DynamicModal";
import EditClientForm from "../components/Clients/EditClientForm";
import "../App.css";

const Clients = () => {
  const {
    clients,
    loading,
    fetchClients,
    deleteClient,
    restoreClient,
    handleBulkAction,
  } = useClientStore();
  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  const [isTrashMode, setIsTrashMode] = useState(false);
  const [filters, setFilters] = useState({ userId: "" });
  const [users, setUsers] = useState([]);

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    type: null,
    data: null,
  });
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  useEffect(() => {
    if (isAdmin) userService.getAllUsers().then(setUsers).catch(console.error);
  }, [isAdmin]);

  useEffect(() => {
    fetchClients(userRole, {
      userId: filters.userId || null,
      showTrash: isTrashMode,
    });
  }, [userRole, filters.userId, isTrashMode, fetchClients]);

  // AÇÕES DE MODAL
  const modalActions = {
    openEdit: (client) =>
      setModalConfig({
        show: true,
        title: `Editar: ${client.name}`,
        type: "EDIT_CLIENT",
        data: client,
      }),
    openSoftDeleteConfirm: (client) =>
      setModalConfig({
        show: true,
        title: "Mover para Lixeira",
        type: "SOFT_DELETE",
        data: client,
      }),
    openHardDeleteConfirm: (client) =>
      setModalConfig({
        show: true,
        title: "Eliminação Permanente",
        type: "HARD_DELETE",
        data: client,
      }),
    openBulkActionConfirm: (actionType) => {
      const titles = {
        DEACTIVATE_ALL: "Mover Tudo para Lixeira",
        RESTORE_ALL: "Restaurar Todos os Clientes",
        EMPTY_TRASH: "Esvaziar Lixeira",
      };
      setModalConfig({
        show: true,
        title: titles[actionType],
        type: actionType,
        data: { userId: filters.userId },
      });
    },
  };

  if (loading && clients.length === 0) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p>A carregar...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* 1. O NOVO CABEÇALHO */}
      <ClientsHeader
        isTrashMode={isTrashMode}
        setIsTrashMode={setIsTrashMode}
        isAdmin={isAdmin}
        filters={filters}
        setFilters={setFilters}
        users={users}
        hasClients={clients.length > 0}
        actions={modalActions}
      />

      {/* 2. A NOVA LISTA */}
      <div>
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
          <Row className="g-3">
            {" "}
            {/* g-3 adiciona espaçamento consistente entre os cartões */}
            {clients.map((client) => (
              <Col key={client.id} xs={12} sm={6} md={4} lg={3}>
                {" "}
                {/* Responsividade: 1 por linha no telemóvel, 3 ou 4 no PC */}
                <ClientCard
                  client={client}
                  isTrashMode={isTrashMode}
                  isAdmin={isAdmin}
                  onEdit={modalActions.openEdit}
                  onSoftDelete={modalActions.openSoftDeleteConfirm}
                  onRestore={(c) => restoreClient(c.id)}
                  onHardDelete={modalActions.openHardDeleteConfirm}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 3. OS MODAIS (Agrupados) */}
      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "EDIT_CLIENT" && (
          <EditClientForm
            clientData={modalConfig.data}
            onSuccess={() => {
              fetchClients(userRole, {
                userId: filters.userId || null,
                showTrash: isTrashMode,
              });
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}

        {/* Modais de Confirmação Simples */}
        {["SOFT_DELETE", "HARD_DELETE"].includes(modalConfig.type) && (
          <div className="text-center p-3">
            <i
              className={`bi bi-exclamation-${modalConfig.type === "HARD_DELETE" ? "octagon text-danger" : "triangle text-warning"} display-4`}
            ></i>
            <p className="mt-3">
              Tem a certeza que deseja{" "}
              {modalConfig.type === "HARD_DELETE"
                ? "eliminar permanentemente"
                : "mover para a lixeira"}{" "}
              <strong>{modalConfig.data?.organization}</strong>?
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await deleteClient(
                    modalConfig.data.id,
                    modalConfig.type === "HARD_DELETE",
                  );
                  closeModal();
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Modais de Ações em Massa */}
        {["DEACTIVATE_ALL", "RESTORE_ALL", "EMPTY_TRASH"].includes(
          modalConfig.type,
        ) && (
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
                  await handleBulkAction(
                    modalConfig.data.userId,
                    modalConfig.type,
                    userRole,
                    { userId: filters.userId || null, showTrash: isTrashMode },
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
