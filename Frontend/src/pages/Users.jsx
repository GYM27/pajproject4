import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";
import UserCard from "../components/Users/UserCard";
import DynamicModal from "../components/DynamicModal";

const Users = () => {
  const userRole = useUserStore((state) => state.userRole);
  const isAdmin = userRole === "ADMIN";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    type: null,
    data: null,
  });
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();

      // Ordenar: Ativos (false) primeiro, Inativos (true) no fim
      const sortedUsers = data.sort((a, b) => {
        return a.softDelete === b.softDelete ? 0 : a.softDelete ? 1 : -1;
      });

      setUsers(sortedUsers);
    } catch (err) {
      setError("Erro ao carregar a lista de utilizadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Proteção de Rota
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadUsers();
  }, [isAdmin, navigate, loadUsers]);

  // Ações
  const handleToggleStatus = async (user) => {
    // Decide qual o endpoint baseado no estado atual
    const action = user.softDelete ? "activate" : "deactivate";
    try {
      await userService.toggleUserStatus(user.id, action);
      loadUsers(); // Recarrega a lista
    } catch (err) {
      alert("Erro ao alterar o estado do utilizador.");
    }
  };

  const handleHardDelete = async () => {
    try {
      await userService.deleteUserPermanent(modalConfig.data.id);
      closeModal();
      loadUsers();
    } catch (err) {
      alert(
        "Erro ao apagar o utilizador. Verifique se ele ainda tem leads associadas.",
      );
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">A carregar equipa...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2 className="fw-bold m-0 text-secondary">GESTÃO DE USERS (ADMIN)</h2>
        <p className="text-muted small">
          Gerencie as contas, permissões e estados dos colaboradores.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* GRELHA RESPONSIVA DE CARTÕES */}
      <Row className="g-3">
        {users.length === 0 ? (
          <Col>
            <div className="text-center p-5 bg-light rounded border">
              <i className="bi bi-people display-4 text-muted"></i>
              <p className="mt-3 text-muted">
                Nenhum utilizador encontrado no sistema.
              </p>
            </div>
          </Col>
        ) : (
          users.map((user) => (
            <Col key={user.id} xs={12} sm={6} md={4} lg={3}>
              <UserCard
                user={user}
                onToggleStatus={handleToggleStatus}
                onViewProfile={(u) => navigate(`/profile?userId=${u.id}`)}
                onHardDelete={(u) =>
                  setModalConfig({
                    show: true,
                    title: "Aviso Legal",
                    type: "HARD_DELETE",
                    data: u,
                  })
                }
              />
            </Col>
          ))
        )}
      </Row>

      {/* MODAL DE CONFIRMAÇÃO DE APAGAR */}
      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "HARD_DELETE" && (
          <div className="text-center p-3">
            <i className="bi bi-exclamation-octagon text-danger display-4"></i>
            <h5 className="mt-3 fw-bold">Ação Irreversível</h5>
            <p className="text-muted">
              Tem a certeza que deseja eliminar permanentemente o utilizador{" "}
              <strong>
                {modalConfig.data?.firstName} {modalConfig.data?.lastName}
              </strong>
              ?
            </p>
            <Alert variant="warning" className="small text-start">
              <i className="bi bi-info-circle me-1"></i>
              Recomendamos usar o botão de <strong>"Desativar"</strong> para
              manter o histórico de leads deste utilizador na base de dados.
            </Alert>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleHardDelete}>
                Sim, Eliminar
              </Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </Container>
  );
};

export default Users;
