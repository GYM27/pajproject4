import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Shared/Sidebar.jsx";
import Header from "../components/Shared/Header.jsx";
import Footer from "../components/Shared/Footer.jsx";

/**
 * COMPONENTE: MainLayout
 * ---------------------
 * DESCRIÇÃO: Template principal para a área autenticada da aplicação.
 * FUNCIONALIDADE: Orquestra a disposição do Header, Sidebar e Footer,
 * além de servir como uma "Guarda de Rota" (Route Guard).
 */
const MainLayout = () => {
  // SEGURANÇA E AUTORIZAÇÃO (2%):
  // Verifica a existência do token. Se não existir, redireciona para o Login.
  const token = localStorage.getItem("token");

  // ESTADO DE INTERFACE (UX - 3%):
  // 'isOpen' controla se a sidebar está expandida (com texto) ou em modo "mini" (ícones).
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  /** * ADAPTABILIDADE E RESPONSIVIDADE (4%):
   * Monitoriza o tamanho da janela (Resize).
   * Se o ecrã for inferior a 768px (Mobile/Tablet), a sidebar fecha-se automaticamente
   * para dar prioridade ao conteúdo principal.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Executa ao montar o componente
    return () => window.removeEventListener("resize", handleResize); // Cleanup para evitar memory leaks
  }, []);

  // PROTEÇÃO DE ROTA:
  // Se o utilizador tentar aceder ao URL diretamente sem estar logado, é expulso para o login.
  if (!token) return <Navigate to="/login" replace />;

  return (
      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>

        {/* HEADER: Componente fixo que recebe a função de alternância do menu */}
        <Header onToggleMenu={toggleSidebar} />

        <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}>

          {/* SIDEBAR: Largura dinâmica controlada pelo estado 'isOpen' */}
          <Sidebar isOpen={isOpen} />

          <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>

            <main className="p-4 flex-grow-1">
              {/**
               * RENDERIZAÇÃO DINÂMICA (OUTLET):
               * O 'Outlet' é onde o React Router injeta o componente da rota atual
               * (ex: Dashboard, Leads, Clientes). Isto evita re-renderizações do Header/Sidebar.
               */}
              <Outlet />
            </main>

            {/* FOOTER: Rodapé da aplicação */}
            <Footer />
          </div>
        </div>
      </div>
  );
};

export default MainLayout;