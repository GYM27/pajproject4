import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// Componentes Shared e Modais
import UserCard from "../components/Users/UserCard";
import { useModalManager } from "../Modal/useModalManager.jsx";
import DynamicModal from "../Modal/DynamicModal.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

const Users = () => {
    const userRole = useUserStore((state) => state.userRole);
    const isAdmin = userRole === "ADMIN";
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. GESTÃO DE MODAIS PADRONIZADA
    const { modalConfig, openModal, closeModal } = useModalManager();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            const sortedUsers = data.sort((a, b) => (a.softDelete === b.softDelete ? 0 : a.softDelete ? 1 : -1));
            setUsers(sortedUsers);
        } catch (err) {
            setError("Erro ao carregar a lista de utilizadores.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) { navigate("/dashboard"); return; }
        loadUsers();
    }, [isAdmin, navigate, loadUsers]);

    // 2. CÉREBRO DAS AÇÕES (Action Map)
    const handleConfirmAction = async (data) => {
        try {
            const actionMap = {
                "USER_HARD_DELETE": async () => {
                    await userService.deleteUserPermanent(data.id);
                    closeModal();
                    loadUsers();
                },
                "USER_TOGGLE_STATUS": async () => {
                    const action = data.softDelete ? "softundelete" : "softdelete";
                    await userService.toggleUserStatus(data.id, action);
                    closeModal();
                    loadUsers();
                }
            };

            const actionToExecute = actionMap[modalConfig.type];
            if (actionToExecute) await actionToExecute();
        } catch (err) {
            alert("Erro ao processar a ação. Verifique dependências (Leads/Clientes).");
        }
    };

    if (loading && users.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">A carregar equipa...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold m-0 text-secondary">GESTÃO DE USERS (ADMIN)</h2>
                    <p className="text-muted small">Gerencie as contas e estados dos colaboradores.</p>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-3">
                {users.length === 0 ? (
                    <Col className="text-center p-5 bg-light rounded">
                        <i className="bi bi-people display-4 text-muted"></i>
                        <p className="mt-3 text-muted">Nenhum utilizador encontrado.</p>
                    </Col>
                ) : (
                    users.map((user) => (
                        <Col key={user.id} xs={12} sm={6} md={4} lg={3}>
                            <UserCard
                                user={user}
                                onViewProfile={(u) => navigate(`/profile?userId=${u.id}`)}
                                // Agora o Desativar também abre o Modal para segurança!
                                onToggleStatus={(u) => openModal("USER_TOGGLE_STATUS", u.softDelete ? "Reativar" : "Desativar", u)}
                                onHardDelete={(u) => openModal("USER_HARD_DELETE", "Ação Irreversível", u)}
                            />
                        </Col>
                    ))
                )}
            </Row>

            {/* 3. MODAL ÚNICO E LIMPO */}
            <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
                <ConfirmActionContent
                    type={modalConfig.type}
                    data={modalConfig.data}
                    onCancel={closeModal}
                    onConfirm={handleConfirmAction}
                />
            </DynamicModal>
        </Container>
    );
};

export default Users;