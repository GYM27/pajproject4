import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/loginService.js"; // Importamos do serviço centralizado

const Header = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Utilizador";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-2 shadow">
      <div className="d-flex align-items-center">
        {/* Botão sempre visível para o utilizador poder esconder a barra */}
        <button
          className="btn btn-secondary d-flex align-items-center justify-content-center me-2"
          onClick={onToggleMenu}
          style={{ width: "40px", height: "40px" }}
        >
          <i className="bi bi-list"></i>
        </button>
        <a className="navbar-brand fs-6" href="#">
          Bridge.
        </a>
      </div>

      <div className="navbar-nav px-3 d-flex flex-row align-items-center">
        <span className="text-white me-3 d-none d-sm-inline">
          Olá, {userName}
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
