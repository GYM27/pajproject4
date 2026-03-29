import React from "react";
import { Form } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";
import ActionButton from "../Shared/ActionButton";
import { BUTTON_TYPES } from "../Shared/buttonConfigs";

const KanbanHeader = ({
                        displayName,
                        leadsCount,
                        isTrashMode,
                        setIsTrashMode,
                        isAdmin,
                        filters,
                        setFilters,
                        users,
                        actions,
                      }) => {
  return (
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 p-3 bg-white rounded shadow-sm">
        {/* TÍTULO E CONTAGEM */}
        <div>
          <h2 className={`fw-bold m-0 ${isTrashMode ? "text-danger" : "text-secondary"}`} style={{ fontSize: '1.5rem' }}>
            {isTrashMode ? "LIXEIRA :" : "LEADS :"}{" "}
            <span className="text-dark opacity-75">{displayName}</span>
          </h2>
          <p className="text-muted small m-0">Total: {leadsCount} registos</p>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* FILTRO DE RESPONSÁVEL (APENAS ADMIN) */}
          {isAdmin && (
              <div className="d-flex align-items-center gap-2 me-2 border-end pe-3">
                <span className="fw-bold small text-secondary">Responsável:</span>
                <Form.Select
                    size="sm"
                    style={{ width: "180px" }}
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                >
                  <option value="">Todos</option>
                  {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
                  ))}
                </Form.Select>
              </div>
          )}

          {/* BOTÃO ALTERNAR LIXEIRA */}
          <ActionButton
              {...(isTrashMode ? BUTTON_TYPES.TRASH_CLOSE : BUTTON_TYPES.TRASH_OPEN)}
              onClick={() => setIsTrashMode(!isTrashMode)}
          />

          {/* GRUPO DE ACÇÕES EM MASSA (AUTOMÁTICO) */}
          {isAdmin && filters.userId && leadsCount > 0 && (
              <ActionGroup
                  actions={actions}
                  isTrashMode={isTrashMode}
                  isAdmin={isAdmin}
                  isBulk={true}
              />
          )}

          {/* BOTÃO NOVA LEAD (ESTILO LIMPO) */}
          {!isTrashMode && (
              <ActionButton
                  {...BUTTON_TYPES.ADD}
                  tooltip="Nova Lead"
                  onClick={() => actions.openCreate(1)}
              />
          )}
        </div>
      </div>
  );
};

export default KanbanHeader;