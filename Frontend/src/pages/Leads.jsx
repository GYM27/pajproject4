import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Table, Badge } from "react-bootstrap";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Captura o ?state=X do URL (enviado pelo Dashboard)
  const query = new URLSearchParams(useLocation().search);
  const filterState = query.get("state");

  const fetchLeads = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:8080/LuisF-proj4/rest/users/me/leads",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            token: token,
          },
        },
      );

      if (response.ok) {
        let data = await response.json();

        if (filterState) {
          data = data.filter((l) => l.state === parseInt(filterState));
        }
        setLeads(data);
      }
    } catch (err) {
      console.error("Erro ao procurar leads", err);
    } finally {
      setLoading(false);
    }
  }, [filterState]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Função auxiliar para dar cor aos badges (igual ao teu Java Enum)
  const getStateBadge = (state) => {
    const states = {
      1: { text: "Novo", variant: "primary" },
      2: { text: "Em Análise", variant: "warning" },
      3: { text: "Proposta", variant: "info" },
      4: { text: "Ganho", variant: "success" },
      5: { text: "Perdido", variant: "danger" },
    };
    return states[state] || { text: "Desconhecido", variant: "secondary" };
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {filterState
            ? `Leads: ${getStateBadge(filterState).text}`
            : "Todas as Leads"}
        </h2>
        <Button variant="primary" onClick={() => navigate("/leads/new")}>
          + Nova Lead
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>Título</th>
                <th>Cliente / Contacto</th>
                <th>Estado</th>
                <th>Data Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} style={{ cursor: "pointer" }}>
                    <td className="fw-bold">{lead.title}</td>
                    <td>{lead.clientName || "N/A"}</td>
                    <td>
                      <Badge bg={getStateBadge(lead.state).variant}>
                        {getStateBadge(lead.state).text}
                      </Badge>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {loading ? "A carregar..." : "Nenhuma lead encontrada."}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Leads;
