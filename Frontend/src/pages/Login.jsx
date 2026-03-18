import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore"; // Importa a tua Store do Zustand
import { loginUser } from "../services/LoginService"; // Importa o Serviço de API
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";

function Login() {
  // Estado local para capturar os dados dos inputs
  const [inputs, setInputs] = useState({ username: "", password: "" });

  // Estado para gerir mensagens de erro da API
  const [error, setError] = useState(null);

  // Hooks de navegação e estado global
  const navigate = useNavigate();
  const updateName = useUserStore((state) => state.updateName);

  // Função para lidar com as alterações nos campos do formulário
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  // Função para submeter o formulário (Tratamento Assíncrono)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Limpa erros anteriores

    try {
      // Chama a lógica de rede isolada no ficheiro de serviço
      const data = await loginUser(inputs);

      // Sucesso: Atualiza o nome do utilizador na Store persistente
      updateName(data.username || inputs.username);

      // Navega para o dashboard sem permitir voltar atrás na pilha do browser
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Captura o erro lançado pelo serviço e mostra ao utilizador
      setError(err.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col>
          <Card className="shadow-lg border-0" style={{ width: "22rem" }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Bem-vindo</h2>
              </div>

              {/* Renderização Condicional do Alerta de Erro */}
              {error && (
                <Alert variant="danger" className="py-2">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Utilizador</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nome de utilizador"
                    value={inputs.username}
                    onChange={handleChange}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Palavra-passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Sua password"
                    value={inputs.password}
                    onChange={handleChange}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold"
                >
                  Login
                </Button>
                <div className="text-center mt-4">
                  <span className="text-muted">Ainda não tem conta? </span>
                  <Link to="/register" className="text-decoration-none fw-bold">
                    Registe-se aqui
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
