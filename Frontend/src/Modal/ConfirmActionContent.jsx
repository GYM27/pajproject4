import React from "react";
import { Button } from "react-bootstrap";

/**
 * Componente Único para Conteúdos de Confirmação.
 * Centraliza ícones, textos e cores baseados no 'type'.
 */
const ConfirmActionContent = ({ type, data, onCancel, onConfirm }) => {

    // 1. Dicionário de configuração para cada tipo de ação
    const getModalInfo = () => {
        switch (type) {
            case "SOFT_DELETE":
                return {
                    icon: "bi-trash text-warning",
                    message: `Tem a certeza que deseja mover "${data?.title || data?.name}" para a lixeira?`,
                    confirmText: "Mover para Lixeira",
                    variant: "warning",
                };
            case "HARD_DELETE":
                return {
                    icon: "bi-exclamation-triangle text-danger",
                    message: `Deseja eliminar permanentemente "${data?.title || data?.name}"? Esta ação não pode ser desfeita.`,
                    confirmText: "Eliminar Permanente",
                    variant: "danger",
                };
            case "BULK_SOFT_DELETE":
                return {
                    icon: "bi-trash-fill text-warning",
                    message: "Tem a certeza que deseja mover todos os itens selecionados para a lixeira?",
                    confirmText: "Mover Tudo",
                    variant: "warning",
                };
            case "BULK_HARD_DELETE":
                return {
                    icon: "bi-exclamation-octagon text-danger",
                    message: "Deseja esvaziar a lixeira definitivamente? Todos os itens serão perdidos para sempre.",
                    confirmText: "Esvaziar Lixeira",
                    variant: "danger",
                };
            case "USER_HARD_DELETE":
                // Novo tipo específico para a gestão de utilizadores
                return {
                    icon: "bi-person-x text-danger",
                    message: `Está prestes a apagar permanentemente o utilizador "${data?.name}". O acesso será revogado e os seus dados serão reatribuídos ao sistema.`,
                    confirmText: "Apagar Utilizador",
                    variant: "danger",
                };
            case "RESTORE_LEAD":
                return {
                    icon: "bi-arrow-counterclockwise text-success",
                    message: `Tem a certeza que deseja restaurar a lead "${data?.title || data?.name}"? Ela voltará a estar ativa no quadro principal.`,
                    confirmText: "Sim, Restaurar",
                    variant: "success", // Torna o botão verde
                };
            case "RESTORE_ALL":
                return {
                    icon: "bi-arrow-counterclockwise text-success",
                    message: "Tem a certeza que deseja restaurar TODOS os itens visíveis na lixeira? Eles voltarão a estar ativos.",
                    confirmText: "Sim, Restaurar Tudo",
                    variant: "success",
                };
            case "USER_TOGGLE_STATUS": {
                const isInactive = data?.softDelete;
                return {
                    icon: isInactive ? "bi-person-check-fill text-success" : "bi-person-dash-fill text-warning",
                    message: isInactive
                        ? `Deseja reativar a conta de "${data?.firstName}"? O utilizador voltará a ter acesso.`
                        : `Deseja desativar a conta de "${data?.firstName}"? O utilizador deixará de conseguir fazer login.`,
                    confirmText: isInactive ? "Sim, Reativar" : "Sim, Desativar",
                    variant: isInactive ? "success" : "warning",
                };
            }

            default:
                return {
                    icon: "bi-question-circle",
                    message: "Tem a certeza que deseja realizar esta ação?",
                    confirmText: "Confirmar",
                    variant: "primary",
                };

        }
    };

    const info = getModalInfo();

    return (
        <div className="text-center p-3">
            {/* Ícone dinâmico baseado no nível de perigo da ação */}
            <i className={`${info.icon} display-4 mb-3 d-block`}></i>

            {/* Mensagem personalizada que usa o nome/título do item */}
            <p className="mb-4 lead" style={{ fontSize: "1.1rem" }}>
                {info.message}
            </p>

            {/* Botões de ação padronizados */}
            <div className="d-flex justify-content-center gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    variant={info.variant}
                    onClick={() => onConfirm(data)} // Devolve os dados para a função que chamou o modal
                >
                    {info.confirmText}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmActionContent;