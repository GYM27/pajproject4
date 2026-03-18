// JS/login.js

const htmlLogin = `
    <form id="login-form">
        <label class="login" for="username">Utilizador:</label>
        <input type="text" id="username" name="username" placeholder="Introduza o seu nome" required>

        <label class="login" for="password">Palavra-passe:</label>
        <input type="password" id="password" name="password" placeholder="Introduza a sua senha" required>

        <button type="submit" class="botao">ENTRAR</button>
    </form>
    <p>
        Ainda não tem conta? <a href="javascript:void(0)" onclick="mostrarRegisto()">Registe-se aqui</a>
    </p>
`;

const htmlRegisto = `
    <h2>Criar Nova Conta</h2>
    <form id="register-form">
        <div>
            <div>
                <label for="reg-firstname">Primeiro Nome</label>
                <input type="text" id="reg-firstname" placeholder="Ex: João" required>
            </div>
            <div style="flex: 1;">
                <label for="reg-lastname">Apelido</label>
                <input type="text" id="reg-lastname" placeholder="Ex: Silva" required>
            </div>
        </div>

        <label for="reg-username">Nome de Utilizador (Username)</label>
        <input type="text" id="reg-username" placeholder="Escolha um username" required>

        <label for="reg-email">E-mail</label>
        <input type="email" id="reg-email" placeholder="exemplo@bridge.com" required>

        <label for="reg-phone">Telefone</label>
        <input type="tel" id="reg-phone" placeholder="912 345 678" required>

        <label for="reg-password">Palavra-passe</label>
        <input type="password" id="reg-password" placeholder="Crie uma senha forte" required>

        <button type="submit" class="botao">REGISTAR</button>
    </form>
    <p>
        Já tem conta? <a href="javascript:void(0)" onclick="mostrarLogin()" >Faça Login aqui</a>
    </p>
`;

// Funções para trocar o conteúdo
function mostrarRegisto() {
    const box = document.querySelector(".login-box");
    box.innerHTML = htmlRegisto;

    // Captura o formulário assim que ele é injetado no HTML
    const form = document.getElementById("register-form");
    form.onsubmit = function (event) {
        event.preventDefault(); // Impede o recarregamento da página
        fazerRegisto();        // Só chama a função se o navegador validar os campos
    };
}

function mostrarLogin() {
    const box = document.querySelector(".login-box");
    box.innerHTML = htmlLogin;

    const form = document.getElementById("login-form");
    form.onsubmit = function (event) {
        event.preventDefault();
        fazerLogin();
    };
}

async function fazerLogin() {

    const nome = document.getElementById("username").value.trim();
    const senha = document.getElementById("password").value.trim();

    if (nome === "" || senha === "") {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    try {
        const response = await fetch(

            '/LuisF-JoseD-proj3/rest/users/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: nome,
                    password: senha
                })
            }
        );

        if (response.ok) {
            const data = await response.json();

            // GUARDA O ID DO UTILIZADOR (Admin ou Comum)
            localStorage.setItem("userId", data.id);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.firstName);
            localStorage.setItem("userRole", data.userRole);


            window.location.href = "Dashboard.html";
        } else {
            alert("Utilizador ou palavra-passe incorretos.");
        }

    } catch (error) {
        console.error("Erro na ligação ao servidor:", error);
        alert("Servidor indisponível no momento.");
    }
}


async function fazerRegisto() {

    const dadosRegisto = {
        username: document.getElementById("reg-username").value.trim(),
        password: document.getElementById("reg-password").value.trim(),
        email: document.getElementById("reg-email").value.trim(),
        firstName: document.getElementById("reg-firstname").value.trim(),
        lastName: document.getElementById("reg-lastname").value.trim(),
        cellphone: document.getElementById("reg-phone").value.trim()
    };

    //valida se deixarmos campos vazios avisa utilizador para preencher
    if (Object.values(dadosRegisto).some(v => v === "")) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(
            '/LuisF-JoseD-proj3/rest/users/register',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosRegisto)
            }
        );

        if (response.ok) {
           
            //localStorage.setItem("userName", dadosRegisto.username);
            //localStorage.setItem("userPass", dadosRegisto.password);

            alert(`Bem-vindo, ${dadosRegisto.firstName}! Por favor faça Login`);
            window.location.href = "Login.html";
        } else {
            const erro = await response.json();
            alert(erro.error || "Erro ao criar conta.");
        }

    } catch (error) {
        console.error("Erro no registo:", error);
        alert("Erro de ligação ao servidor.");
    }
}