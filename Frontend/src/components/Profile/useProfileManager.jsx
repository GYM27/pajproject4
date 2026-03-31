import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { useModalManager } from "../Modal/useModalManager";

/**
 * HOOK PERSONALIZADO: useProfileManager
 * ------------------------------------
 * DESCRIÇÃO: Centraliza a lógica de gestão de perfil.
 * OBJETIVO: Isolar as chamadas à API e a gestão de estados complexos (Modais/Carregamento),
 * permitindo que o componente visual (Profile.jsx) se foque apenas no layout.
 * * @param {string} targetUserId - ID do utilizador a carregar (se Admin).
 * @param {boolean} isOwnProfile - Define se a fonte de dados é '/me' ou um ID específico.
 */
export const useProfileManager = (targetUserId, isOwnProfile) => {
    const navigate = useNavigate();

    // REUTILIZAÇÃO DE CÓDIGO: Integração com o gestor de modais global do projeto
    const { modalConfig, openModal, closeModal } = useModalManager();

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    /**
     * EFEITO DE CARREGAMENTO (CICLO DE VIDA):
     * Executa sempre que o componente é montado ou o ID do alvo muda.
     * Implementa a lógica de segurança: se for o próprio perfil, usa o endpoint privado 'getMe'.
     */
    useEffect(() => {
        const load = async () => {
            try {
                // Decisão de rota baseada no contexto (Próprio Perfil vs Admin a ver Staff)
                const data = isOwnProfile
                    ? await userService.getMe()
                    : await userService.getUserById(targetUserId);
                setFormData(data);
            } catch (err) {
                console.error("Erro ao carregar dados do perfil:", err);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [targetUserId, isOwnProfile]);

    /**
     * ACTION MAP (PADRÃO DE DESIGN):
     * Mapeia tipos de modais para funções assíncronas específicas.
     * Facilita a manutenção: para adicionar uma nova ação de Admin, basta acrescentar uma chave aqui.
     */
    const handleConfirmAction = async (data) => {
        try {
            const actionMap = {
                // REGRA A14: Remoção definitiva da base de dados PostgreSQL
                "USER_HARD_DELETE": async () => {
                    await userService.deleteUserPermanent(targetUserId);
                    closeModal();
                    navigate("/users"); // Redireciona para a lista após apagar
                },
                // REGRA A9: Soft Delete (Ativar/Desativar utilizador sem apagar registos)
                "USER_TOGGLE_STATUS": async () => {
                    const action = data.softDelete ? "softundelete" : "softdelete";
                    await userService.toggleUserStatus(targetUserId, action);
                    closeModal();
                    // Força o refresh para garantir que as permissões e badges atualizam
                    window.location.reload();
                }
            };

            // Execução dinâmica baseada no tipo de modal aberto
            if (actionMap[modalConfig.type]) {
                await actionMap[modalConfig.type]();
            }
        } catch (err) {
            alert("Erro na operação de administração.");
        }
    };

    // Exportação do estado e funções para serem consumidos pelo componente Profile.jsx
    return {
        formData, setFormData, loading,
        modalConfig, openModal, closeModal,
        handleConfirmAction
    };
};