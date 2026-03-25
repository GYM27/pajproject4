import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Badge,
  Spinner,
  Form,
  Alert,
} from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";
import "../App.css";

// --- NOVAS IMPORTAÇÕES ---
import DynamicModal from "../components/DynamicModal";
import EditLeadForm from "../components/EditLeadForm";

const getStateStyle = (state) => {
  const styles = {
    1: { label: "Novo", color: "#007bff" },
    2: { label: "Em Análise", color: "#ffc107" },
    3: { label: "Proposta", color: "#17a2b8" },
    4: { label: "Ganho", color: "#28a745" },
    5: { label: "Perdido", color: "#dc3545" },
  };
  return styles[state] || { label: "Outro", color: "#6c757d" };
};

const Leads = () => {
  const {
    leads,
    loading,
    error,
    fetchMyLeads,
    restoreLead,
    deleteLead,
    handleBulkAction,
  } = useLeadStore();
  const navigate = useNavigate();
  const userRole = useUserStore((state) => state.userRole);
  const firstName = useUserStore((state) => state.firstName);

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  const [softDeleted, setIsTrashMode] = useState(false);

  const isAdmin = userRole === "ADMIN";

  // --- ESTADO DO MODAL DINÂMICO ---
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    type: null,
    data: null,
  });

  // --- FUNÇÕES DE CONTROLO DO MODAL ---
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  const openEditLead = (lead) => {
    setModalConfig({
      show: true,
      title: `Editar: ${lead.title}`,
      type: "EDIT_LEAD",
      data: lead,
    });
  };

  const openDeleteConfirm = (lead) => {
    setModalConfig({
      show: true,
      title: "Confirmar Eliminação",
      type: "DELETE_LEAD",
      data: lead,
    });
  };

  useEffect(() => {
    fetchMyLeads(userRole, { ...filters, softDeleted: softDeleted });
  }, [userRole, filters, softDeleted, fetchMyLeads]);

  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  let pageTitle = "";
  if (softDeleted) {
    pageTitle = "Lixeira de Leads";
  } else if (isAdmin) {
    if (filters.userId) {
      const selectedUser = users.find(
        (u) => String(u.id) === String(filters.userId),
      );
      pageTitle = selectedUser
        ? `Leads: ${selectedUser.firstName} ${selectedUser.lastName}`
        : "Leads: ADMIN";
    } else {
      pageTitle = "Leads: ADMIN ";
    }
  } else {
    pageTitle = `Leads: ${firstName}`;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">{pageTitle}</h2>

        <div className="d-flex gap-2">
          {!softDeleted && isAdmin && filters.userId && leads.length > 0 && (
            <Button
              variant="outline-danger"
              onClick={() => {
                if (window.confirm("Mover tudo para a lixeira?"))
                  handleBulkAction(filters.userId, "SOFT_DELETE_ALL");
              }}
            >
              <i className="bi bi-trash-fill"></i> Mover Tudo para Lixeira
            </Button>
          )}

          <Button
            variant={softDeleted ? "secondary" : "outline-secondary"}
            onClick={() => setIsTrashMode(!softDeleted)}
          >
            <i
              className={`bi ${softDeleted ? "bi-arrow-left" : "bi-trash"}`}
            ></i>
            {softDeleted ? " Voltar" : " Ver Lixeira"}
          </Button>

          {softDeleted && isAdmin && filters.userId && (
            <>
              <Button
                variant="success"
                onClick={() => handleBulkAction(filters.userId, "RESTORE_ALL")}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Restaurar Tudo
              </Button>
            </>
          )}

          {!softDeleted && (
            <Button
              variant="primary"
              onClick={() =>
                navigate("/leads/new", { state: { targetId: filters.userId } })
              }
            >
              <i className="bi bi-file-earmark-plus"></i>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Erro de comunicação com servidor </strong> {error}
        </Alert>
      )}

      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-5">
          {isAdmin && (
            <Col md={4}>
              <Form.Select
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
              >
                <option value="">Nome</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          )}
          <Col md={isAdmin ? 4 : 8}>
            <Form.Select
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
            >
              <option value="">Estados</option>
              <option value="1">Novo</option>
              <option value="2">Em Análise</option>
              <option value="3">Proposta</option>
              <option value="4">Ganho</option>
              <option value="5">Perdido</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => setFilters({ userId: "", state: "" })}
            >
              Limpar Filtros
            </Button>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-4">
          {leads.length === 0 ? (
            <Col className="text-center p-5 text-muted">
              <h5>Nenhuma lead encontrada.</h5>
            </Col>
          ) : (
            leads.map((lead) => {
              const style = getStateStyle(lead.state);
              return (
                <Col key={lead.id} md={6} lg={4}>
                  <div
                    className="clientes-card p-3 shadow-sm h-100"
                    style={{ borderLeft: `10px solid ${style.color}` }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-dark m-0">{lead.title}</h5>
                      <Badge style={{ backgroundColor: style.color }}>
                        {style.label}
                      </Badge>
                    </div>
                    <span className="text-muted">{lead.firstName}</span>
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center text-secondary small">
                      <span>
                        <i className="bi bi-calendar3 me-1"></i>
                        {lead.formattedDate}
                      </span>
                      <div className="d-flex gap-2">
                        {softDeleted ? (
                          <>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => restoreLead(lead.id, lead)}
                                >
                                  Restaurar
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    deleteLead(lead.id, userRole, true)
                                  }
                                >
                                  Eliminar Permanente
                                </Button>
                              </>
                            )}
                            {!isAdmin && (
                              <span className="text-muted italic">
                                A aguardar admin
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="d-flex gap-2 align-items-center">
                            <Button
                              variant="link"
                              className="p-0 fw-bold text-decoration-none me-2"
                              onClick={() => navigate(`/leads/${lead.id}`)}
                            >
                              Detalhes
                            </Button>
                            {/* --- NOVOS BOTÕES QUE CHAMAM O MODAL --- */}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openEditLead(lead)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteConfirm(lead)}
                            >
                              Apagar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })
          )}
        </Row>
      )}

      {/* --- RENDERIZAÇÃO DO MODAL DINÂMICO --- */}
      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "EDIT_LEAD" && (
          <EditLeadForm
            leadData={modalConfig.data}
            onSuccess={() => {
              // Quando o formulário avisa que teve sucesso, re-carregamos as leads e fechamos o modal
              fetchMyLeads(userRole, { ...filters, softDeleted: softDeleted });
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}

        {modalConfig.type === "DELETE_LEAD" && (
          <div>
            <p>
              Tem a certeza que deseja eliminar a lead{" "}
              <strong>{modalConfig.data.title}</strong>?
            </p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  // Ao apagar, usamos a função da store e depois fechamos o modal
                  deleteLead(modalConfig.data.id, userRole, false);
                  closeModal();
                }}
              >
                Sim, Eliminar
              </Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </Container>
  );
};

export default Leads;
