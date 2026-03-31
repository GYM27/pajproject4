import React from "react";
import { Button } from "react-bootstrap";

const AdminActions = ({ isDeleted, onToggleStatus, onHardDelete }) => {

    return (
        <div className="d-flex flex-column gap-2 mt-4 border-top pt-4">
            <h5 className="text-secondary mb-3">Ações de Administração</h5>

            {/* BOTÃO DESATIVAR / REATIVAR (Regra A9) */}
            <Button
                variant={isDeleted ? "success" : "warning"}
                onClick={onToggleStatus}
            >
                <i className={`bi ${isDeleted ? 'bi-check-circle' : 'bi-person-dash'} me-2`}></i>
                {isDeleted ? "Reativar Utilizador" : "Desativar Utilizador (Soft Delete)"}
            </Button>

            {/* BOTÃO ELIMINAR PERMANENTE (Regra A14) */}
            <Button
                variant="danger"
                className="mt-2"
                onClick={onHardDelete}
            >
                <i className="bi bi-trash3 me-2"></i>
                Eliminar Utilizador Permanente
            </Button>
        </div>
    );
};

export default AdminActions;