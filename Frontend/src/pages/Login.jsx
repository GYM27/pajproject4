import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../stores/UserStore"; // Importa a tua Store do Zustand
import { loginUser } from "../services/loginService.js"; // Importa o Serviço de API
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

  // Hooks de navegação e estado global
  const setUserRole = useUserStore((state) => state.setUserRole);
  const navigate = useNavigate();
  const setFirstName = useUserStore((state) => state.setFirstName);

  // Função para lidar com as alterações nos campos do formulário
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await loginUser(inputs);

      // Se o serviço devolveu o token, guardamos no "baú" do browser
      if (!data || !data.token) {
        throw new Error("Erro: O servidor não devolveu o token de segurança");
      }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.firstName); 
        localStorage.setItem("lastName", data.lastName); 
        localStorage.setItem("userRole", data.userRole); 

      //Atualizamos o mural global (Zustand) com a nova função
      setFirstName(data.firstName);
      setUserRole(data.userRole);

      // REGRAS DE NAVEGAÇÃO:
      // Usamos o navigate para o DASHBOARD, não para o login novamente
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Captura de erro genérica ou fornecida pelo serviço
      setError(err.message || "Ocorreu um erro ao iniciar sessão. Tente novamente.");
    } finally {
      // Executa sempre, quer haja sucesso ou erro, para libertar o botão
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

              {/* Renderização Condicional do Alerta de Erro */}
              {error && (
                <Alert variant="danger" className="py-2">
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
                    disable={isLoading}
                    className="py-2"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
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
