import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Form } from "react-bootstrap";
import { useLeadStore } from "../../stores/LeadsStore";
import { useUserStore } from "../../stores/UserStore";
import FormContainer from "../Shared/FormContainer";
import AdminAssignmentField from "../Shared/AdminAssignmentField";

const NewLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addLead, loading } = useLeadStore();
  const userRole = useUserStore((state) => state.userRole);
  const isAdmin = userRole === "ADMIN";

  // 1. Captura o estado inicial enviado pelo clique na coluna (ou usa 1 como padrão)
  const initialStateFromKanban = location.state?.initialState || 1;

  const [leadData, setLeadData] = useState({
    title: "",
    description: "",
    state: initialStateFromKanban,
  });
  const [targetUserId, setTargetUserId] = useState(location.state?.targetId || "");
  const [error, setError] = useState(null);

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
    const success = await addLead(leadData, userRole, isAdmin && targetUserId ? targetUserId : null);
    if (success) navigate("/leads");
    else setError("Erro ao guardar a lead.");
  };

  return (
      <FormContainer title="Nova Lead" icon="bi-clipboard-plus" loading={loading} onSubmit={handleSubmit} onCancel={() => navigate("/leads")}>
        {error && <Alert variant="danger">{error}</Alert>}
        <AdminAssignmentField isAdmin={isAdmin} value={targetUserId} onChange={setTargetUserId} />
        <Form.Group className="mb-3">
          <Form.Label>Título da Lead</Form.Label>
          <Form.Control name="title" value={leadData.title} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={leadData.description} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Estado Inicial</Form.Label>
          <Form.Select name="state" value={leadData.state} onChange={handleChange}>
            <option value={1}>Novo</option>
            <option value={2}>Em Análise</option>
            <option value={3}>Proposta</option>
            <option value={4}>Ganho</option>
            <option value={5}>Perdido</option>
          </Form.Select>
        </Form.Group>
      </FormContainer>
  );
};

export default NewLeads;