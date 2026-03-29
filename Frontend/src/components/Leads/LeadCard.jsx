import React from "react";
import { Card } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";

const LeadCard = ({ lead, isTrashMode, isAdmin, cardActions }) => {
  return (
      <Card className="shadow-sm border-0 kanban-card mb-3">
        <Card.Body className="p-3">
          <h6 className="fw-bold mb-1">{lead.title}</h6>
          <div className="d-flex justify-content-between align-items-end border-top pt-2 mt-2">
            <div>
              <div className="fw-bold" style={{ fontSize: "0.75rem" }}>
                {lead.firstName} {lead.lastName}
              </div>
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                {lead.formattedDate}
              </div>
            </div>

            {/* Passa as ações configuradas no hook para o grupo de botões */}
            <ActionGroup
                actions={cardActions}
                item={lead}
                isTrashMode={isTrashMode}
                isAdmin={isAdmin}
            />
          </div>
        </Card.Body>
      </Card>
  );
};

export default LeadCard;