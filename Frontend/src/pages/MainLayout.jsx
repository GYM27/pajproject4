import React from "react";
import { Outlet, Navigate } from "react-router-dom"; // Adicione o Navigate
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const MainLayout = () => {
    const token = localStorage.getItem("token");

    // Se NÃO houver token, redireciona para o login imediatamente
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-grow-1 d-flex flex-column">
                <Header />
                <main className="p-4 flex-grow-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;