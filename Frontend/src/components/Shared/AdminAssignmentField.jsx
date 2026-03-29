import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { userService } from "../../services/userService";

const AdminAssignmentField = ({ isAdmin, value, onChange, label = "Atribuir Responsável" }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (isAdmin) {
            userService.getAllUsers()
                .then(setUsers)
                .catch((err) => console.error("Erro ao carregar utilizadores:", err));
        }
    }, [isAdmin]);

    if (!isAdmin) return null;

    return (
        <Form.Group className="mb-4 bg-light p-3 rounded border">
            <Form.Label className="fw-bold text-secondary">
                <i className="bi bi-person-badge me-2"></i>{label}
            </Form.Label>
            <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Atribuir a mim mesmo</option>
                {users.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default AdminAssignmentField;