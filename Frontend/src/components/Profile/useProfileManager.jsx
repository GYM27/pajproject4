import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { useModalManager } from "../Modal/useModalManager";

export const useProfileManager = (targetUserId, isOwnProfile) => {
    const navigate = useNavigate();
    const { modalConfig, openModal, closeModal } = useModalManager();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    // Carregar dados
    useEffect(() => {
        const load = async () => {
            try {
                const data = isOwnProfile
                    ? await userService.getMe()
                    : await userService.getUserById(targetUserId);
                setFormData(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [targetUserId, isOwnProfile]);

    // O "actionMap" que executa as ações do Modal
    const handleConfirmAction = async (data) => {
        try {
            const actionMap = {
                "USER_HARD_DELETE": async () => {
                    await userService.deleteUserPermanent(targetUserId);
                    closeModal();
                    navigate("/users");
                },
                "USER_TOGGLE_STATUS": async () => {
                    const action = data.softDelete ? "softundelete" : "softdelete";
                    await userService.toggleUserStatus(targetUserId, action);
                    closeModal();
                    window.location.reload();
                }
            };
            if (actionMap[modalConfig.type]) await actionMap[modalConfig.type]();
        } catch (err) { alert("Erro na operação"); }
    };

    return {
        formData, setFormData, loading,
        modalConfig, openModal, closeModal,
        handleConfirmAction
    };
};