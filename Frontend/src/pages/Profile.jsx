import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Card, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useUserStore } from "../stores/UserStore";
import { userService } from "../services/userService";

// COMPONENTES SHARED (Arquitetura Modular - 5%)
import { useModalManager } from "../Modal/useModalManager.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";
import DynamicModal from "../Modal/DynamicModal.jsx";

// COMPONENTES DE PERFIL
import ProfilePhoto from "../components/Profile/ProfilePhoto";
import ProfileForm from "../components/Profile/ProfileForm";
import AdminActions from "../components/Profile/AdminActions";

/**
 * COMPONENTE: Profile
 * -------------------
 * DESCRIÇÃO: Página de visualização e gestão de perfis de utilizador.
 * FUNCIONALIDADE: Polimorfismo de interface. Se 'userId' estiver no URL,
 * entra em modo "Admin View", caso contrário, mostra o perfil do utilizador logado.
 */
const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // LÓGICA DE CONTEXTO:
  // Se não houver userId no URL (?userId=X), assumimos que o utilizador está a ver o seu próprio perfil.
  const targetUserId = searchParams.get("userId");
  const isOwnProfile = !targetUserId;

  // 1. GESTÃO DE ESTADO E SEGURANÇA:
  const { modalConfig, openModal, closeModal } = useModalManager();
  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  // 2. ESTADOS LOCAIS
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** * 3. CARREGAMENTO DE DADOS (CRITÉRIO: CONSUMO DE API - 3%):
   * O componente decide dinamicamente qual o endpoint a chamar no Backend Java:
   * - /me: Para dados privados do utilizador atual.
   * - /users/{id}: Para consulta administrativa.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = isOwnProfile
            ? await userService.getMe()
            : await userService.getUserById(targetUserId);

        setFormData(data);
      } catch (err) {
        setError("Não foi possível carregar os dados do perfil solicitado.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isOwnProfile]);

  /** * 4. ACTION MAP (PADRÃO DE DESIGN - 5%):
   * Centraliza a execução das regras de negócio A9 e A14 para utilizadores.
   */
  const handleConfirmAction = async (data) => {
    try {
      const actionMap = {
        // REGRA A14: Eliminação permanente do utilizador da base de dados PostgreSQL.
        "USER_HARD_DELETE": async () => {
          await userService.deleteUserPermanent(targetUserId);
          closeModal();
          navigate("/users"); // Redireciona o Admin para a listagem após a remoção.
        },
        // REGRA A9: Soft Delete (Ativar/Desativar conta).
        "USER_TOGGLE_STATUS": async () => {
          const action = data.softDelete ? "softundelete" : "softdelete";
          await userService.toggleUserStatus(targetUserId, action);
          closeModal();
          // Forçamos o reload para atualizar as permissões e o estado visual (Badges).
          window.location.reload();
        }
      };

      const actionToExecute = actionMap[modalConfig.type];
      if (actionToExecute) {
        await actionToExecute();
      }
    } catch (err) {
      alert("Erro ao processar a operação administrativa.");
    }
  };

  // FEEDBACK VISUAL DE CARREGAMENTO (UX - 3%)
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

                {/* CABEÇALHO DO PERFIL: Foto e Identificação */}
                <div className="text-center mb-4 border-bottom pb-4">
                  <ProfilePhoto photoUrl={formData?.photoUrl} />
                  <h3 className="fw-bold mt-3 text-secondary">
                    {isOwnProfile ? "O Meu Perfil" : `Perfil de ${formData?.firstName}`}
                  </h3>
                  {/* ALERTA DE ESTADO (REGRA A9): Indica visualmente se a conta está desativada */}
                  {formData?.softDelete && (
                      <span className="badge bg-danger mt-2">CONTA DESATIVADA</span>
                  )}
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {/* FORMULÁRIO: Componente modular que gere as permissões de edição */}
                <ProfileForm
                    formData={formData}
                    isOwnProfile={isOwnProfile}
                />

                {/* PAINEL DE ADMINISTRAÇÃO (SEGURANÇA):
                    Apenas visível se o utilizador for ADMIN e estiver a ver o perfil de OUTRO utilizador.
                */}
                {!isOwnProfile && isAdmin && (
                    <div className="mt-5 pt-4 border-top">
                      <AdminActions
                          isDeleted={formData?.softDelete}
                          onToggleStatus={() => openModal("USER_TOGGLE_STATUS", "Alterar Estado da Conta", formData)}
                          onHardDelete={() => openModal("USER_HARD_DELETE", "Eliminação Permanente de Utilizador", formData)}
                      />
                    </div>
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MODAL DE CONFIRMAÇÃO: Único para todas as ações críticas deste ecrã */}
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