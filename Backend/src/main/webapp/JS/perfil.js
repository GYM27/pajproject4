const BASE_URL = "/LuisF-JoseD-proj3/rest/users";
//ir buscar o URL
const queryString=window.location.search;


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    if (userId) {
        //estamos a carregar o perfil de um utilizador normal.
        carregarPerfilAlheio(userId);
        carregarLeads(userId);
        carregarClientes(userId); // Fixed case here
    } else {
        //estamos a carregar o nosso proprio perfil
        carregarPerfil();
    }


    const form = document.getElementById("perfil-form");
    if (form) {
        form.addEventListener("submit", (e) => atualizarPerfil(e, userId));
    }
});


/// Carregar perfil próprio
async function carregarPerfil() {
    const response = await fetch(`${BASE_URL}/me`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        alert("Erro ao carregar perfil.");
        return;
    }

    const user = await response.json();

    document.getElementById("username").value = user.username;
    // Opcional: não preencher a password por questões de segurança
    document.getElementById("password").value = user.password || "";
    document.getElementById("email").value = user.email;
    document.getElementById("firstName").value = user.firstName;
    document.getElementById("lastName").value = user.lastName;
    document.getElementById("cellphone").value = user.cellphone;
    document.getElementById("photoUrl").value = user.photoUrl || "";

    // Só altera o estilo se a Div realmente existir no HTML!
    const leadsDiv = document.getElementById("leadsDiv");
    if (leadsDiv) leadsDiv.style.display = "none";

    const clientsDiv = document.getElementById("clientsDiv");
    if (clientsDiv) clientsDiv.style.display = "none";

    const photo = user.photoUrl && user.photoUrl.trim() !== ""
        ? user.photoUrl
        : `https://ui-avatars.com/api/?name=${user.firstName || user.username}+${user.lastName || ""}&background=1e2a78&color=fff`;

    // Atualiza foto do perfil
    document.getElementById("fotoPerfil").src = photo;

    //Guarda no localStorage para usar noutras páginas
    localStorage.setItem("userPhoto", photo);

    //Atualiza foto do header (se existir)
    const headerFoto = document.getElementById("header-foto");
    if (headerFoto) {
        headerFoto.src = photo;
    }
}


//carregar perfil alheio (Administrador)
async function carregarPerfilAlheio(userId) {
    const response = await fetch(`${BASE_URL}/admin/${userId}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        alert("Erro ao carregar perfil.");
        return;
    }

    const user = await response.json();

    document.getElementById("username").required = false;
    document.getElementById("password").required = false;

    // CORREÇÃO DE SEGURANÇA: Verificar se os elementos existem!
    const usernameGroup = document.getElementById("usernameGroup");
    if (usernameGroup) usernameGroup.style.display = "none";

    const passwordGroup = document.getElementById("passwordGroup");
    if (passwordGroup) passwordGroup.style.display = "none";

    const leadsDiv = document.getElementById("leadsDiv");
    if (leadsDiv) leadsDiv.style.display = "block";

    const clientsDiv = document.getElementById("clientsDiv");
    if (clientsDiv) clientsDiv.style.display = "block";

    document.getElementById("email").value = user.email;
    document.getElementById("firstName").value = user.firstName;
    document.getElementById("lastName").value = user.lastName;
    document.getElementById("cellphone").value = user.cellphone;
    document.getElementById("photoUrl").value = user.photoUrl || "";

    const photo = user.photoUrl && user.photoUrl.trim() !== ""
        ? user.photoUrl
        : `https://ui-avatars.com/api/?name=${user.firstName || user.username}+${user.lastName || ""}&background=1e2a78&color=fff`;

    // Atualiza foto do perfil
    document.getElementById("fotoPerfil").src = photo;

    //Guarda no localStorage para usar noutras páginas
    localStorage.setItem("userPhoto", photo);

    //Atualiza foto do header (se existir)
    const headerFoto = document.getElementById("header-foto");
    if (headerFoto) {
        headerFoto.src = photo;
    }

    // --- LÓGICA EXCLUSIVA DE ADMINISTRAÇÃO ---

    // 1. Bloqueia a edição em todos os inputs do formulário para não enganar o Admin
    const inputs = document.querySelectorAll("#perfil-form input");
    inputs.forEach(input => input.disabled = true);

    // 2. Oculta o botão de Guardar Alterações
    const btnSubmit = document.querySelector("#perfil-form button[type='submit']");
    if (btnSubmit) btnSubmit.style.display = 'none';

    // 3. Cria os botões de atalho
    let divBotoesAdmin = document.getElementById("botoes-admin-container");
    if (!divBotoesAdmin) {
        divBotoesAdmin = document.createElement('div');
        divBotoesAdmin.id = "botoes-admin-container";
        // Estilos para alinhar bem os botões
        divBotoesAdmin.style.display = "flex";
        divBotoesAdmin.style.flexDirection = "column";
        divBotoesAdmin.style.gap = "15px";
        divBotoesAdmin.style.marginTop = "20px";

        document.getElementById("perfil-form").appendChild(divBotoesAdmin);
    }

    divBotoesAdmin.innerHTML = ""; // Limpa caso já existam

    const nome = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const nomeCompleto = nome !== "" ? nome : "Utilizador";

    const btnVerLeads = document.createElement("button");
    btnVerLeads.type = "button";
    btnVerLeads.className = "botao";
    btnVerLeads.innerText = "Ver Leads do Utilizador";
    btnVerLeads.onclick = () => window.location.href = `Leads.html?userId=${userId}&userName=${nomeCompleto}`;

    const btnVerClientes = document.createElement("button");
    btnVerClientes.type = "button";
    btnVerClientes.className = "botao";
    btnVerClientes.innerText = "Ver Clientes do Utilizador";
    btnVerClientes.onclick = () => window.location.href = `Clientes.html?userId=${userId}&userName=${nomeCompleto}`;

    // NOVO BOTÃO: Apagar utilizador Permanentemente
    const btnHardDelete = document.createElement("button");
    btnHardDelete.type = "button";
    btnHardDelete.className = "botao";
    btnHardDelete.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Apagar Utilizador Permanentemente';
    btnHardDelete.onclick = async () => {
        if(confirm(`ATENÇÃO: Vai apagar PERMANENTEMENTE o utilizador ${nomeCompleto}!\n\nAs suas leads e clientes ficarão órfãos ('Criador Excluído').\nEsta ação é irreversível. Continuar?`)) {
            try {
                const deleteResponse = await fetch(`${BASE_URL}/admin/${userId}`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (deleteResponse.ok) {
                    alert("Utilizador apagado com sucesso!");
                    window.location.href = "Users.html";
                } else {
                    alert("Erro ao apagar o utilizador permanentemente.");
                }
            } catch (error) {
                console.error("Erro no Hard Delete do utilizador:", error);
            }
        }
    };

    divBotoesAdmin.appendChild(btnVerLeads);
    divBotoesAdmin.appendChild(btnVerClientes);
    divBotoesAdmin.appendChild(btnHardDelete); // Injeta o novo botão de apagar
}

// Atualizar perfil
async function atualizarPerfil(event, userId) {
    event.preventDefault();

    let dadosAtualizados = {
        email: document.getElementById("email").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        cellphone: document.getElementById("cellphone").value,
        photoUrl: document.getElementById("photoUrl").value
    };


    let endpointSuffix;
    if (userId) {
        endpointSuffix = `admin/${userId}`;
    } else {
        // Add username/password only for "self" update
        dadosAtualizados.username = document.getElementById("username").value;
        dadosAtualizados.password = document.getElementById("password").value;
        endpointSuffix = "me";
    }

    const response = await fetch(`${BASE_URL}/${endpointSuffix}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dadosAtualizados)
    });

    if (response.ok) {
        alert("Dados atualizados com sucesso!");
        // Se não mudou a senha, apenas atualizamos os outros dados se necessário
        window.location.href = "Dashboard.html";
        //}
    } else {
        alert("Erro ao atualizar perfil no servidor.");
    }
}


//Listar Leads
async function carregarLeads(userId) {

    const listaLeads = document.getElementById("lista-leads");
    if (!listaLeads) return; //evita erro se não existir

    //const username = localStorage.getItem("userName");

    const response = await fetch(`${BASE_URL}/admin/${userId}/leads`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) return;

    const leads = await response.json();
    listaLeads.innerHTML = "";

    leads.forEach(lead => {
        const li = document.createElement("li");
        li.textContent = `${lead.title} - ${lead.state}`;
        listaLeads.appendChild(li);
    });
}


//Listar Clientes
async function carregarClientes(userId) {

    const listaClients = document.getElementById("lista-clientes");
    if (!listaClients) return; //evita erro se não existir

    //const username = localStorage.getItem("userName");

    const response = await fetch(`/LuisF-JoseD-proj3/rest/clients/admin/user/${userId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) return;

    const clientes = await response.json();
    const lista = document.getElementById("lista-clientes");
    listaClients.innerHTML = "";

    clientes.forEach(cliente => {
        const li = document.createElement("li");
        li.textContent = `${cliente.name} - ${cliente.email}`;
        listaClients.appendChild(li);
    });
}