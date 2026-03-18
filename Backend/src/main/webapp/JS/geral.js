function loadHeader() {
    fetch("header.html")
        .then(response => response.text())
        .then(async html => {

            document.getElementById("header-placeholder").innerHTML = html;

            atualizarSaudacao();
            inicializarMenuUtilizador();

            //header existente
            await carregarFotoHeader();
        });
}

async function carregarFotoHeader() {

    const headerFoto = document.getElementById("header-foto");
    const token = sessionStorage.getItem("token");

    if (!headerFoto || !token) return;

    try {
        const response = await fetch(
            `http://localhost:8080/LuisF-JoseD-proj3/rest/users/me`, // URL do teu UserService.java
            {
                headers: { "token": token }
            }
        );

        if (!response.ok) return;

        const user = await response.json();

        const photo = user.photo && user.photo.trim() !== ""
            ? user.photo
            : `https://ui-avatars.com/api/?name=${user.firstName || user.username}+${user.lastName || ""}&background=1e2a78&color=fff`;

        headerFoto.src = photo;
        localStorage.setItem("userPhoto", photo);

    } catch (error) {
        console.error("Erro ao carregar foto do header:", error);
    }
}

  function getAuthHeaders() {

    const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            //"username": localStorage.getItem("userName"),
            //"password": localStorage.getItem("userPass")
            "token": localStorage.getItem("token")
        };
    }

function inicializarMenuUtilizador() {

    const foto = document.getElementById("header-foto");
    const menu = document.getElementById("dropdown-menu");

    if (!foto || !menu) return;

    foto.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display =
            menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
        menu.style.display = "none";
    });

    // Carregar foto guardada
    const fotoGuardada = localStorage.getItem("userPhoto");
    if (fotoGuardada && fotoGuardada.trim() !== "") {
        foto.src = fotoGuardada;
    }
}

function atualizarSaudacao() {
    const nome = localStorage.getItem("userName");

    if (nome) {
        document.getElementById("saudacao").innerText = `Olá, ${nome}!`;
    }
}

function loadFooter() {
    fetch("footer.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("footer-placeholder").innerHTML = html;
        });
}

function loadAside() {

    fetch("aside.html")
        .then(response => response.text())
        .then(html => {
            // 1º Injeta o HTML na página
            document.getElementById("aside-placeholder").innerHTML = html;

            // 2º Agora que o HTML já existe, esconde o botão se não for ADMIN
            const role = localStorage.getItem("userRole");
            if (role !== "ADMIN") {
                const linkUsers = document.getElementById("link-utilizadores");
                if (linkUsers) {
                    linkUsers.style.display = "none";
                }
            }
        });
}

function abrirModalConfirmacao(mensagem, acaoConfirmar) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box">
            <h3>Confirmar Exclusão</h3>
            <p>${mensagem}</p>
            <div class="modal-buttons">
                <button id="btn-confirmar">Sim, apagar!</button>
                <button id="btn-cancelar">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-confirmar').onclick = () => {
        acaoConfirmar(); // Executa a função de apagar (lead ou cliente)
        document.body.removeChild(overlay);
    };

    overlay.querySelector('#btn-cancelar').onclick = () => {
        document.body.removeChild(overlay);
    };
};




function getIdCliente(id) {

    id = Number(id);
    return meusClientes.find(function (cliente) {
        return cliente.id === id;
    });
}

function irParaPerfil() {
    window.location.href = "perfil.html";
}


function logout() {
    // Apaga TODOS os dados de ambos os armazenamentos, conforme exigido no enunciado
    localStorage.clear();
    sessionStorage.clear();

    // Redireciona para a página de login
    window.location.href = "Login.html";
}
