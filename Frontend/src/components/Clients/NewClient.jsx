import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Form } from "react-bootstrap";
import { useClientStore } from "../../stores/ClientsStore";
import { useUserStore } from "../../stores/UserStore";
import FormContainer from "../Shared/FormContainer";
import AdminAssignmentField from "../Shared/AdminAssignmentField";

const NewClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addClient, loading } = useClientStore();
    const userRole = useUserStore((state) => state.userRole);
    const isAdmin = userRole === "ADMIN";

    const [formData, setFormData] = useState({ name: "", email: "", phone: "", organization: "" });
    const [targetUserId, setTargetUserId] = useState(location.state?.targetId || "");
    const [error, setError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const success = await addClient(formData, isAdmin && targetUserId ? targetUserId : null);
        if (success) navigate("/clients");
        else setError("Erro ao criar cliente.");
    };

    return (
        <FormContainer title="Novo Cliente" icon="bi-person-plus" loading={loading} onSubmit={handleSubmit} onCancel={() => navigate("/clients")}>
            {error && <Alert variant="danger">{error}</Alert>}
            <AdminAssignmentField isAdmin={isAdmin} value={targetUserId} onChange={setTargetUserId} label="Responsável pelo Cliente" />
            <Form.Group className="mb-3"><Form.Label>Nome *</Form.Label><Form.Control name="name" value={formData.name} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Telemóvel *</Form.Label><Form.Control name="phone" value={formData.phone} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Organização</Form.Label><Form.Control name="organization" value={formData.organization} onChange={handleChange} /></Form.Group>
        </FormContainer>
    );
};

export default NewClient;