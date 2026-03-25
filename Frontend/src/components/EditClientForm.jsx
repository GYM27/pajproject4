import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useClientStore } from "../stores/ClientsStore";

const EditClientForm = ({ clientData, onSuccess, onCancel }) => {
  const { updateClient, loading } = useClientStore();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: clientData.name || "",
    email: clientData.email || "",
    phone: clientData.phone || "",
    organization: clientData.organization || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const success = await updateClient(clientData.id, formData);
    if (success) {
      onSuccess();
    } else {
      setError("Erro ao atualizar o cliente.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Nome Completo</Form.Label>
        <Form.Control 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Telemóvel</Form.Label>
        <Form.Control 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Organização</Form.Label>
        <Form.Control 
          name="organization" 
          value={formData.organization} 
          onChange={handleChange} 
        />
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

export default EditClientForm;