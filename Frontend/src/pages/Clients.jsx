import React, { useEffect, useState } from "react";
import { Container, Spinner, Row, Col } from "react-bootstrap";
import { useClientStore } from "../stores/ClientsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// COMPONENTES SHARED (Arquitetura Nova)
import { useModalManager } from "../Modal/useModalManager.jsx";
import { useResourceActions } from "../components/Shared/useResourceActions";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

// COMPONENTES DE CLIENTES
import ClientsHeader from "../components/Clients/ClientsHeader";
import ClientCard from "../components/Clients/ClientCard";
import DynamicModal from "../Modal/DynamicModal.jsx";
import EditClientForm from "../components/Clients/EditClientForm";
import "../App.css";

const Clients = () => {
    // 1. Estados e Stores
    const clientStore = useClientStore();
    const { userRole } = useUserStore();
    const isAdmin = userRole === "ADMIN";

    const [isTrashMode, setIsTrashMode] = useState(false);
    const [filters, setFilters] = useState({ userId: "" });
    const [users, setUsers] = useState([]);

    // 2. Gestão de Modais e Ações via Shared Hooks
    const { modalConfig, openModal, closeModal } = useModalManager();

    // Injetamos as dependências para obter as ações prontas (incluindo cardActions)
    const { clients: actions } = useResourceActions(openModal, filters, { clientStore, userRole });

    // 3. Carregamento de Dados
    useEffect(() => {
        if (isAdmin) userService.getAllUsers().then(setUsers).catch(console.error);
    }, [isAdmin]);

    useEffect(() => {
        clientStore.fetchClients(userRole, {
            userId: filters.userId || null,
            showTrash: isTrashMode,
        });
    }, [userRole, filters.userId, isTrashMode, clientStore.fetchClients]);

    if (clientStore.loading && clientStore.clients.length === 0) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" variant="primary" />
                <p>A carregar...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            {/* 1. CABEÇALHO (Usa as ações injetadas) */}
            <ClientsHeader
                isTrashMode={isTrashMode}
                setIsTrashMode={setIsTrashMode}
                isAdmin={isAdmin}
                filters={filters}
                setFilters={setFilters}
                users={users}
                hasClients={clientStore.clients.length > 0}
                actions={actions}
            />

            {/* 2. LISTA DE CLIENTES */}
            <div>
                {clientStore.clients.length === 0 ? (
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
                        {clientStore.clients.map((client) => (
                            <Col key={client.id} xs={12} sm={6} md={4} lg={3}>
                                <ClientCard
                                    client={client}
                                    isTrashMode={isTrashMode}
                                    isAdmin={isAdmin}
                                    // Usa o objeto de ações mapeado para os nomes esperados pelo ClientCard
                                    cardActions = {actions.cardActions}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* 3. MODAL DINÂMICO ÚNICO (Lógica centralizada) */}
            <DynamicModal
                show={modalConfig.show}
                onHide={closeModal}
                title={modalConfig.title}
            >
                {modalConfig.type === "EDIT_CLIENT" ? (
                    <EditClientForm
                        clientData={modalConfig.data}
                        onSuccess={() => {
                            clientStore.fetchClients(userRole, {
                                userId: filters.userId || null,
                                showTrash: isTrashMode,
                            });
                            closeModal();
                        }}
                        onCancel={closeModal}
                    />
                ) : (
                    /* Conteúdo Genérico para Confirmações (Soft Delete, Hard Delete, Bulk) */
                    <ConfirmActionContent
                        type={modalConfig.type}
                        data={modalConfig.data}
                        onCancel={closeModal}
                        onConfirm={async (data) => {
                            // Filtros necessários para o refetch dos clientes
                            const currentFilters = { userId: filters.userId || null, showTrash: isTrashMode };

                            const actionMap = {
                                "SOFT_DELETE": () => clientStore.deleteClient(data.id, false),
                                "HARD_DELETE": () => clientStore.deleteClient(data.id, true),
                                "BULK_SOFT_DELETE": () => clientStore.handleBulkAction(data.userId, "DEACTIVATE_ALL", userRole, currentFilters),
                                "BULK_HARD_DELETE": () => clientStore.handleBulkAction(data.userId, "EMPTY_TRASH", userRole, currentFilters),
                                "RESTORE_CLIENT": () => clientStore.restoreClient(data.id, data, userRole), // Para o Card individual
                                "RESTORE_ALL": () => clientStore.handleBulkAction(data.userId, "RESTORE_ALL", userRole, { userId: filters.userId, softDeleted: isTrashMode }) // Para o Header
                            };

                            const actionToExecute = actionMap[modalConfig.type];

                            if (actionToExecute) {
                                await actionToExecute();
                                closeModal();
                            }
                        }}
                    />
                )}
            </DynamicModal>
        </Container>
    );
};

export default Clients;