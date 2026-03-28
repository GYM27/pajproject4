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
 
  const navigate = useNavigate();
  const { setFirstName, setUserRole, setPhotoUrl } = useUserStore();

  // Função para lidar com as alterações nos campos do formulário
const handleChange = (event) => {
  const { name, value } = event.target;
  
  // Atualiza o estado mantendo os valores anteriores e alterando apenas o campo atual
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

    // 2. Chamada ao serviço com os dados limpos
    const data = await loginUser(credentials);

    if (!data || !data.token) {
      throw new Error("Erro: O servidor não devolveu o token de segurança");
    }

    // 3. Atualização do estado global (Zustand)
    setFirstName(data.firstName);
    setUserRole(data.userRole);
    setPhotoUrl(data.photoUrl); 

    // 4. Navegação para a área protegida
    navigate("/dashboard", { replace: true });

  } catch (err) {
    // Segurança: Mensagem genérica para não dar pistas a invasores
    setError("Utilizador ou password inválidos.");
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
