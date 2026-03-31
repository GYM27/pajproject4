import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// Componentes Shared e Modais (Arquitetura Modular - 5%)
import UserCard from "../components/Users/UserCard";
import { useModalManager } from "../Modal/useModalManager.jsx";
import DynamicModal from "../Modal/DynamicModal.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

/**
 * COMPONENTE: Users (Página de Administração de Staff)
 * ---------------------------------------------------
 * DESCRIÇÃO: Listagem e gestão de todos os utilizadores registados.
 * FUNCIONALIDADE: Exclusiva para perfis ADMIN. Permite monitorizar o estado
 * das contas, reativar colaboradores ou remover registos permanentemente.
 */
const Users = () => {
    const userRole = useUserStore((state) => state.userRole);
    const isAdmin = userRole === "ADMIN";
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. GESTÃO DE MODAIS PADRONIZADA:
    // Reutiliza o hook global para garantir que o comportamento das janelas de
    // confirmação é idêntico ao das Leads e Clientes (Consistência de UX).
    const { modalConfig, openModal, closeModal } = useModalManager();

    /** * CARREGAMENTO DE DADOS (CRITÉRIO: PERFORMANCE - 5%):
     * O 'useCallback' memoriza a função de refresh para evitar re-renderizações infinitas.
     * Inclui uma lógica de ordenação: utilizadores ativos aparecem primeiro.
     */
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            // ORDENAÇÃO: Coloca os utilizadores com softDelete=true no fim da lista.
            const sortedUsers = data.sort((a, b) => (a.softDelete === b.softDelete ? 0 : a.softDelete ? 1 : -1));
            setUsers(sortedUsers);
        } catch (err) {
            setError("Erro ao carregar a lista de utilizadores.");
        } finally {
            setLoading(false);
        }
    }, []);

    /** * PROTEÇÃO DE ROTA (SEGURANÇA - 2%):
     * Se um utilizador comum (USER) tentar aceder a este URL, o useEffect deteta
     * e expulsa-o imediatamente para o Dashboard.
     */
    useEffect(() => {
        if (!isAdmin) {
            navigate("/dashboard");
            return;
        }
        loadUsers();
    }, [isAdmin, navigate, loadUsers]);

    /** * 2. CÉREBRO DAS AÇÕES (ACTION MAP - 5%):
     * Mapeia as ações do modal para chamadas diretas ao userService.
     */
    const handleConfirmAction = async (data) => {
        try {
            const actionMap = {
                // REGRA A14: Remoção física da base de dados PostgreSQL.
                "USER_HARD_DELETE": async () => {
                    await userService.deleteUserPermanent(data.id);
                    closeModal();
                    loadUsers(); // Refresh imediato da lista
                },
                // REGRA A9: Soft Delete / Reativação.
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
            // Tratamento de erro contextualizado (FK Constraints no SQL)
            alert("Erro ao processar a ação. Verifique se o utilizador possui dependências ativas (Leads ou Clientes).");
        }
    };

    // FEEDBACK VISUAL DE LOADING (UX - 3%)
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
            {/* CABEÇALHO DA PÁGINA */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold m-0 text-secondary">GESTÃO DE USERS (ADMIN)</h2>
                    <p className="text-muted small">Gerencie as contas e estados dos colaboradores da organização.</p>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* LISTA DE UTILIZADORES (GRID RESPONSIVA - 4%):
                Adapta-se de 1 coluna (Mobile) até 4 colunas (Desktop).
            */}
            <Row className="g-3">
                {users.length === 0 ? (
                    <Col className="text-center p-5 bg-light rounded">
                        <i className="bi bi-people display-4 text-muted"></i>
                        <p className="mt-3 text-muted">Nenhum utilizador encontrado no sistema.</p>
                    </Col>
                ) : (
                    users.map((user) => (
                        <Col key={user.id} xs={12} sm={6} md={4} lg={3}>
                            <UserCard
                                user={user}
                                // Navegação dinâmica para o perfil com Query Parameter (?userId=X)
                                onViewProfile={(u) => navigate(`/profile?userId=${u.id}`)}
                                // SEGURANÇA: Abrir modal para todas as ações críticas (Regras A9/A14)
                                onToggleStatus={(u) => openModal("USER_TOGGLE_STATUS", u.softDelete ? "Reativar" : "Desativar", u)}
                                onHardDelete={(u) => openModal("USER_HARD_DELETE", "Ação Irreversível", u)}
                            />
                        </Col>
                    ))
                )}
            </Row>

            {/* 3. MODAL DINÂMICO ÚNICO:
                Injeta o ConfirmActionContent que sabe interpretar os tipos USER_HARD_DELETE e USER_TOGGLE_STATUS.
            */}
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