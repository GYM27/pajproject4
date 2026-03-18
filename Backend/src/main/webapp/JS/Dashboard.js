const BASE_URL = "http://localhost:8080/LuisF-JoseD-proj3/rest/users";
let leadList = [];
let clientesList = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosDoServidor();
});

// Atualiza os dados sempre que a janela ganha foco para garantir frescura dos dados
window.addEventListener("focus", () => {
    carregarDadosDoServidor();
});

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        //"username": localStorage.getItem("userName"),
        //"password": localStorage.getItem("userPass")
        "token": localStorage.getItem("token")
    };
}

async function carregarDadosDoServidor() {
    const token = localStorage.getItem("token");
    
    // Validar se o utilizador está logado
    if (!token) {
        window.location.href = "Login.html";
        return;
    }

    try {
        //Listar leads do utilizador no servidor
        const resLeads = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/users/me/leads`, {
            method: "GET",
            headers: getAuthHeaders() 
        });
        
        //Listar clientes do utilizador no servidor
        const resClientes = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/me`, {
            method: "GET",
            headers: getAuthHeaders() 
        });

        if (resLeads.ok) leadList = await resLeads.json();
        if (resClientes.ok) clientesList = await resClientes.json();

        atualizarDashboard();
    } catch (error) {
        console.error("Erro ao contactar o servidor:", error);
    }
}

function atualizarDashboard() {
    // Filtros baseados em identificadores numéricos (STATE_ID)
    // Exemplo: 1=Novo, 2=Em Análise, 3=Proposta, 4=Ganho, 5=Perdido
    const novos = leadList.filter(l => l.state === 1).length;
    const analise = leadList.filter(l => l.state === 2).length;
    const propostas = leadList.filter(l => l.state === 3).length;
    const ganhos = leadList.filter(l => l.state === 4).length;
    const perdidos = leadList.filter(l => l.state === 5).length;

    // Atualização dos elementos HTML
    document.getElementById("totalNovos").textContent = novos;
    document.getElementById("totalAnalise").textContent = analise;
    document.getElementById("totalPropostas").textContent = propostas;
    document.getElementById("totalGanhos").textContent = ganhos;
    document.getElementById("totalPerdidos").textContent = perdidos;

    document.getElementById("totalLeads").textContent = leadList.length;
    document.getElementById("totalClientes").textContent = clientesList.length;
}