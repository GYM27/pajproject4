import React from "react";
import { Button } from "react-bootstrap";

const GenericModalContent = ({ type, data, onConfirm, onCancel }) => {
    const isHardDelete = type === "HARD_DELETE";
    const isBulk = type.includes("BULK");

    const getIcon = () => {
        if (isHardDelete || isBulk) return "bi-exclamation-octagon text-danger";
        return "bi-exclamation-triangle text-warning";
    };

    return (
        <div className="p-3 text-center">
            <i className={`bi ${getIcon()}`} style={{ fontSize: "2.5rem" }}></i>
            <p className="mt-3">
                {isBulk ? "Deseja mover TODOS os registos selecionados para a lixeira?" :
                    isHardDelete ? `Eliminar permanentemente "${data?.title || data?.name}"?` :
                        `Mover "${data?.title || data?.name}" para a lixeira?`}
            </p>
            {isHardDelete && <p className="text-muted small">Esta ação não pode ser desfeita e os dados serão perdidos para sempre.</p>}

            <div className="d-flex gap-2 justify-content-center mt-4">
                <Button variant="outline-secondary" onClick={onCancel}>Cancelar</Button>
                <Button
                    variant="danger"
                    onClick={() => onConfirm(data)}
                >
                    {isHardDelete ? "Eliminar Definitivamente" : "Confirmar"}
                </Button>
            </div>
        </div>
    );
};

export default GenericModalContent;