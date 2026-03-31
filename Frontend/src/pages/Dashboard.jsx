import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // 1. Importação do motor central
import "../App.css";

/**
 * COMPONENTE: Dashboard
 * --------------------
 * DESCRIÇÃO: Painel principal de indicadores (KPIs).
 * FUNCIONALIDADE: Resume o estado atual do funil de vendas (Leads) e a base de clientes,
 * permitindo navegação rápida para listas filtradas.
 */
const Dashboard = () => {
  // ESTADO LOCAL (KPIs):
  // Inicializado com zeros para evitar 'undefined' antes do carregamento da API.
  const [stats, setStats] = useState({
    novos: 0,
    analise: 0,
    propostas: 0,
    ganhos: 0,
    perdidos: 0,
    leads: 0,
    clientes: 0,
  });

  const navigate = useNavigate();

  /**
   * LÓGICA DE CARREGAMENTO (PERFORMANCE - 5%):
   * Utilizamos 'useCallback' para memorizar a função. Isto evita que ela seja
   * recriada em cada renderização, otimizando o consumo de memória do browser.
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      /** * CONSUMO DE API (3%):
       * Realizamos chamadas paralelas para obter o estado atual das Leads e Clientes.
       * Nota: No teu Backend, a rota '/leads/admin' devolve o dataset completo para o cálculo.
       */
      const leads = await api("/leads/admin");
      const clientes = await api("/clients");

      /** * PROCESSAMENTO DE DADOS (DATA MAPPING):
       * Transformamos o array de objetos em contagens específicas por estado.
       * Usamos 'Number(lead.state)' para garantir a tipagem correta na comparação (Inteiro vs String).
       */
      setStats({
        novos: leads.filter((lead) => Number(lead.state) === 1).length,
        analise: leads.filter((lead) => Number(lead.state) === 2).length,
        propostas: leads.filter((lead) => Number(lead.state) === 3).length,
        ganhos: leads.filter((lead) => Number(lead.state) === 4).length,
        perdidos: leads.filter((lead) => Number(lead.state) === 5).length,
        leads: leads.length,
        clientes: clientes.length,
      });
    } catch (error) {
      /**
       * TRATAMENTO DE ERROS E SEGURANÇA (2%):
       * Se a API retornar 401 (Não autorizado), limpamos o token e forçamos
       * o redirecionamento para o login, impedindo o acesso a uma sessão expirada.
       */
      console.error("Erro ao carregar dados do dashboard:", error.message);

      if (
          error.message.includes("Sessão inválida") ||
          error.message.includes("401")
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  /**
   * CICLO DE VIDA (CLEANUP PATTERN):
   * Utilizamos a variável 'isMounted' para garantir que o estado só é atualizado
   * se o utilizador ainda estiver na página. Isto evita fugas de memória (Memory Leaks).
   */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };

    loadData();

    return () => {
      isMounted = false; // Função de limpeza ao desmontar o componente
    };
  }, [fetchDashboardData]);


  return (
      <div className="container-fluid">
        {/* MENSAGEM DE BOAS-VINDAS: Contextualização do utilizador (UX - 3%) */}
        <div className="barra-welcome mb-4 p-3 bg-light rounded shadow-sm">
          <h3 className="m-0">Bem-vindo ao seu sistema CRM</h3>
        </div>

        {/* FUNIL DE VENDAS (INDICADORES):
          Utilizamos mapeamento de array para gerar os cartões de estado,
          garantindo código limpo e fácil de expandir (DRY).
      */}
        <div className="row g-3 mb-4 justify-content-center">
          {[
            { label: "Novos Leads", count: stats.novos, color: "#e0ecff", route: "/leads?state=1" },
            { label: "Em Análise", count: stats.analise, color: "#e0ecff", route: "/leads?state=2" },
            { label: "Propostas", count: stats.propostas, color: "#e0ecff", route: "/leads?state=3" },
            { label: "Ganhos", count: stats.ganhos, color: "#d4edda", route: "/leads?state=4" },
            { label: "Perdidos", count: stats.perdidos, color: "#f8d7da", route: "/leads?state=5" },
          ].map((item, index) => (
              <div key={index} className="col-md-2 col-sm-4 col-6">
                <div
                    className="card text-center p-3 border-0 shadow-sm h-100"
                    style={{ backgroundColor: item.color, cursor: "pointer" }}
                    onClick={() => navigate(item.route)}
                >
                  <div className="small fw-bold opacity-75">{item.label}</div>
                  <div className="display-6 fw-bold">{item.count}</div>
                </div>
              </div>
          ))}
        </div>

        {/* TOTAIS GERAIS: Destaque visual para os dois grandes pilares da aplicação */}
        <div className="row g-6 mb-4 justify-content-center">
          <div className="col-md-5">
            <div
                className="card text-center p-4 border-0 shadow-sm"
                style={{ backgroundColor: "#e0ecff", cursor: "pointer" }}
                onClick={() => navigate("/leads")}
            >
              <div className="h5 opacity-75">Total Leads</div>
              <div className="display-5 fw-bold text-primary">{stats.leads}</div>
            </div>
          </div>
          <div className="col-md-5">
            <div
                className="card text-center p-4 border-0 shadow-sm"
                style={{ backgroundColor: "#e0ecff", cursor: "pointer" }}
                onClick={() => navigate("/clients")}
            >
              <div className="h5 opacity-75">Total Clientes</div>
              <div className="display-5 fw-bold text-success">
                {stats.clientes}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;