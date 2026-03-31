import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { loginUser } from "../services/loginService.js";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

function Login() {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 1. AÇÃO UNIFICADA: Importamos apenas o 'setUser' da Store
  const { setUser } = useUserStore();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({
      ...values,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const credentials = {
        username: inputs.username.trim(),
        password: inputs.password
      };

      // 2. CHAMADA À API: O Java devolve o LoginResponseDTO
      const data = await loginUser(credentials);

      if (!data || !data.token) {
        throw new Error("O servidor não devolveu os dados de acesso necessários.");
      }

      // 3. PERSISTÊNCIA DO TOKEN: Guardamos no sessionStorage para o apiRequest.js ler
      sessionStorage.setItem("token", data.token);

      // 4. ATUALIZAÇÃO DA STORE: Guardamos os dados do utilizador de uma só vez
      // O 'data' já contém firstName e userRole vindos do Backend
      setUser(data);

      // 5. NAVEGAÇÃO: Avançamos para a área protegida
      navigate("/dashboard", { replace: true });

    } catch (err) {
      // 6. ERRO DINÂMICO: Se o Java enviar uma mensagem via ExceptionMapper,
      // ela aparece aqui automaticamente. Se for erro de código, também ajuda a debugar.
      setError(err.message || "Utilizador ou password inválidos.");

      // Útil para ver detalhes técnicos na consola do browser (F12)
      console.error("Falha no login:", err.message);
    } finally {
      setIsLoading(false);
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

                {error && (
                    <Alert variant="danger" className="py-2 small">
                      {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="fw-bold text-secondary small">Utilizador</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        placeholder="Nome de utilizador"
                        value={inputs.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold text-secondary small">Palavra-passe</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Sua password"
                        value={inputs.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="py-2"
                    />
                  </Form.Group>

                  <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                      className="w-100 py-2 fw-bold"
                  >
                    {isLoading ? "A entrar..." : "Login"}
                  </Button>

                  <div className="text-center mt-4">
                    <span className="text-muted small">Ainda não tem conta? </span>
                    <Link to="/register" className="text-decoration-none fw-bold small">
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