import React from "react";
import { NavDropdown, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/UserStore";

const UserMenu = () => {
  const navigate = useNavigate();
  
  // 1. Extrair os dados necessários da store
  const { firstName, photoUrl, clearUser } = useUserStore();

  const handleLogout = () => {
    clearUser(); // Limpa o estado do Zustand
    localStorage.clear(); // Limpa o token e dados persistidos manualmente
    navigate("/login");
  };

  // 2. Definir a lógica de imagem (Foto do perfil ou Avatar com iniciais)
  const avatarUrl = photoUrl || `https://ui-avatars.com/api/?name=${firstName || "U"}&background=0d6efd&color=fff&rounded=true`;

  return (
    <NavDropdown 
      align="end"
      className="user-dropdown-custom"
      title={
        <div className="d-flex align-items-center text-white">
          <span className="me-2 d-none d-md-inline">{firstName}</span>
          <Image 
            src={avatarUrl} 
            roundedCircle 
            style={{ width: "32px", height: "32px", objectFit: "cover" }} // objectFit evita que a foto fique esticada
          />
        </div>
      } 
    >
      <NavDropdown.Item onClick={() => navigate("/profile")}>
        <i className="bi bi-person me-2"></i> Perfil
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleLogout} className="text-danger">
        <i className="bi bi-box-arrow-right me-2"></i> Sair
      </NavDropdown.Item>
    </NavDropdown>
  );
};

export default UserMenu;