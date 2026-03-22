import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <nav
      id="sidebarMenu"
      className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
      style={{ minWidth: "200px", borderRight: "1px solid #dee2e6" }}
    >
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active fw-bold" : "nav-link"
              }
              to="/dashboard"
            >
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active fw-bold" : "nav-link"
              }
              to="/leads"
            >
              <i className="bi bi-person-plus me-2"></i> Leads
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active fw-bold" : "nav-link"
              }
              to="/clients"
            >
              <i className="bi bi-people me-2"></i> Clientes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active fw-bold" : "nav-link"
              }
              to="/users"
            >
              <i className="bi bi-gear me-2"></i> Utilizadores
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
