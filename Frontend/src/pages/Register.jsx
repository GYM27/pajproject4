import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { registerUser } from "../services/RegisterService"; 

function Register() {
  // 1. Inicializar o estado com todos os campos necessários
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    cellphone: "",
    photoUrl: "", // URL de string
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 2. Função única para atualizar qualquer campo do formulário
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      // Chama o serviço para criar o utilizador no PostgreSQL via Wildfly
      await registerUser(inputs);
      // Sucesso: Redireciona para o login
      navigate("/login");
    } catch (err) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 py-5">
      <Card className="p-4 shadow-lg border-0" style={{ width: "30rem" }}>
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold">Criar Nova Conta</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primeiro Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={inputs.firstName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ultimo Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={inputs.lastName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={inputs.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={inputs.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contacto Telefónico</Form.Label>
              <Form.Control
                type="tel"
                name="cellphone"
                placeholder="+351"
                value={inputs.contact}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>URL da Foto de Perfil</Form.Label>
              <Form.Control
                type="text"
                name="photoUrl"
                placeholder="http://..."
                value={inputs.photoUrl}
                onChange={handleChange}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold"
            >
              Finalizar Registo
            </Button>

            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none">
                Já tem conta? Voltar ao Login
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
