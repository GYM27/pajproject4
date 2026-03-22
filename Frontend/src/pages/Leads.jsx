import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Badge, Spinner } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import "../App.css"; // Uso o ficheiro de estilos que já tem os meus cards

const Leads = () => {
  const { leads, loading, fetchMyLeads } = useLeadStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyLeads();
  }, [fetchMyLeads]);

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
        <h2 className="fw-bold">Gestão de Oportunidades</h2>
        <Button variant="primary" onClick={() => navigate("/leads/new")}>
          + Nova Lead
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-4">
          {leads.map((lead) => {
            const style = getStateStyle(lead.state);
            return (
              <Col key={lead.id} md={6} lg={4}>
                {/* Reaproveito a classe clientes-card que criei para manter a consistência */}
                <div
                  className="clientes-card p-3 shadow-sm h-100"
                  style={{ borderLeft: `5px solid ${style.color}` }}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-bold text-dark mb-1">{lead.title}</h5>
                    <Badge style={{ backgroundColor: style.color }}>
                      {style.label}
                    </Badge>
                  </div>

                  <p className="text-muted small mb-3">
                    {lead.description?.substring(0, 80)}...
                  </p>

                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="small text-secondary">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="link"
                      className="p-0 text-primary fw-bold text-decoration-none"
                    >
                      Ver detalhes
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
