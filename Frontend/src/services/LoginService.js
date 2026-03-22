import api from './api';

/**
 * Serviço responsável por comunicar com o endpoint de autenticação.
 * Utiliza o wrapper centralizado 'api' para gerir o fetch e o token.
 */
export const loginUser = async (credentials) => {
    try {
        // 1. Fazemos o pedido POST para o endpoint /auth/login definido no Java
        // Passamos as credenciais (username e password) que o Login.jsx nos deu
        const data = await api("/auth/login", "POST", credentials);

        /** * 2. Se o login for bem-sucedido, o Java devolve o LoginResponseDTO:
         * { id, firstName, userRole, token }
         * Guardamos estas informações no localStorage para manter a sessão ativa.
         */
        if (data && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.firstName);
            localStorage.setItem("userRole", data.userRole);
        }

        // 3. Devolvemos os dados para o componente React saber que pode avançar
        return data;

    } catch (error) {
        // 4. Captura erros (ex: 401 Unauthorized do Java) e propaga-os para a UI
        console.error("Erro no serviço de autenticação:", error.message);
        throw error;
    }
}


    /**
 * Encerra a sessão do utilizador.
 * Comunica com o Backend para invalidar o token e limpa os dados locais.
 */
export const logoutUser = async () => {

     // 1. Recuperamos o token para enviar no pedido
        const token = localStorage.getItem("token");
    try {
        if (token) {
        // 2. Chamamos o endpoint de logout. 
        // O api.js enviará o token no header automaticamente.
        await api("/auth/logout", "POST");
        console.log("Token invalidado com sucesso no servidor.");
        }

    } catch (error) {
        // Mesmo que a rede falhe, queremos limpar os dados locais
        console.error("Erro ao invalidar token no servidor:", error.message);
    } finally {
        // 3. LIMPEZA TOTAL: Acontece sempre, com ou sem sucesso na rede
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
    }

};