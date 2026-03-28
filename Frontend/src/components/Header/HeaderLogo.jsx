import React from "react";
import { Navbar, Image } from "react-bootstrap";
import logo from "../../assets/logo.jpeg"; 

const HeaderLogo = () => (
  <Navbar.Brand href="/dashboard" className="d-flex align-items-center p-0 m-0">
    <Image 
      src={logo} 
      alt="Bridge CRM" 
      className="me-2"
      style={{ width: "40px", height: "40px", objectFit: "contain" }} 
    />
    <span className="fw-bold text-white d-none d-sm-inline">Bridge.</span>
  </Navbar.Brand>
);

export default HeaderLogo;