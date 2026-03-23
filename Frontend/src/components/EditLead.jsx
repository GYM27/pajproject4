import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead, loading } = useLeadStore();
  const userRole = useUserStore((state) => state.userRole);

  const [leadData, setLeadData] = useState({
    title: "",
    description: "",
    state: 1,
  });

  // Carrega os dados da lead assim que o componente monta
  useEffect(() => {
    const leadParaEditar = leads.find((l) => String(l.id) === String(id));
    if (leadParaEditar) {
      setLeadData({
        title: leadParaEditar.title,
        description: leadParaEditar.description,
        state: leadParaEditar.state,
      });
    }
  }, [id, leads]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData((prev) => ({
      ...prev,
      [name]: name === "state" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateLead(id, leadData, userRole);
    if (success) navigate("/leads");
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h3 className="mb-4 fw-bold text-primary">Editar Lead #{id}</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                name="title"
                value={leadData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={leadData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="state" value={leadData.state} onChange={handleChange}>
                <option value={1}>Novo</option>
                <option value={2}>Em Análise</option>
                <option value={3}>Proposta</option>
                <option value={4}>Ganho</option>
                <option value={5}>Perdido</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Guardar Alterações"}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate("/leads")}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditLead;