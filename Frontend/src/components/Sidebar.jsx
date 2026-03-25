import React from "react";
import { NavLink } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "../App.css";

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/leads", icon: "bi-clipboard2-plus", label: "Leads" },
    { to: "/clients", icon: "bi-people", label: "Clientes" },
    { to: "/users", icon: "bi-gear", label: "Utilizadores" },
  ];

  return (
    <nav
      className={`sidebar-nav border-end d-flex flex-column ${isOpen ? "show" : ""}`}
      style={{
        width: isOpen
          ? "var(--sidebar-width-open)"
          : "var(--sidebar-width-closed)",
      }}
    >
      <div className="pt-5">
        {" "}
        {/* Aumentado o padding superior para não bater no botão do topo */}
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item w-100" key={item.to}>
              <OverlayTrigger
                placement="right"
                overlay={
                  !isOpen ? (
                    <Tooltip id={`t-${item.to}`}>{item.label}</Tooltip>
                  ) : (
                    <div className="d-none" />
                  )
                }
                trigger={!isOpen ? ["hover", "focus"] : []}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link py-3 d-flex align-items-center ${isActive ? "text-primary fw-bold bg-light" : "text-dark"}`
                  }
                  style={{
                    paddingLeft: isOpen ? "20px" : "0px",
                  }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minWidth: "35px", flexShrink: 0 }}
                  >
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>

                  <span
                    className="nav-label"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      visibility: isOpen ? "visible" : "hidden",
                      marginLeft: "10px",
                    }}
                  >
                    {item.label}
                  </span>
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
