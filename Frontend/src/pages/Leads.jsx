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
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

// Importação das Stores (Zustand)
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";

// Importação de Serviços
import { userService } from "../services/userService";

// Importação de Estilos (Opcional, dependendo de onde tens o CSS dos cards)
import "../App.css";
const Leads = () => {
  const { leads, loading, fetchMyLeads } = useLeadStore();
  const navigate = useNavigate();
  const userRole = useUserStore((state) => state.userRole);
  const firstName = useUserStore((state) => state.firstName);

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });

  const isAdmin = userRole === "ADMIN";

  // 1. CARREGAMENTO: O fetch já envia os filtros para a URL
  useEffect(() => {
    fetchMyLeads(userRole, filters);
  }, [userRole, filters, fetchMyLeads]);

  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  // 2. IMPORTANTE: Não filtrar localmente se o servidor já o faz.
  // Usamos 'leads' diretamente da store pois o JSON já vem filtrado.
  const leadsExibidas = leads.filter((lead) => {
    // Se o filtro estiver vazio (""), mostra todas.
    // Caso contrário, compara o state da lead com o valor do filtro.
    const matchesState =
      filters.state === "" || String(lead.state) === String(filters.state);

    return matchesState;
  });
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

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">
          {isAdmin ? "Leads: ADMIN" : `Leads: ${firstName}`}
        </h2>
        {/* Envolvemos o botão com o OverlayTrigger para o Tooltip aparecer no hover */}

        <OverlayTrigger
          placement="top" // O balão aparecerá à esquerda do botão
          overlay={<Tooltip id="tooltip-new-lead">Criar Nova Lead</Tooltip>}
        >
          <Button variant="primary" onClick={() => navigate("/leads/new")}>
            <i className="bi bi-file-earmark-plus"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Barra de Filtros */}
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
          {leadsExibidas.map((lead) => {
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
                  <p className="text-muted small mb-3">
                    {lead.description?.substring(0, 80)}...
                  </p>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center text-secondary small">
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      {lead.formattedDate}
                    </span>
                    <Button
                      variant="link"
                      className="p-0 fw-bold text-decoration-none"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      Ver Detalhes <i className="bi bi-eye ms-1"></i>
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Leads;
