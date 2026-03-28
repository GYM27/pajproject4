import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Alert,
  Spinner,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { useUserStore } from "../stores/UserStore";
import api from "../services/api";
import { userService } from "../services/userService";

// COMPONENTES IMPORTADOS
import ProfilePhoto from "../components/Profile/ProfilePhoto";
import ProfileForm from "../components/Profile/ProfileForm";
import AdminActions from "../components/Profile/AdminActions";
import DynamicModal from "../components/DynamicModal";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId"); // Se existir, é Admin a ver outra pessoa
  const isOwnProfile = !targetUserId;

  const navigate = useNavigate();
  const { userRole, setFirstName } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [modalConfig, setModalConfig] = useState({ show: false });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    cellphone: "",
    photoUrl: "",
  });

  // CORREÇÃO: useEffect unificado e limpo
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;

        if (targetUserId && isAdmin) {
          // Rota para Admin ver perfil alheio
          data = await userService.getUserById(targetUserId);
        } else {
          // Carrega o perfil do próprio utilizador
          data = await userService.getMe();
        }

        setFormData({ ...data, password: "" }); // Password nunca é enviada por segurança
      } catch (err) {
        setError("Não foi possível carregar os dados do utilizador.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Define o endpoint de gravação baseado no contexto
      const endpoint =
        !isOwnProfile && isAdmin ? `/users/admin/${targetUserId}` : "/users/me";
      await api(endpoint, "PUT", formData);

      if (isOwnProfile) {
        setFirstName(formData.firstName); // Atualiza o nome no Header/Sidebar
        localStorage.setItem("userName", formData.firstName);
        alert("Perfil atualizado com sucesso!");
      } else {
        alert("Perfil do utilizador atualizado pelo Administrador!");
      }
    } catch (err) {
      setError("Erro ao atualizar o perfil. Verifique os dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmHardDelete = async () => {
    try {
      await userService.deleteUserPermanent(targetUserId);
      navigate("/users");
    } catch (err) {
      alert("Erro ao remover utilizador. Pode ainda ter leads ativas.");
      setModalConfig({ show: false });
    }
  };

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>A carregar perfil...</p>
      </Container>
    );

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <ProfilePhoto
                photoUrl={formData.photoUrl}
                firstName={formData.firstName}
                lastName={formData.lastName}
              />

              <h3 className="text-center fw-bold mb-4">
                {isOwnProfile
                  ? "O Meu Perfil"
                  : `Perfil de ${formData.firstName}`}
              </h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <ProfileForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isOwnProfile={isOwnProfile}
                loading={saving}
              />

              {/* Botões de atalho para Admin gerir o utilizador */}
              {!isOwnProfile && isAdmin && (
                <AdminActions
                  userId={targetUserId}
                  onHardDelete={() => setModalConfig({ show: true })}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <DynamicModal
        show={modalConfig.show}
        onHide={() => setModalConfig({ show: false })}
        title="Ação Irreversível"
      >
        <div className="text-center p-3">
          <i className="bi bi-exclamation-octagon text-danger display-4"></i>
          <p className="mt-3">
            Vai apagar <strong>PERMANENTEMENTE</strong> o utilizador{" "}
            {formData.firstName}.<br />
            As suas leads e clientes ficarão órfãos. Esta ação não pode ser
            desfeita.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setModalConfig({ show: false })}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmHardDelete}>
              Sim, Apagar Conta
            </Button>
          </div>
        </div>
      </DynamicModal>
    </Container>
  );
};

export default Profile;
