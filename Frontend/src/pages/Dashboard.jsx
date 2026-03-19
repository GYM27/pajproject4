import React, { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        novos: 0,
        analise: 0,
        propostas: 0,
        ganhos: 0,
        perdidos: 0,
        leads: 0,
        clientes: 0
    });

    const navigate = useNavigate();

    // 1. Usamos useCallback para que a função não mude a cada render
    // Isso resolve o erro "Calling setState synchronously within an effect"
    const fetchDashboardData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Chamada para buscar as Leads
            const responseLeads = await fetch('http://localhost:8080/LuisF-proj4/rest/leads', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'token': token
                }
            });

            if (responseLeads.ok) {
                const leads = await responseLeads.json();
                setStats(prev => ({
                    ...prev,
                    novos: leads.filter(l => l.state === 1).length,
                    analise: leads.filter(l => l.state === 2).length,
                    propostas: leads.filter(l => l.state === 3).length,
                    ganhos: leads.filter(l => l.state === 4).length,
                    perdidos: leads.filter(l => l.state === 5).length,
                    leads: leads.length
                }));
            }

            // Chamada para buscar Clientes
            const responseClientes = await fetch('http://localhost:8080/LuisF-proj4/rest/clients', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'token': token
                }
            });

            if (responseClientes.ok) {
                const clientes = await responseClientes.json();
                setStats(prev => ({ ...prev, clientes: clientes.length }));
            }

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        }
    }, []); // Dependências vazias: a função é criada apenas uma vez

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetchDashboardData();
    }, [navigate, fetchDashboardData]); // fetchDashboardData agora é uma dependência estável

    return (
        <div className="container-fluid">
            <div className="barra-welcome mb-4 p-3 bg-light rounded shadow-sm">
                <h3 className="m-0">Bem-vindo ao seu sistema CRM</h3>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label: 'Novos Leads', count: stats.novos, color: '#e0ecff', route: '/leads?state=1' },
                    { label: 'Em Análise', count: stats.analise, color: '#e0ecff', route: '/leads?state=2' },
                    { label: 'Propostas', count: stats.propostas, color: '#e0ecff', route: '/leads?state=3' },
                    { label: 'Ganhos', count: stats.ganhos, color: '#d4edda', route: '/leads?state=4' },
                    { label: 'Perdidos', count: stats.perdidos, color: '#f8d7da', route: '/leads?state=5' },
                ].map((item, index) => (
                    <div key={index} className="col-md-2 col-sm-4 col-6">
                        <div
                            className="card text-center p-3 border-0 shadow-sm h-100"
                            style={{ backgroundColor: item.color, cursor: 'pointer' }}
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
                        style={{ backgroundColor: '#e0ecff', cursor: 'pointer' }}
                        onClick={() => navigate('/leads')}
                    >
                        <div className="h5 opacity-75">Total Leads</div>
                        <div className="display-5 fw-bold text-primary">{stats.leads}</div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div
                        className="card text-center p-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#e0ecff', cursor: 'pointer' }}
                        onClick={() => navigate('/clientes')}
                    >
                        <div className="h5 opacity-75">Total Clientes</div>
                        <div className="display-5 fw-bold text-success">{stats.clientes}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;