import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const MainLayout = () => {
  const token = localStorage.getItem("token");
  // O estado 'isOpen' controla se a sidebar está expandida (true) ou mini (false)
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar recebe o estado atual */}
      <Sidebar isOpen={isOpen} />
    

      <div
        className="flex-grow-1 d-flex flex-column bg-light"
        style={{ minWidth: 0 }}
      >
        {/* Header recebe a função para alternar o estado */}
        <Header onToggleMenu={toggleSidebar} />

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
