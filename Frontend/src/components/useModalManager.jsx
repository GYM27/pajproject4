import { useState } from "react";

export const useModalManager = () => {
    const [modalConfig, setModalConfig] = useState({
        show: false,
        title: "",
        type: null,
        data: null,
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));
    const openModal = (type, title, data = null) => setModalConfig({ show: true, type, title, data });

    return { modalConfig, openModal, closeModal };
};