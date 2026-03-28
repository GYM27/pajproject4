import React from "react";
import { Button, Form } from "react-bootstrap";

const KanbanHeader = ({
  displayName,
  leadsCount,
  isTrashMode,
  setIsTrashMode,
  isAdmin,
  filters,
  setFilters,
  users,
  actions, // Objeto com as funções: openCreate, openBulkDeleteConfirm, etc.
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2
          className={`fw-bold m-0 ${isTrashMode ? "text-danger" : "text-secondary"}`}
        >
          {isTrashMode ? "LIXEIRA :" : "LEADS :"}{" "}
          <span className="text-dark opacity-75">{displayName}</span>
        </h2>
        <p className="text-muted small m-0">Total: {leadsCount} leads</p>
      </div>

      <div className="d-flex gap-3 align-items-center">
        <Button
          variant={isTrashMode ? "primary" : "outline-primary"}
          onClick={() => setIsTrashMode(!isTrashMode)}
        >
          <i
            className={`bi ${isTrashMode ? "bi-arrow-left" : "bi-trash"} me-1`}
          ></i>
          {isTrashMode ? "Sair da Lixeira" : "Ver Lixeira"}
        </Button>

        {!isTrashMode && (
          <>
            <Button
              variant="outline-primary"
              onClick={() => actions.openCreate(1)}
            >
              <i className="bi bi-clipboard2-plus me-1"></i>Nova Lead
            </Button>
            {isAdmin && filters.userId && leadsCount > 0 && (
              <Button
                variant="outline-danger"
                onClick={actions.openBulkDeleteConfirm}
              >
                <i className="bi bi-trash-fill me-1"></i> Mover Tudo
              </Button>
            )}
          </>
        )}

        {isTrashMode && isAdmin && filters.userId && leadsCount > 0 && (
          <>
            <Button variant="success" onClick={actions.onRestoreAll}>
              <i className="bi bi-arrow-counterclockwise me-1"></i> Restaurar
              Tudo
            </Button>
            <Button variant="danger" onClick={actions.openEmptyTrashConfirm}>
              <i className="bi bi-trash3 me-1"></i> Apagar Tudo
            </Button>
          </>
        )}

        {isAdmin && (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold small text-secondary">Responsável:</span>
            <Form.Select
              size="sm"
              style={{ width: "200px" }}
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
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
      </div>
    </div>
  );
};

export default KanbanHeader;
