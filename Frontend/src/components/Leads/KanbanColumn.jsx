import React from "react";
import { Badge, Button } from "react-bootstrap";
import LeadCard from "./LeadCard";

const KanbanColumn = ({ 
  col, 
  leads, 
  isTrashMode, 
  isAdmin, 
  onAddClick, 
  cardActions 
}) => {
  return (
    <div
      className="kanban-column bg-light rounded p-2 shadow-sm"
      style={{ minWidth: "280px", borderTop: `5px solid ${isTrashMode ? "#dc3545" : col.color}` }}
    >
      {/* Cabeçalho da Coluna */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-2 pt-1">
        <h6 className="fw-bold m-0 text-uppercase" style={{ fontSize: "0.85rem", color: "#555" }}>
          {col.title}
        </h6>
        <div className="d-flex align-items-center gap-2">
          {!isTrashMode && (
            <Button variant="link" className="p-0 text-secondary" onClick={() => onAddClick(col.id)}>
              <i className="bi bi-plus-circle-fill"></i>
            </Button>
          )}
          <Badge pill bg={isTrashMode ? "danger" : "secondary"} style={{ fontSize: "0.7rem" }}>
            {leads.length}
          </Badge>
        </div>
      </div>

      {/* Lista de Cartões */}
      <div className="d-flex flex-column gap-2">
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            isTrashMode={isTrashMode} 
            isAdmin={isAdmin} 
           cardActions = {cardActions}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;