// ============================================================================
// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---
// ============================================================================
const BASE_URL = "/LuisF-JoseD-proj3/rest/users";

let leadList = [];
let idEmEdicao = null;
let filtroAtual = "Todos";
let modoLixeira = false;

document.addEventListener("DOMContentLoaded", () => {
    carregarLeads();
    configurarEventosBase();
});

const mapeamentoEstados = { "1": "Novo", "2": "Em Análise", "3": "Proposta", "4": "Ganho", "5": "Perdido" };

function getAuthHeaders() {
    return { "Content-Type": "application/json", "token": localStorage.getItem("token") };
}

// ============================================================================
// --- 2. GESTÃO DA INTERFACE E RENDERIZAÇÃO ---
// ============================================================================

async function carregarLeads() {
    const role = localStorage.getItem("userRole");
    const meuId = localStorage.getItem("userId");
    const urlParams = new URLSearchParams(window.location.search);
    const filtroUserId = urlParams.get('userId');
    const filtroUserName = urlParams.get('userName');
    const targetUserId = filtroUserId ? filtroUserId : meuId;

    let url = `${BASE_URL}/me/leads`;

    if (role === "ADMIN") {
        if (modoLixeira) {
            url = `${BASE_URL}/admin/${targetUserId}/leads/softdeleted/all`;
        } else if (filtroUserId) {
            url = `${BASE_URL}/admin/${filtroUserId}/leads`;
        }
    }

    try {
        const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
        leadList = response.ok ? await response.json() : [];
        renderizarTabela();

        if (role === "ADMIN") {
            desenharBotoesTopoAdminLeads(targetUserId, filtroUserName);
        }
    } catch (error) { console.error("Erro ao carregar leads:", error); }
}

function desenharBotoesTopoAdminLeads(targetUserId, filtroUserName) {
    const barraWelcome = document.querySelector(".barra-welcome");
    const tituloMenu = document.querySelector(".barra-welcome h3");
    let btnAdicionarContainer = document.querySelector('[data-acao="criar"]');

    if (tituloMenu) {
        const nome = filtroUserName || "ADMIN";
        tituloMenu.innerText = modoLixeira ? `🗑️ Lixeira: ${nome}` : `Leads: ${nome}`;
    }

    if (barraWelcome) {
        let grupoBotoes = document.querySelector(".grupo-botoes-topo");
        if (!grupoBotoes) {
            grupoBotoes = document.createElement("div");
            grupoBotoes.className = "grupo-botoes-topo";
            if (btnAdicionarContainer) grupoBotoes.appendChild(btnAdicionarContainer);
            barraWelcome.appendChild(grupoBotoes);
        }

        let btnToggle = document.getElementById("btn-toggle-lixeira-leads");
        if (!btnToggle) {
            btnToggle = document.createElement("div");
            btnToggle.id = "btn-toggle-lixeira-leads";
            btnToggle.className = "button-edit-objects";
            btnToggle.onclick = () => { modoLixeira = !modoLixeira; carregarLeads(); };
            grupoBotoes.insertBefore(btnToggle, grupoBotoes.firstChild);
        }
        btnToggle.innerHTML = modoLixeira ? '<i class="fa-solid fa-arrow-left"></i>' : '<i class="fa-solid fa-trash-can"></i>';
        btnToggle.setAttribute("data-tooltip", modoLixeira ? "Voltar aos Ativos" : "Ver Lixeira");

        let btnMassa = document.getElementById("btn-vermelho-todos");
        if (!btnMassa) {
            btnMassa = document.createElement("div");
            btnMassa.id = "btn-vermelho-todos";
            btnMassa.className = "button-edit-objects btn-apagar-todos";
            grupoBotoes.insertBefore(btnMassa, btnAdicionarContainer);
        }

        if (modoLixeira) {
            btnMassa.setAttribute("data-tooltip", "Esvaziar Lixeira Permanentemente");
            btnMassa.innerHTML = '<i class="fa-solid fa-dumpster-fire"></i>';
            btnMassa.onclick = () => { if(confirm("Apagar TUDO permanentemente?")) esvaziarLixeiraLeads(targetUserId); };
        } else {
            btnMassa.setAttribute("data-tooltip", "Mover Todas para Lixeira");
            btnMassa.innerHTML = '<i class="fa-solid fa-trash-arrow-up"></i>';
            btnMassa.onclick = () => { if(confirm("Mover todas as leads para a lixeira?")) apagarTodasLeadsDoUtilizador(targetUserId); };
        }

        let btnRestaurar = document.getElementById("btn-restaurar-todas");
        if (!btnRestaurar) {
            btnRestaurar = document.createElement("div");
            btnRestaurar.id = "btn-restaurar-todas";
            btnRestaurar.className = "button-edit-objects";
            btnRestaurar.style.color = "#5cb85c";
            btnRestaurar.innerHTML = '<i class="fa-solid fa-trash-can-arrow-up"></i>';
            btnRestaurar.onclick = () => { if(confirm("Restaurar todas as leads?")) restaurarTodasLeadsDoUtilizador(targetUserId); };
            grupoBotoes.insertBefore(btnRestaurar, btnAdicionarContainer);
        }
        btnRestaurar.setAttribute("data-tooltip", "Restaurar Todas");

        if (btnAdicionarContainer) btnAdicionarContainer.style.display = modoLixeira ? "none" : "flex";
        btnRestaurar.style.display = modoLixeira ? "flex" : "none";
    }
}

function renderizarTabela() {
    const corpo = document.getElementById("corpoTabela");
    if (!corpo) return;
    corpo.innerHTML = "";
    const role = localStorage.getItem("userRole");
    const filtradas = filtroAtual === "Todos" ? leadList : leadList.filter(l => String(l.state) === filtroAtual);

    filtradas.forEach(lead => {
        const tr = document.createElement("tr");
        let botoes = "";

        if (modoLixeira && role === "ADMIN") {
            botoes = `
                <button class="button-edit-objects btn-restaurar" data-tooltip="Restaurar Lead" style="color: #5cb85c;"><i class="fa-solid fa-trash-can-arrow-up"></i></button>
                <button class="button-edit-objects btn-hard" data-tooltip="Eliminar Permanente" style="color: #d9534f;"><i class="fa-solid fa-trash-arrow-up"></i></button>`;
        } else {
            botoes = `
                <button class="button-edit-objects btn-editar" data-tooltip="Editar Lead"><i class="fa-solid fa-pen"></i></button>
                <button class="button-edit-objects btn-eliminar" data-tooltip="Mover para Lixeira"><i class="fa-solid fa-trash"></i></button>`;

        }

        tr.innerHTML = `<td>${lead.title}</td><td>${lead.description}</td><td>${mapeamentoEstados[lead.state]}</td><td>${new Date(lead.date).toLocaleDateString()}</td><td>${botoes}</td>`;

        if (tr.querySelector(".btn-editar")) tr.querySelector(".btn-editar").onclick = () => prepararEdicao(lead);
        if (tr.querySelector(".btn-eliminar")) tr.querySelector(".btn-eliminar").onclick = () => { if(confirm("Mover para lixeira?")) eliminarLeadIndividual(lead.id, 'SOFT'); };
        if (tr.querySelector(".btn-hard")) tr.querySelector(".btn-hard").onclick = () => { if(confirm("Apagar PERMANENTEMENTE?")) eliminarLeadIndividual(lead.id, 'HARD'); };
        if (tr.querySelector(".btn-restaurar")) tr.querySelector(".btn-restaurar").onclick = () => restaurarLeadIndividual(lead.id);

        corpo.appendChild(tr);
    });
}

// ============================================================================
// --- 3. COMUNICAÇÃO COM O SERVIDOR (API) ---
// ============================================================================

async function guardarLeadNoServidor() {
    const btnGuardar = document.getElementById("guardarLead");
    if (btnGuardar) btnGuardar.disabled = true;

    const leadData = {
        title: document.getElementById("titulo").value,
        description: document.getElementById("descricao").value,
        state: parseInt(document.getElementById("estado").value) || 1
    };

    const role = localStorage.getItem("userRole");
    const urlParams = new URLSearchParams(window.location.search);
    const filtroUserId = urlParams.get('userId');

    // Lógica Unificada: Define se é criação (POST) ou edição (PUT)
    let metodo = idEmEdicao !== null ? "PUT" : "POST";
    let url;

    if (idEmEdicao !== null) {
        // EDIÇÃO: Se for admin a auditar outro user, usa rota admin, senão usa /me/
        url = (role === "ADMIN" && filtroUserId)
            ? `${BASE_URL}/admin/${filtroUserId}/leads/${idEmEdicao}`
            : `${BASE_URL}/me/leads/${idEmEdicao}`;
    } else {
        // CRIAÇÃO: Se for admin a criar para outro user, usa rota admin, senão usa /me/
        url = (role === "ADMIN" && filtroUserId)
            ? `${BASE_URL}/admin/${filtroUserId}/leads`
            : `${BASE_URL}/me/leads`;
    }

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify(leadData)
        });

        if (response.ok) {
            fecharFormulario();
            carregarLeads();
        } else {
            alert("Erro ao guardar a lead.");
        }
    } catch (error) {
        console.error("Erro ao guardar lead:", error);
    } finally {
        if (btnGuardar) btnGuardar.disabled = false;
    }
}

async function apagarTodasLeadsDoUtilizador(userId) {
    const response = await fetch(`${BASE_URL}/admin/${userId}/leads/softdeleteall`, { method: "POST", headers: getAuthHeaders() });
    if (response.ok) carregarLeads();
}

async function restaurarTodasLeadsDoUtilizador(userId) {
    const response = await fetch(`${BASE_URL}/admin/${userId}/leads/softundeleteall`, { method: "POST", headers: getAuthHeaders() });
    if (response.ok) carregarLeads();
}

async function esvaziarLixeiraLeads(userId) {
    const response = await fetch(`${BASE_URL}/admin/${userId}/leads/emptytrash`, { method: "DELETE", headers: getAuthHeaders() });
    if (response.ok) carregarLeads();
}

async function eliminarLeadIndividual(id, tipo) {
    const role = localStorage.getItem("userRole");
    const targetUserId = new URLSearchParams(window.location.search).get('userId') || localStorage.getItem("userId");

    let url = (role === "ADMIN")
        ? (tipo === 'HARD' ? `${BASE_URL}/admin/${targetUserId}/leads/${id}` : `${BASE_URL}/admin/${targetUserId}/leads/${id}/softdelete`)
        : `${BASE_URL}/me/leads/${id}/softdelete`;

    let metodo = (role === "ADMIN" && tipo === 'HARD') ? "DELETE" : "POST";

    const response = await fetch(url, { method: metodo, headers: getAuthHeaders() });
    if (response.ok) carregarLeads();
}

async function restaurarLeadIndividual(id) {
    const targetUserId = new URLSearchParams(window.location.search).get('userId') || localStorage.getItem("userId");
    const response = await fetch(`${BASE_URL}/admin/${targetUserId}/leads/${id}/softundelete`, { method: "POST", headers: getAuthHeaders() });
    if (response.ok) carregarLeads();
}

// ============================================================================
// --- 4. UTILITÁRIOS E EVENTOS BASE ---
// ============================================================================


function configurarEventosBase() {
        document.getElementById("filtroEstado").onchange = (e) => {
            filtroAtual = e.target.value;
            renderizarTabela();
        };
        document.getElementById("cancelarLead").onclick = fecharFormulario;
        document.getElementById("guardarLead").onclick = guardarLeadNoServidor;

        const btnCriar = document.querySelector('[data-acao="criar"]');
        if (btnCriar) {
            btnCriar.onclick = () => {
                idEmEdicao = null;

                // CORREÇÃO: Limpeza manual dos campos em vez do .reset()
                const inputTitulo = document.getElementById("titulo");
                const inputDesc = document.getElementById("descricao");
                const inputEstado = document.getElementById("estado");

                if (inputTitulo) inputTitulo.value = "";
                if (inputDesc) inputDesc.value = "";
                if (inputEstado) inputEstado.value = "1"; // Valor padrão: Novo

                // Atualiza o título visual do formulário
                const tituloH3 = document.querySelector("#formLead h3");
                if (tituloH3) tituloH3.innerText = "Nova Lead";

                // Mostrar formulário e esconder lista
                document.getElementById("formLead").classList.remove("form-hidden");
                document.getElementById("lista-container").style.display = "none";

                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
}

function prepararEdicao(lead) {
    idEmEdicao = lead.id;
    document.getElementById("titulo").value = lead.title;
    document.getElementById("descricao").value = lead.description;
    document.getElementById("estado").value = lead.state;
    document.getElementById("formLead").classList.remove("form-hidden");
    document.getElementById("lista-container").style.display = "none";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fecharFormulario() {
    document.getElementById("formLead").classList.add("form-hidden");
    document.getElementById("lista-container").style.display = "block";
    idEmEdicao = null;
}