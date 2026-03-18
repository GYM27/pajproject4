document.addEventListener("DOMContentLoaded", function () {

    // ============================================================================
    // --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---
    // ============================================================================
    let cardSendoEditado = null; // Guarda o elemento HTML do card em edição
    let modoLixeira = false;      // Alterna entre lista de ativos (false) e apagados (true)

    // Referências aos elementos do formulário
    const btnAdicionar = document.getElementById('btn-adicionar');
    const btnCancelar = document.getElementById('cancelar');
    const formContainer = document.getElementById('form-container');
    const formCliente = document.getElementById('form-cliente');

    // Inicializa a lista ao carregar a página
    carregarListaClientes();

    // ============================================================================
    // --- 2. EVENTOS DE FORMULÁRIO (CRIAR/EDITAR) ---
    // ============================================================================

    // Abrir formulário para Novo Cliente
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            cardSendoEditado = null;

            // LIMPEZA MANUAL (Evita o erro do .reset())
            document.getElementById('name-cliente').value = "";
            document.getElementById('email-cliente').value = "";
            document.getElementById('phone-cliente').value = "";
            document.getElementById('organization-cliente').value = "";

            formContainer.classList.remove('hidden');
        });
    }


    // Cancelar/Fechar formulário
    if (btnCancelar) btnCancelar.addEventListener('click', fecharFormulario);

    // Submissão do formulário (POST para criar, PUT para editar)
    formCliente.addEventListener('submit', async (enviar) => {
        enviar.preventDefault();

        // Obter o ID do utilizador que está a ser gerido (via URL)
        const urlParams = new URLSearchParams(window.location.search);
        const filtroUserId = urlParams.get("userId");
        const meuId = localStorage.getItem("userId");
        const role = localStorage.getItem("userRole");

        // Se for Admin e houver um userId no URL, usamos esse. Caso contrário, usamos o nosso.
        const targetUserId = (role === "ADMIN" && filtroUserId) ? filtroUserId : meuId;

        const clienteData = {
            name: document.getElementById('name-cliente').value,
            email: document.getElementById('email-cliente').value,
            phone: document.getElementById('phone-cliente').value,
            organization: document.getElementById('organization-cliente').value
        };

        // DEFINIÇÃO DO URL DE CRIAÇÃO
        // Para criar num utilizador específico, a rota deve ser /clients/admin/user/{userId}
        let url = `/LuisF-JoseD-proj3/rest/clients`;

        if (role === "ADMIN" && filtroUserId) {
            url = `/LuisF-JoseD-proj3/rest/clients/admin/user/${targetUserId}`;
        }

        let metodo = cardSendoEditado ? 'PUT' : 'POST';

        if (cardSendoEditado) {
            const idCliente = cardSendoEditado.querySelector('.val-id').innerText;
            url = `/LuisF-JoseD-proj3/rest/clients/${idCliente}`;
        }

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "token": localStorage.getItem("token")
                },
                body: JSON.stringify(clienteData)
            });

            if (response.ok) {
                fecharFormulario();
                carregarListaClientes();
            } else {
                const erroMsg = await response.text();
                alert("Erro ao gravar: " + erroMsg);
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    });

    // ============================================================================
    // --- 3. GESTÃO DA INTERFACE E RENDERIZAÇÃO ---
    // ============================================================================

    /**
     * Carrega os dados do servidor e desenha a lista e os botões de Admin
     */
    async function carregarListaClientes() {
        const role = localStorage.getItem("userRole");
        const meuId = localStorage.getItem("userId");
        const urlParams = new URLSearchParams(window.location.search);
        const filtroUserId = urlParams.get("userId");
        const filtroUserName = urlParams.get('userName');

        // Define o ID de destino: se houver no URL usa esse, senão usa o ID do Admin logado
        const targetUserId = filtroUserId ? filtroUserId : meuId;

        let url = `http://localhost:8080/LuisF-JoseD-proj3/rest/clients/me`;

        // Lógica de URL para Administradores
        if (role === "ADMIN") {
            if (modoLixeira) {
                url = `http://localhost:8080/LuisF-JoseD-proj3/rest/clients/admin/user/${targetUserId}/deleted`;
            } else if (filtroUserId) {
                url = `http://localhost:8080/LuisF-JoseD-proj3/rest/clients/admin/user/${filtroUserId}`;
            }
        }

        try {
            const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
            const listaClientes = document.getElementById('lista-clientes');
            listaClientes.innerHTML = "";

            if (response.ok) {
                const clientes = await response.json();
                if (clientes) {
                    clientes.forEach(c => criarElementoCard(c.name, c.email, c.phone, c.organization, c.id));
                }
            }

            // DESENHAR BOTÕES DE ADMIN (Aparecem sempre que o papel for ADMIN)
            if (role === "ADMIN") {
                gerirBotoesTopoAdmin(targetUserId, filtroUserName);
            }
        } catch (error) { console.error("Erro ao carregar lista:", error); }
    }

    /**
     * Cria e gere a visibilidade dos botões de massa (Lixeira, Restaurar, Apagar Tudo)
     */
    function gerirBotoesTopoAdmin(targetUserId, filtroUserName) {
        const barraWelcome = document.querySelector(".barra-welcome");
        const tituloMenu = document.querySelector(".barra-welcome h3");
        let btnAdicionarContainer = document.querySelector("#btn-adicionar")?.parentElement;

        if (tituloMenu) {
            const nome = filtroUserName || "ADMIN";
            tituloMenu.innerText = modoLixeira ? `🗑️ Lixeira: ${nome}` : `Clientes: ${nome}`;
        }

        if (barraWelcome) {
            let grupoBotoes = document.querySelector(".grupo-botoes-topo");
            if (!grupoBotoes) {
                grupoBotoes = document.createElement("div");
                grupoBotoes.className = "grupo-botoes-topo";
                if (btnAdicionarContainer) grupoBotoes.appendChild(btnAdicionarContainer);
                barraWelcome.appendChild(grupoBotoes);
            }

            // Botão Toggle Lixeira
            let btnToggle = document.getElementById("btn-toggle-lixeira-clientes");
            if (!btnToggle) {
                btnToggle = document.createElement("div");
                btnToggle.id = "btn-toggle-lixeira-clientes";
                btnToggle.className = "button-edit-objects";
                btnToggle.onclick = () => { modoLixeira = !modoLixeira; carregarListaClientes(); };
                grupoBotoes.insertBefore(btnToggle, grupoBotoes.firstChild);
            }
            btnToggle.innerHTML = modoLixeira ? '<i class="fa-solid fa-arrow-left"></i>' : '<i class="fa-solid fa-trash-can"></i>';
            btnToggle.setAttribute("data-tooltip", modoLixeira ? "Voltar aos Ativos" : "Ver Lixeira");

            // Botão Massa (Mover Todos / Esvaziar)
            let btnMassa = document.getElementById("btn-apagar-todos");
            if (!btnMassa) {
                btnMassa = document.createElement("div");
                btnMassa.id = "btn-apagar-todos";
                btnMassa.className = "button-edit-objects btn-apagar-todos";
                grupoBotoes.insertBefore(btnMassa, btnAdicionarContainer);
            }

            if (modoLixeira) {
                btnMassa.setAttribute("data-tooltip", "Esvaziar Lixeira Permanentemente");
                btnMassa.innerHTML = '<i class="fa-solid fa-dumpster-fire"></i>';
                btnMassa.onclick = () => {
                    if (confirm(`⚠️ Vai apagar PERMANENTEMENTE todos os clientes desta lixeira?`)) {
                        esvaziarLixeiraClientes(targetUserId);
                    }
                };
            } else {
                btnMassa.setAttribute("data-tooltip", "Mover Todos para Lixeira");
                btnMassa.innerHTML = '<i class="fa-solid fa-trash-arrow-up"></i>';
                btnMassa.onclick = () => {
                    if (confirm(`⚠️ Mover TODOS os clientes para a lixeira?`)) {
                        apagarTodosClientesDoUtilizador(targetUserId);
                    }
                };
            }

            // Botão Restaurar Todos
            let btnRestaurarTodos = document.getElementById("btn-restaurar-todos");
            if (!btnRestaurarTodos) {
                btnRestaurarTodos = document.createElement("div");
                btnRestaurarTodos.id = "btn-restaurar-todos";
                btnRestaurarTodos.className = "button-edit-objects";
                btnRestaurarTodos.style.color = "#5cb85c";
                btnRestaurarTodos.innerHTML = '<i class="fa-solid fa-trash-can-arrow-up"></i>';
                btnRestaurarTodos.onclick = () => {
                    if (confirm(`♻️ Restaurar TODOS os clientes desta lixeira?`)) {
                        restaurarTodosClientesDoUtilizador(targetUserId);
                    }
                };
                grupoBotoes.insertBefore(btnRestaurarTodos, btnAdicionarContainer);
            }
            btnRestaurarTodos.setAttribute("data-tooltip", "Restaurar Todos");

            // Sincronizar visibilidade dos botões conforme o modo
            if (btnAdicionarContainer) btnAdicionarContainer.style.display = modoLixeira ? "none" : "flex";
            btnRestaurarTodos.style.display = modoLixeira ? "flex" : "none";
        }
    }

    /**
     * Cria a estrutura visual (Card) para cada cliente
     */
    function criarElementoCard(name, email, phone, organization, id) {
        const listaClientes = document.getElementById('lista-clientes');
        const novoCard = document.createElement('div');
        novoCard.classList.add('clientes-card', 'fechado');
        const role = localStorage.getItem("userRole");

        // Define quais os botões aparecem no card (depende se estamos na lixeira ou ativos)
        let botoesCard = "";
        if (modoLixeira && role === "ADMIN") {
            botoesCard = `
                <button class="button-edit-objects btn-restaurar" data-tooltip="Restaurar Cliente" style="color: #5cb85c;"><i class="fa-solid fa-trash-can-arrow-up"></i></button>
                <button class="button-edit-objects btn-hard-eliminar" data-tooltip="Eliminar Permanente" style="color: #d9534f;"><i class="fa-solid fa-trash-arrow-up"></i></button>`;
        } else {
            botoesCard = `
                <button class="button-edit-objects btn-editar" data-tooltip="Editar Cliente"><i class="fa-solid fa-pen"></i></button>
                <button class="button-edit-objects btn-eliminar" data-tooltip="Mover para Lixeira"><i class="fa-solid fa-trash"></i></button>`;

        }

        novoCard.innerHTML = `
            <div class="card-header"><strong class="org-name">${organization}</strong><i class="fa-solid fa-chevron-down seta"></i></div>
            <div class="card-detalhes"><hr>
                <p><strong>Responsável:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
                <p class="val-id hidden">${id}</p>
                <div class="card-actions">${botoesCard}</div>
            </div>`;

        configurarEventosDoCard(novoCard, name, email, phone, organization, id);
        listaClientes.appendChild(novoCard);
    }

    /**
     * Adiciona os ouvintes de clique aos botões de cada card
     */
    function configurarEventosDoCard(card, name, email, phone, organization, id) {
        card.addEventListener('click', () => { card.classList.toggle('aberto'); card.classList.toggle('fechado'); });

        const btnEditar = card.querySelector('.btn-editar');
        const btnEliminar = card.querySelector('.btn-eliminar');
        const btnRestaurar = card.querySelector('.btn-restaurar');
        const btnHard = card.querySelector('.btn-hard-eliminar');

        if (btnEditar) {
            btnEditar.addEventListener('click', (e) => {
                e.stopPropagation(); cardSendoEditado = card;
                document.getElementById('name-cliente').value = name;
                document.getElementById('email-cliente').value = email;
                document.getElementById('phone-cliente').value = phone;
                document.getElementById('organization-cliente').value = organization;
                formContainer.classList.remove('hidden');
                window.scrollTo({top: 0, behavior: 'smooth'});
            });
        }
        if (btnEliminar) btnEliminar.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Mover "${organization}" para a lixeira?`)) eliminarNoServidor(id); });
        if (btnRestaurar) btnRestaurar.addEventListener('click', (e) => { e.stopPropagation(); restaurarCliente(id); });
        if (btnHard) btnHard.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`⚠️ Apagar PERMANENTEMENTE "${organization}"?`)) eliminarClientePermanente(id); });
    }

    // ============================================================================
    // --- 4. FUNÇÕES DE COMUNICAÇÃO COM O SERVIDOR (API) ---
    // ============================================================================

    // Soft Delete individual
    async function eliminarNoServidor(id) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/${id}/delete`, { method: 'POST', headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Soft Delete de todos os clientes de um utilizador (Admin)
    async function apagarTodosClientesDoUtilizador(userId) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/admin/user/${userId}/softdeleteall`, { method: "POST", headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Restaurar individual
    async function restaurarCliente(id) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/${id}/restore`, { method: "POST", headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Hard Delete individual
    async function eliminarClientePermanente(id) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/${id}/permanent`, { method: "DELETE", headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Restaurar todos os clientes da lixeira (Admin)
    async function restaurarTodosClientesDoUtilizador(userId) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/admin/user/${userId}/restoreall`, { method: "POST", headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Esvaziar lixeira (Hard Delete de todos) (Admin)
    async function esvaziarLixeiraClientes(userId) {
        const response = await fetch(`http://localhost:8080/LuisF-JoseD-proj3/rest/clients/admin/user/${userId}/emptytrash`, { method: "DELETE", headers: getAuthHeaders() });
        if (response.ok) carregarListaClientes();
    }

    // Utilitário para fechar o formulário de edição/criação
    function fecharFormulario() {
        formContainer.classList.add('hidden');
        formCliente.reset();
        cardSendoEditado = null;
    }
});