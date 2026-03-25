import React, { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";

// Recebe os dados da lead e as funções para fechar o modal
const EditLeadForm = ({ leadData: initialData, onSuccess, onCancel }) => {
  const { updateLead, loading } = useLeadStore();
  const userRole = useUserStore((state) => state.userRole);

  // Inicializa o formulário diretamente com os dados que vêm do componente pai (via prop initialData)
  // O useEffect deixa de ser necessário porque não tens de esperar que o URL carregue
  const [leadData, setLeadData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    state: initialData.state || 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData((prev) => ({
      ...prev,
      [name]: name === "state" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // DEBUG: Verifica o que está a ser enviado
    console.log("Dados enviados para a API:", leadData);
    // Usa o ID que veio da prop initialData
    const success = await updateLead(initialData.id, leadData, userRole);

    // Se gravou com sucesso, fecha o modal em vez de navegar
    if (success) {
      onSuccess();
    }
  };

  return (
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

      <div className="d-flex gap-2 justify-content-end">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Guardar Alterações"}
        </Button>
      </div>
    </Form>
  );
};

export default EditLeadForm;
