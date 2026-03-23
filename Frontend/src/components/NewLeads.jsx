import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore"; // Importo a store global para gravar os dados

const NewLead = () => {
  // Utilizo o nome 'leadData' para que o estado seja genérico.
  // Isto permite-me, no futuro, reutilizar esta lógica ou este objeto para a funcionalidade de edição.
  const [leadData, setLeadData] = useState({
    title: "",
    description: "",
    state: 1, // Valor inicial (Novo) vindo do meu Enum no Java
  });

  const [error, setError] = useState(null);
  const { addLead, loading } = useLeadStore(); // Extraio as funções necessárias da minha store
  const navigate = useNavigate();

  // Função para capturar as mudanças nos inputs e atualizar o estado de forma imutável
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData((prev) => ({
      ...prev,
      // Se for o campo state, converto para inteiro para o Java não dar erro de tipo
      [name]: name === "state" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Envio o objeto leadData para a store, que por sua vez chama o meu serviço api.js
    const success = await addLead(leadData);

    if (success) {
      // Se a criação no servidor correr bem, volto para a lista de leads
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
