import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Card, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// COMPONENTES SHARED (Reutilizados)
import { useModalManager } from "../Modal/useModalManager.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";
import DynamicModal from "../Modal/DynamicModal.jsx";

// COMPONENTES DE PERFIL
import ProfilePhoto from "../components/Profile/ProfilePhoto";
import ProfileForm from "../components/Profile/ProfileForm";
import AdminActions from "../components/Profile/AdminActions";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUserId = searchParams.get("userId");
  const isOwnProfile = !targetUserId;

  // 1. GESTÃO DE MODAIS E STORE
  const { modalConfig, openModal, closeModal } = useModalManager();
  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  // 2. ESTADOS LOCAIS
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. CARREGAMENTO DE DADOS
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Se não houver userId no URL, carrega o "meu", se houver, carrega o específico
        const data = isOwnProfile
            ? await userService.getMe()
            : await userService.getUserById(targetUserId);

        setFormData(data);
      } catch (err) {
        setError("Não foi possível carregar o perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isOwnProfile]);

  // 4. LÓGICA DE EXECUÇÃO DE AÇÕES (O "Cérebro" do Modal)
  const handleConfirmAction = async (data) => {
    try {
      const actionMap = {
        // Eliminação Permanente (Regra A14)
        "USER_HARD_DELETE": async () => {
          await userService.deleteUserPermanent(targetUserId);
          closeModal();
          navigate("/users"); // Expulsa o admin para a lista de users
        },
        // Alternar entre Ativo/Inativo (Regra A9)
        "USER_TOGGLE_STATUS": async () => {
          const action = data.softDelete ? "softundelete" : "softdelete";
          await userService.toggleUserStatus(targetUserId, action);
          closeModal();
          window.location.reload(); // Recarrega para atualizar os badges e botões
        }
      };

      const actionToExecute = actionMap[modalConfig.type];
      if (actionToExecute) {
        await actionToExecute();
      }
    } catch (err) {
      alert("Erro ao processar a ação. Por favor, tente novamente.");
    }
  };

  if (loading) {
    return (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">A carregar perfil...</p>
        </div>
    );
  }

  return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">

                {/* Foto e Header */}
                <div className="text-center mb-4 border-bottom pb-4">
                  <ProfilePhoto photoUrl={formData?.photoUrl} />
                  <h3 className="fw-bold mt-3 text-secondary">
                    {isOwnProfile ? "O Meu Perfil" : `Perfil de ${formData?.firstName}`}
                  </h3>
                  {formData?.softDelete && (
                      <span className="badge bg-danger mt-2">CONTA DESATIVADA</span>
                  )}
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {/* Formulário de Dados (Apenas leitura do username garantida no ProfileForm) */}
                <ProfileForm
                    formData={formData}
                    isOwnProfile={isOwnProfile}
                />

                {/* Painel de Administração (Apenas visível para Admin e em perfis de outros) */}
                {!isOwnProfile && isAdmin && (
                    <div className="mt-5 pt-4 border-top">
                      <AdminActions
                          isDeleted={formData?.softDelete}
                          onToggleStatus={() => openModal("USER_TOGGLE_STATUS", "Alterar Estado", formData)}
                          onHardDelete={() => openModal("USER_HARD_DELETE", "Eliminação Permanente", formData)}
                      />
                    </div>
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 5. MODAL ÚNICO DE CONFIRMAÇÃO */}
        <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
          <ConfirmActionContent
              type={modalConfig.type}
              data={modalConfig.data}
              onCancel={closeModal}
              onConfirm={handleConfirmAction}
          />
        </DynamicModal>
      </Container>
  );
};

export default Profile;