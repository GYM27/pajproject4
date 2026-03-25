import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
// --- ALTERAÇÃO: Importação das stores necessárias para obter addLead e o papel do utilizador ---
import { useLeadStore } from "../stores/LeadsStore"; 
import { useUserStore } from "../stores/UserStore";

const NewLead = () => {
  const [leadData, setLeadData] = useState({
    title: "",
    description: "",
    state: 1, 
  });

  const [error, setError] = useState(null);
  
  // --- ALTERAÇÃO: Extração correta das funções da store ---
  const { addLead, loading } = useLeadStore(); 
  // --- ALTERAÇÃO: Obtemos o userRole para passar à função addLead conforme exige a store ---
  const userRole = useUserStore((state) => state.userRole);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Se vier um targetId do ecrã anterior, guardamos. Se não (ex: não havia filtro), fica null.
  const targetUserId = location.state?.targetId || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData((prev) => ({
      ...prev,
      [name]: name === "state" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- ALTERAÇÃO: Chamada à função addLead passando o userRole exigido na nova store ---
    // A store agora espera: addLead(leadDto, userRole, targetUserId = null)
    const success = await addLead(leadData, userRole,targetUserId);

    if (success) {
      navigate("/leads");
    } else {
      setError("Erro ao guardar os dados da lead. Tente novamente.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="mb-4 fw-bold">Gestão de Lead</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Título da Oportunidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Ex: Software de Gestão"
                    value={leadData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descrição Detalhada</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Notas sobre o contacto..."
                    value={leadData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Estado Atual</Form.Label>
                  <Form.Select
                    name="state"
                    value={leadData.state}
                    onChange={handleChange}
                  >
                    <option value={1}>Novo</option>
                    <option value={2}>Em Análise</option>
                    <option value={3}>Proposta</option>
                    <option value={4}>Ganho</option>
                    <option value={5}>Perdido</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "A guardar..." : "Gravar Lead"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/leads")}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewLead;