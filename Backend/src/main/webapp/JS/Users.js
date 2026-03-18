document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    // Redireciona se não for administrador
    if (role !== "ADMIN") {
        alert("Acesso negado. Apenas administradores podem aceder a esta página.");
        window.location.href = "Dashboard.html";
        return;
    }

    carregarUtilizadores();

    async function carregarUtilizadores() {
        const url = `/LuisF-JoseD-proj3/rest/users/admin`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "token": token
                }
            });

            if (response.ok) {
                const utilizadores = await response.json();

                // ORDENAR: Ativos (false) primeiro, Inativos (true) no fundo
                utilizadores.sort((a, b) => {
                    // Se 'a' for inativo e 'b' ativo, 'a' desce na lista (retorna 1)
                    // Se 'a' for ativo e 'b' inativo, 'a' sobe na lista (retorna -1)
                    // Se forem iguais, mantêm a ordem (retorna 0)
                    return (a.softDelete === b.softDelete) ? 0 : a.softDelete ? 1 : -1;
                });

                renderizarUtilizadores(utilizadores);
            } else {
                console.error("Erro ao carregar a lista de utilizadores.");
            }
        } catch (error) {
            console.error("Erro na comunicação com o servidor:", error);
        }
    }

    function renderizarUtilizadores(utilizadores) {
        const listaUtilizadores = document.getElementById("lista-utilizadores");
        listaUtilizadores.innerHTML = "";

        utilizadores.forEach(user => {
            const novoCard = document.createElement('div');
            novoCard.classList.add('clientes-card', 'fechado');

            if (user.softDelete) {
                novoCard.classList.add('card-inativo');
            }

            const estadoTexto = user.softDelete ? "Inativo" : "Ativo";
            const iconeEstado = user.softDelete ? "fa-rotate-left" : "fa-ban";
            const corEstado = user.softDelete ? "color: orange;" : "color: red;";
            const acaoDesativar = user.softDelete ? "softundelete" : "softdelete";
            const nomeCompleto = `${user.firstName} ${user.lastName}`;

            // Só constrói os botões se o utilizador atual for um ADMIN
            let botoesAcao = "";
            if (role === "ADMIN") {
                botoesAcao = `
                    <div class="card-actions"> 
                        <button class="button-edit-objects btn-ver-perfil" aria-label="Ver Perfil" data-tooltip="Ver Perfil" style="color: #3498db;">
                            <i class="fa-solid fa-user"></i>
                        </button>

                        <button class="button-edit-objects btn-estado" aria-label="Alterar Estado" data-tooltip="Alterar Estado" style="${corEstado}">
                            <i class="fa-solid ${iconeEstado}"></i>
                        </button>

                        <button class="button-edit-objects btn-eliminar" aria-label="Eliminar" data-tooltip="Remover Permanentemente" style="color: red;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>`;
            }

            novoCard.innerHTML = `
                <div class="card-header">
                    <strong class="org-name">${user.firstName} ${user.lastName}<span style="font-size: 0.8em; font-weight: normal;">(${estadoTexto})</span></strong>
                    <i class="fa-solid fa-chevron-down seta"></i>
                </div>
                <div class="card-detalhes">
                    <hr>
                    <p><strong>Nome:</strong> <span class="val-name">${nomeCompleto}</span></p>
                    <p><strong>Email:</strong> <span class="val-email">${user.email}</span></p>
                    <p><strong>Cargo:</strong> <span class="val-tel">${user.role}</span></p>
                    <p class="val-id hidden">${user.id}</p>
                    ${botoesAcao} 
                </div>`;

            configurarEventosDoCard(novoCard, user, acaoDesativar);
            listaUtilizadores.appendChild(novoCard);
        });
    }

    function configurarEventosDoCard(card, user, acaoDesativar) {
        card.addEventListener('click', () => {
            card.classList.toggle('aberto');
            card.classList.toggle('fechado');
        });

        const btnEstado = card.querySelector('.btn-estado');
        const btnEliminar = card.querySelector('.btn-eliminar');
        const btnVerPerfil = card.querySelector('.btn-ver-perfil');

        // Evento de clique no botão do Perfil
        if (btnVerPerfil) {
            btnVerPerfil.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede o card de abrir/fechar
                window.location.href = `perfil.html?userId=${user.id}`; // Redireciona
            });
        }

        if (btnEstado) {
            btnEstado.addEventListener('click', async (e) => {
                e.stopPropagation();
                await alterarEstadoUtilizador(user.id, acaoDesativar);
            });
        }

        if (btnEliminar) {
            btnEliminar.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalConfirmacao(
                    `Tem a certeza de que deseja apagar permanentemente o utilizador <strong>${user.username}</strong>? Esta ação é irreversível.`,
                    () => { apagarUtilizadorPermanent(user.id); }
                );
            });
        }
    }

    async function alterarEstadoUtilizador(id, acao) {
        const url = `http://localhost:8080/LuisF-JoseD-proj3/rest/users/admin/${id}/${acao}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { "Content-Type": "application/json", "token": token }
            });
            if (response.ok) {
                carregarUtilizadores();
            }
        } catch (error) {
            console.error("Erro de comunicação:", error);
        }
    }

    async function apagarUtilizadorPermanent(id) {
        const url = `http://localhost:8080/LuisF-JoseD-proj3/rest/users/admin/${id}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { "Content-Type": "application/json", "token": token }
            });
            if (response.ok) {
                carregarUtilizadores();
            }
        } catch (error) {
            console.error("Erro de comunicação:", error);
        }
    }
});