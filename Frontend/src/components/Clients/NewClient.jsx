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
    const [localError, setLocalError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        const success = await addClient(formData, isAdmin && targetUserId ? targetUserId : null);
        if (success) {
            navigate("/clients");
        } else {// Vamos à Store buscar a mensagem exata que o servidor Java devolveu!
            const errorMessage = useClientStore.getState().error;

        // Se o Java mandou mensagem, mostramos. Senão, usamos um genérico de segurança.
        setLocalError(errorMessage || "Erro ao criar cliente. Verifique os dados.");
    }
    };

    return (
        <FormContainer title="Novo Cliente" icon="bi-person-plus" loading={loading} onSubmit={handleSubmit} onCancel={() => navigate("/clients")}>
            {localError && <Alert variant="danger">{localError}</Alert>}
            <AdminAssignmentField isAdmin={isAdmin} value={targetUserId} onChange={setTargetUserId} label="Responsável pelo Cliente" />
            <Form.Group className="mb-3"><Form.Label>Nome *</Form.Label><Form.Control name="name" value={formData.name} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Telemóvel *</Form.Label><Form.Control name="phone" value={formData.phone} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Organização</Form.Label><Form.Control name="organization" value={formData.organization} onChange={handleChange} /></Form.Group>
        </FormContainer>
    );
};

export default NewClient;