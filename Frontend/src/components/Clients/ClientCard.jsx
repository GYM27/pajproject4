import React from "react";
import { Card } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";

const ClientCard = ({ client, isTrashMode, isAdmin, cardActions }) => { // CORREÇÃO: Recebe o cardActions

    return (
        <Card className="h-100 shadow-sm border-start border-2 border-primary">
            <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold text-truncate mb-1">{client.name}</Card.Title>

                {/* Dados de contacto */}
                <div className="border-top pt-2 mt-2" style={{ fontSize: "0.95em" }}>
                    <Card.Text className="text-primary small fw-bold mb-2">
                        <i className="bi bi-building me-2"></i>{client.organization}
                    </Card.Text>
                    <div className="text-truncate mb-1">
                        <i className="bi bi-envelope me-2 text-muted"></i>{client.email}
                    </div>
                    <div className="text-muted">
                        <i className="bi bi-telephone me-2"></i>{client.phone}
                    </div>
                </div>

                {/* Rodapé do Cartão */}
                <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <div className="text-truncate me-2">
                        <div className="fw-bold d-flex align-items-center" style={{ fontSize: "0.75rem", color: "#444" }}>
                            <i className="bi bi-person-circle me-1 text-primary" style={{ fontSize: "0.8rem" }}></i>
                            {client.firstName} {client.lastName}
                        </div>
                    </div>

                    <ActionGroup
                        actions={cardActions} /* CORREÇÃO: Passa as ações para o ActionGroup */
                        item={client}
                        isTrashMode={isTrashMode}
                        isAdmin={isAdmin}
                    />
                </div>
            </Card.Body>
        </Card>
    );
};

export default ClientCard;