import React from "react";
import { NavLink } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useUserStore } from "../stores/UserStore";
import "../App.css";

const Sidebar = ({ isOpen }) => {
  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  // 1. Configuração centralizada e limpa
  const allItems = [
    { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/leads", icon: "bi-clipboard2-plus", label: "Leads" },
    { to: "/clients", icon: "bi-people", label: "Clientes" },
    { to: "/users", icon: "bi-gear", label: "Utilizadores", adminOnly: true },
  ];

  // 2. Filtro de permissões
  const menuItems = allItems.filter(item => !item.adminOnly || isAdmin);

  return (
      <nav className={`sidebar-nav border-end d-flex flex-column ${isOpen ? "is-open" : "is-closed"}`}>
        <div className="pt-5">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
                <li className="nav-item w-100" key={item.to}>
                  <OverlayTrigger
                      placement="right"
                      disabled={isOpen} // Simplificado: se aberto, o tooltip não ativa
                      overlay={<Tooltip id={`t-${item.to}`}>{item.label}</Tooltip>}
                  >
                    <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                            `nav-link py-3 d-flex align-items-center ${isActive ? "active-link" : "text-dark"}`
                        }
                    >
                      <div className="nav-icon-wrapper">
                        <i className={`bi ${item.icon} fs-4`}></i>
                      </div>
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  </OverlayTrigger>
                </li>
            ))}
          </ul>
        </div>
      </nav>
  );
};

export default Sidebar;