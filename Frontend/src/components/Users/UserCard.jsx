import React from "react";
import {Card, Button, Badge} from "react-bootstrap";

const UserCard = ({user, onToggleStatus, onHardDelete, onViewProfile}) => {
    const isInactive = user.softDelete; // Lógica do teu JS antigo

    return (
        <Card
            className={`shadow-sm border-0 h-100 ${isInactive ? "opacity-75 bg-light" : ""}`}
            style={{borderTop: `4px solid ${isInactive ? "#ffc107" : "#28a745"}`}}
        >
            <Card.Body className="p-3 d-flex flex-column">

                {/* CABEÇALHO */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-1" style={{fontSize: "1.1rem", color: "#2c3e50"}}>
                        {user.firstName} {user.lastName}
                    </h6>
                    <Badge bg={isInactive ? "warning" : "success"}>
                        {isInactive ? "Inativo" : "Ativo"}
                    </Badge>
                </div>

                {/* CARGO / ROLE */}
                <div className="text-muted mb-3 pb-2 border-bottom" style={{fontSize: "0.85rem"}}>
                    <i className="bi bi-person-badge me-1 text-primary"></i>
                    <span className="fw-bold">{user.role || "Utilizador"}</span>
                </div>

                {/* DETALHES DE CONTACTO */}
                <div className="mb-3" style={{fontSize: "0.85rem", flexGrow: 1}}>
                    <div className="mb-1">
                        <i className="bi bi-envelope-fill text-muted me-2"></i>
                        {user.email}
                    </div>
                    <div>
                        <i className="bi bi-telephone-fill text-muted me-2"></i>
                        {user.cellphone || "N/A"}
                    </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="d-flex justify-content-end gap-2 pt-2 mt-auto border-top">
                    <Button variant="outline-primary" size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{width: "28px", height: "28px"}} title="Ver Perfil"
                            onClick={() => onViewProfile(user)}>
                        <i className="bi bi-person" style={{fontSize: "0.9rem"}}></i>
                    </Button>

                    <Button variant={isInactive ? "outline-success" : "outline-warning"} size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{width: "28px", height: "28px"}} title={isInactive ? "Reativar" : "Desativar"}
                            onClick={() => onToggleStatus(user)}>
                        <i className={`bi ${isInactive ? "bi-arrow-counterclockwise" : "bi-ban"}`}
                           style={{fontSize: "0.9rem"}}></i>
                    </Button>

                    <Button variant="outline-danger" size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{width: "28px", height: "28px"}} title="Eliminar Permanente"
                            onClick={() => onHardDelete(user)}>
                        <i className="bi bi-trash3" style={{fontSize: "0.9rem"}}></i>
                    </Button>
                </div>

            </Card.Body>
        </Card>
    );
};

export default UserCard;