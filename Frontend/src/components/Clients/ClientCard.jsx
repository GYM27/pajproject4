import React from "react";
import { Card, Button } from "react-bootstrap";

const ClientCard = ({
  client,
  isTrashMode,
  isAdmin,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {

    
  return (
    <Card
      className="shadow-sm border-0 h-100"
      style={{ borderTop: `4px solid ${isTrashMode ? "#dc3545" : "#0d6efd"}` }}
    >
      <Card.Body className="p-3 d-flex flex-column">
        {/* CABEÇALHO DO CARTÃO */}
        <h1
          className="fw-bold mb-3 border-bottom mb-3 pb-4"
          style={{
            fontSize: "1.1rem",
            color: isTrashMode ? "#6c757d" : "#2c3e50",
          }}
        >
          {isTrashMode && <i className="bi bi-trash me-2 text-danger"></i>}
          {client.organization || "Cliente Individual"}
        </h1>

        {/* DETALHES (Email e Telefone) */}

        <div className="mb-3" style={{ fontSize: "0.85rem", flexGrow: 1 }}>
          <div className="mb-1">
            <i className="bi bi-envelope-fill text-muted me-2"></i>
            {client.email}
          </div>
          <div>
            <i className="bi bi-telephone-fill text-muted me-2"></i>
            {client.phone || "N/A"}
          </div>
          <div className="text-muted  pb-2" style={{ fontSize: "0.85rem" }}>
            <i className="bi bi-person-circle me-1 text-primary"></i>{" "}
            {client.name}
          </div>
        </div>

        {/* BOTÕES DE AÇÃO (No fundo do cartão) */}
        <div className="d-flex justify-content-end gap-2 pt-2 mt-auto border-top">
          {isTrashMode ? (
            isAdmin ? (
              <>
                <Button
                  variant="outline-success"
                  size="sm"
                  className="p-1 d-flex align-items-center justify-content-center"
                  style={{ width: "28px", height: "28px" }}
                  title="Restaurar"
                  onClick={() => onRestore(client)}
                >
                  <i
                    className="bi bi-arrow-counterclockwise"
                    style={{ fontSize: "0.9rem" }}
                  ></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="p-1 d-flex align-items-center justify-content-center"
                  style={{ width: "28px", height: "28px" }}
                  title="Eliminar Permanente"
                  onClick={() => onHardDelete(client)}
                >
                  <i
                    className="bi bi-x-circle"
                    style={{ fontSize: "0.9rem" }}
                  ></i>
                </Button>
              </>
            ) : (
              <span className="text-muted small fst-italic">Aguarda Admin</span>
            )
          ) : (
            <>
              <Button
                variant="outline-primary"
                size="sm"
                className="p-1 d-flex align-items-center justify-content-center"
                style={{ width: "28px", height: "28px" }}
                title="Editar"
                onClick={() => onEdit(client)}
              >
                <i className="bi bi-pencil" style={{ fontSize: "0.9rem" }}></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="p-1 d-flex align-items-center justify-content-center"
                style={{ width: "28px", height: "28px" }}
                title="Mover para Lixeira"
                onClick={() => onSoftDelete(client)}
              >
                <i className="bi bi-trash3" style={{ fontSize: "0.9rem" }}></i>
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ClientCard;
