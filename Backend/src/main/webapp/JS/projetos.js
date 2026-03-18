// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---
const BASE_URL = "http://localhost:8080/lferreira-tpancas-proj2/rest/users";
const username = localStorage.getItem("userName");

let projetosList = JSON.parse(localStorage.getItem('box-lista')) || [];
let indexEditando = -1; 
let clientesDisponiveis = [];

// Opções de estado para uniformização
const opcoesEstados = ["Planeamento", "Em Curso", "Concluído", "Suspenso"];

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarClientesParaDropdown();
    renderizarTabela();
    configurarEventos();
});

// --- 2. COMUNICAÇÃO E DADOS ---

// Carrega clientes do servidor para popular o select de projetos
async function carregarClientesParaDropdown() {
    try {
        const response = await fetch(`${BASE_URL}/${username}/clients`, {
            method: "GET",
            headers: {
                "username": username,
                "password": localStorage.getItem("userPass")
            }
        });
        if (response.ok) {
            clientesDisponiveis = await response.json();
        }
    } catch (error) {
        console.error("Erro ao carregar clientes para o formulário:", error);
    }
}

// --- 3. INTERFACE E RENDERIZAÇÃO ---

function renderizarTabela() {
    const corpoTabela = document.getElementById('corpoTabela');
    if (!corpoTabela) return;

    corpoTabela.innerHTML = "";

    projetosList.forEach((projeto, index) => {
        let row = corpoTabela.insertRow();

        row.innerHTML = `
            <td>${projeto.nome || ""}</td>
            <td>${projeto.cliente || ""}</td>
            <td><span class="status-badge">${projeto.estado || ""}</span></td>
            <td>${projeto.dataInicio || ""}</td>
            <td>${projeto.dataFim || ""}</td>
            <td>
                <button class="button-edit-objects btn-editar" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="button-edit-objects btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>`;

        row.querySelector(".btn-editar").onclick = () => editarProjeto(index);
        
        // Uso do Modal Uniformizado do geral.js
        row.querySelector(".btn-eliminar").onclick = () => {
            abrirModalConfirmacao(
                `Tem a certeza de que deseja apagar o projeto <strong>${projeto.nome}</strong>?`,
                () => eliminarProjeto(index)
            );
        };
    });
}

function eliminarProjeto(index) {
    projetosList.splice(index, 1);
    localStorage.setItem('box-lista', JSON.stringify(projetosList));
    renderizarTabela();
}

function abrirFormulario() {
    const boxLista = document.getElementById('box-lista');
    if (!boxLista) return;

    // Gera as opções do dropdown de clientes vindos do servidor
    const optionsClientes = clientesDisponiveis.map(c => 
        `<option value="${c.organizacao}">${c.organizacao}</option>`
    ).join('');

    boxLista.innerHTML = `
        <div class="form-container">
            <h3>${indexEditando === -1 ? 'Novo Projeto' : 'Editar Projeto'}</h3>
            
            <label for="input-nome">Nome do Projeto:</label>
            <input type="text" id="input-nome" placeholder="Nome do Projeto">
            
            <label for="input-cliente">Cliente:</label>
            <select id="input-cliente">
                <option value="">Selecione um cliente...</option>
                ${optionsClientes}
            </select>
            
            <label for="input-estado">Estado do Projeto:</label>
            <select id="input-estado">
                ${opcoesEstados.map(e => `<option value="${e}">${e}</option>`).join('')}
            </select>
            
            <label for="input-data-inicio">Data de Início:</label>
            <input type="date" id="input-data-inicio">
            
            <label for="input-data-f-fim">Data de Fim:</label>
            <input type="date" id="input-data-fim">
            
            <div class="modal-buttons">
                <button class="button-edit-objects" onclick="salvarProjeto()" data-tooltip="Guardar"><i class="fa-solid fa-floppy-disk"></i></button>
                <button class="button-edit-objects" onclick="window.location.reload()" data-tooltip="Cancelar"><i class="fa-solid fa-ban"></i></button>
            </div>
        </div>
    `;

    if (indexEditando !== -1) {
        const p = projetosList[indexEditando];
        document.getElementById('input-nome').value = p.nome;
        document.getElementById('input-cliente').value = p.cliente;
        document.getElementById('input-estado').value = p.estado;
        document.getElementById('input-data-inicio').value = p.dataInicio;
        document.getElementById('input-data-fim').value = p.dataFim;
    }
}

function salvarProjeto() {
    const dados = {
        nome: document.getElementById('input-nome').value,
        cliente: document.getElementById('input-cliente').value,
        estado: document.getElementById('input-estado').value,
        dataInicio: document.getElementById('input-data-inicio').value,
        dataFim: document.getElementById('input-data-fim').value
    };

    if (!dados.nome) return alert("Preencha o nome do projeto!");

    if (indexEditando === -1) {
        projetosList.push(dados);
    } else {
        projetosList[indexEditando] = dados;
    }

    localStorage.setItem('box-lista', JSON.stringify(projetosList));
    window.location.reload();
}

function configurarEventos() {
    const btnCriar = document.querySelector('[data-acao="criar"]');
    if (btnCriar) {
        btnCriar.onclick = () => {
            indexEditando = -1;
            abrirFormulario();
        };
    }
}

function editarProjeto(index) {
    indexEditando = index;
    abrirFormulario();
}