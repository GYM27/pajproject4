import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useClientStore } from "../../stores/ClientsStore";
import { useUserStore } from "../../stores/UserStore";
import { userService } from "../../services/userService";

const NewClient = () => {
    const navigate = useNavigate();
    const { addClient, loading } = useClientStore();
    const { userRole } = useUserStore();
    const isAdmin = userRole === "ADMIN";

    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    // Estado do formulário
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        organization: "",
    });

    // Estado para o Admin escolher o dono do cliente
    const [targetUserId, setTargetUserId] = useState("");

    // Se for Admin, vai buscar a lista de utilizadores para preencher a dropdown
    useEffect(() => {
        if (isAdmin) {
            userService.getAllUsers()
                .then(setUsers)
                .catch(console.error);
        }
    }, [isAdmin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Chama o método da store. Se o Admin não escolher ninguém, envia null (cria para si mesmo)
        const success = await addClient(formData, isAdmin && targetUserId ? targetUserId : null);

        if (success) {
            navigate("/clients"); // Volta para a listagem
        } else {
            setError("Erro ao criar cliente. Verifique os dados e tente novamente.");
        }
    };

    return (
        <Container className="mt-4" style={{ maxWidth: "600px" }}>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h3 className="fw-bold mb-4 text-primary">
                        <i className="bi bi-person-plus me-2"></i>Novo Cliente
                    </h3>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* EXCLUSIVO ADMIN: Dropdown de Atribuição */}
                        {isAdmin && (
                            <Form.Group className="mb-4 bg-light p-3 rounded border">
                                <Form.Label className="fw-bold text-secondary">
                                    <i className="bi bi-person-badge me-2"></i>Atribuir a Utilizador
                                </Form.Label>
                                <Form.Select
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                >
                                    <option value="">Atribuir a mim mesmo</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.firstName} {u.lastName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted small">
                                    Escolha a quem este cliente irá pertencer.
                                </Form.Text>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Nome Completo *</Form.Label>
                            <Form.Control
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ex: João Silva"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="joao@exemplo.com"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Telemóvel *</Form.Label>
                            <Form.Control
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="Ex: 912345678"
                                pattern="\d{9,15}"
                                title="Deve conter entre 9 e 15 dígitos numéricos"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Organização</Form.Label>
                            <Form.Control
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                placeholder="Ex: Tech Solutions Lda."
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                            <Button variant="outline-secondary" onClick={() => navigate("/clients")}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : "Criar Cliente"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NewClient;