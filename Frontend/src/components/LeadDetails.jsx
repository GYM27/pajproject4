import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
// Importação do novo componente de Modal
import ConfirmModal from "../components/ConfirmModal"; 

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, deleteLead } = useLeadStore();
  const userRole = useUserStore((state) => state.userRole);

  // Estado para controlar a visibilidade do Modal
  const [showModal, setShowModal] = useState(false);

  // Procura a lead específica nos dados que já temos
  const lead = leads.find((l) => String(l.id) === String(id));

  if (!lead) {
    return (
      <Container className="mt-4">
        <p>Lead não encontrada.</p>
      </Container>
    );
  }

  // Função disparada ao clicar no botão "Apagar" do card
  const handleDeleteClick = () => {
    setShowModal(true); // Abre o modal em vez do confirm do windows
  };

  // Função executada apenas quando o utilizador confirma no Modal
  const handleConfirmDelete = async () => {
    const success = await deleteLead(id, userRole);
    if (success) {
      setShowModal(false);
      navigate("/leads");
    }
  };

  return (
    <Container className="mt-4">
      <Button
        variant="link"
        onClick={() => navigate("/leads")}
        className="mb-3 p-0"
      >
        <i className="bi bi-arrow-left"></i> Voltar para a lista
      </Button>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h2 className="fw-bold mb-1 justify-content-center">{lead.title}</h2>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={12}>
              <h5>Descrição</h5>
              <p className="bg-light p-3 rounded">
                {lead.description || "Sem descrição disponível."}
              </p>
              <p className="text-muted fw-bold">Criada em: {lead.formattedDate}</p>
            </Col>
          </Row>

          <hr />

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/leads/edit/${id}`)}
            >
              <i className="bi bi-pencil"></i> 
            </Button>

            {/* Botão alterado para chamar a função que abre o modal */}
            <Button variant="danger" onClick={handleDeleteClick}>
              <i className="bi bi-trash"></i> 
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Componente Modal adicionado ao final do Container */}
      <ConfirmModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminação"
        message={`Tem a certeza que deseja apagar a lead "${lead.title}"? Esta ação poderá ser revertida pelo administrador.`}
        variant="danger"
      />
    </Container>
  );
};

export default LeadDetails;