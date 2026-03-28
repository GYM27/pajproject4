import React from "react";
import { Card, Button } from "react-bootstrap";

const LeadCard = ({ 
  lead, 
  isTrashMode, 
  isAdmin, 
  onEdit, 
  onDeleteConfirm, 
  onRestore, 
  onHardDelete 
}) => {
  return (
    <Card className="shadow-sm border-0 kanban-card">
      <Card.Body className="p-3">
        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem", color: isTrashMode ? "#6c757d" : "#000" }}>
          {isTrashMode && <i className="bi bi-trash me-2 text-danger"></i>}
          {lead.title}
        </h6>


        {/* RODAPÉ DO CARD COM OS BOTÕES DINÂMICOS */}
        <div className="d-flex justify-content-between align-items-end border-top pt-2 mt-2">
          <div>
            <div className="fw-bold d-flex align-items-center" style={{ fontSize: "0.75rem", color: "#444" }}>
              <i className="bi bi-person-circle me-1 text-primary" style={{ fontSize: "0.8rem" }}></i>
              {lead.firstName} {lead.lastName}
            </div>
            <div className="text-muted" style={{ fontSize: "0.7rem" }}>
              {lead.formattedDate}
            </div>
          </div>

          <div className="d-flex gap-2">
            {isTrashMode ? (
              isAdmin ? (
                <>
                  <Button variant="outline-success" size="sm" className="p-1 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }} title="Restaurar Lead" onClick={() => onRestore(lead)}>
                    <i className="bi bi-arrow-counterclockwise" style={{ fontSize: "0.85rem" }}></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" className="p-1 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }} title="Eliminar Definitivamente" onClick={() => onHardDelete(lead)}>
                    <i className="bi bi-x-circle" style={{ fontSize: "0.85rem" }}></i>
                  </Button>
                </>
              ) : (
                <span className="text-muted" style={{ fontSize: "0.65rem", fontStyle: "italic" }}>Aguarda Admin</span>
              )
            ) : (
              <>
                <Button variant="outline-primary" size="sm" className="p-1 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }} title="Editar Lead" onClick={() => onEdit(lead)}>
                  <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }}></i>
                </Button>
                <Button variant="outline-primary" size="sm" className="p-1 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }} title="Editar Lead" onClick={() => onEdit(lead)}>
                  <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }}></i>
                </Button>
                <Button variant="outline-danger" size="sm" className="p-1 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }} title="Mover para Lixeira" onClick={() => onDeleteConfirm(lead)}>
                  <i className="bi bi-trash3" style={{ fontSize: "0.85rem" }}></i>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LeadCard;