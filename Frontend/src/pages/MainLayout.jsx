import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const MainLayout = () => {
  const token = localStorage.getItem("token");
  // isOpen controla se a sidebar está expandida ou em modo "mini"
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Fecha a barra automaticamente em ecrãs pequenos (Mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Header fixo no topo */}
      <Header onToggleMenu={toggleSidebar} />

      <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}> 
        {/* Sidebar com largura dinâmica */}
        <Sidebar isOpen={isOpen} />

        <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>
          <main className="p-4 flex-grow-1">
            {/* O Outlet renderiza a página atual (Dashboard, Leads, etc) */}
            <Outlet /> 
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;