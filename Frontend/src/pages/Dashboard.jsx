import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // 1. Importação do motor central
import "../App.css";

const Dashboard = () => {
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

  // 1. Usamos useCallback para que a função não seja recriada em cada renderização
  const fetchDashboardData = useCallback(async () => {
    try {
      // 2. Chamadas paralelas à API usando o teu wrapper centralizado
      // Nota: No teu Backend, o endpoint para leads do próprio user é /leads/me
      const leads = await api("/leads");
      const clientes = await api("/clients");

      // 3. Atualização do estado (Corrigido de 'serStats' para 'setStats')
      setStats({
        novos: leads.filter((lead) => lead.state === 1).length,
        analise: leads.filter((lead) => lead.state === 2).length,
        propostas: leads.filter((lead) => lead.state === 3).length,
        ganhos: leads.filter((lead) => lead.state === 4).length,
        perdidos: leads.filter((lead) => lead.state === 5).length,
        leads: leads.length,
        clientes: clientes.length,
      });
    } catch (error) {
      /**
       * 4. Tratamento de Erro Centralizado:
       * O erro lançado pelo api.js (ex: 401 ou erro de rede) é capturado aqui.
       */
      console.error("Erro ao carregar dados do dashboard:", error.message);

      // Se a sessão expirou, limpamos os dados e voltamos ao login
      if (
        error.message.includes("Sessão inválida") ||
        error.message.includes("401")
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="container-fluid">
      <div className="barra-welcome mb-4 p-3 bg-light rounded shadow-sm">
        <h3 className="m-0">Bem-vindo ao seu sistema CRM</h3>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            label: "Novos Leads",
            count: stats.novos,
            color: "#e0ecff",
            route: "/leads?state=1",
          },
          {
            label: "Em Análise",
            count: stats.analise,
            color: "#e0ecff",
            route: "/leads?state=2",
          },
          {
            label: "Propostas",
            count: stats.propostas,
            color: "#e0ecff",
            route: "/leads?state=3",
          },
          {
            label: "Ganhos",
            count: stats.ganhos,
            color: "#d4edda",
            route: "/leads?state=4",
          },
          {
            label: "Perdidos",
            count: stats.perdidos,
            color: "#f8d7da",
            route: "/leads?state=5",
          },
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

      <div className="row g-3">
        <div className="col-md-6">
          <div
            className="card text-center p-4 border-0 shadow-sm"
            style={{ backgroundColor: "#e0ecff", cursor: "pointer" }}
            onClick={() => navigate("/leads")}
          >
            <div className="h5 opacity-75">Total Leads</div>
            <div className="display-5 fw-bold text-primary">{stats.leads}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div
            className="card text-center p-4 border-0 shadow-sm"
            style={{ backgroundColor: "#e0ecff", cursor: "pointer" }}
            onClick={() => navigate("/clientes")}
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
