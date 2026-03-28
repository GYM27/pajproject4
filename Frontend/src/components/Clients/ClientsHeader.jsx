import React from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ClientsHeader = ({
  isTrashMode,
  setIsTrashMode,
  isAdmin,
  filters,
  setFilters,
  users,
  hasClients,
  clientsCount, // novo — equivalente ao leadsCount do KanbanHeader
  actions,
}) => {
  const navigate = useNavigate();

  const selectedUser = users.find((u) => String(u.id) === String(filters.userId));
  const displayName = selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Todos";

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      {/* TÍTULO + CONTAGEM — igual ao KanbanHeader */}
      <div>
        <h2 className={`fw-bold m-0 ${isTrashMode ? "text-danger" : "text-secondary"}`}>
          {isTrashMode ? "LIXEIRA :" : "CLIENTES :"}{" "}
          <span className="text-dark opacity-75">{displayName}</span>
        </h2>
        <p className="text-muted small m-0">Total: {clientsCount} clientes</p>
      </div>

      {/* AÇÕES + FILTRO — inline como no KanbanHeader */}
      <div className="d-flex gap-3 align-items-center flex-wrap">

        <Button
          variant={isTrashMode ? "primary" : "outline-primary"}
          onClick={() => setIsTrashMode(!isTrashMode)}
        >
          <i className={`bi ${isTrashMode ? "bi-arrow-left" : "bi-trash"} me-1`}></i>
          {isTrashMode ? "Sair da Lixeira" : "Ver Lixeira"}
        </Button>

        {!isTrashMode && (
          <>
            <Button variant="outline-primary" onClick={() => navigate("/clients/new")}>
              <i className="bi bi-person-plus me-1"></i> Novo Cliente
            </Button>
            {isAdmin && filters.userId && hasClients && (
              <Button variant="outline-danger" onClick={() => actions.openBulkActionConfirm("DEACTIVATE_ALL")}>
                <i className="bi bi-trash-fill me-1"></i> Mover Tudo
              </Button>
            )}
          </>
        )}

        {isTrashMode && isAdmin && filters.userId && hasClients && (
          <>
            <Button variant="success" onClick={() => actions.openBulkActionConfirm("RESTORE_ALL")}>
              <i className="bi bi-arrow-counterclockwise me-1"></i> Restaurar Tudo
            </Button>
            <Button variant="danger" onClick={() => actions.openBulkActionConfirm("EMPTY_TRASH")}>
              <i className="bi bi-trash3 me-1"></i> Apagar Tudo
            </Button>
          </>
        )}

        {/* FILTRO DE RESPONSÁVEL — inline como no KanbanHeader */}
        {isAdmin && (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold small text-secondary">Responsável:</span>
            <Form.Select
              size="sm"
              style={{ width: "200px" }}
              value={filters.userId}
              onChange={(e) => setFilters({ userId: e.target.value })}
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

export default ClientsHeader;