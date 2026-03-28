import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import HeaderLogo from "./Header/HeaderLogo";
import UserMenu from "./Header/UserMenu";

const Header = ({ onToggleMenu }) => {
  return (
    <Navbar expand="lg" variant="dark" className="shadow-sm fixed-top" style={{ backgroundColor: "#1e2a78", height: "56px" }}>
      <Container fluid>
        <div className="d-flex align-items-center">
          {/* Botão Hambúrguer para a Sidebar */}
          <button className="btn text-white me-3 border-0" onClick={onToggleMenu}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <HeaderLogo />
        </div>
        
        <Nav className="ms-auto">
          <UserMenu />
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;