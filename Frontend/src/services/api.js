/**
 * Ponto de entrada base da API definido no ApplicationConfig do JAX-RS.
 */
const BASE_URL = "http://localhost:8080/LuisF-proj4/rest";

/**
 * Função utilitária centralizada para gerir pedidos HTTP (fetch).
 * Centraliza a lógica de autenticação via Token e o tratamento de erros do servidor.
 */
const apiRequest = async (endpoint, method = "GET", body = null) => {
  
  // 1. Recupera o token de sessão da persistência local (localStorage)
  const token = localStorage.getItem("token");
  
  // 2. Define os cabeçalhos padrão para comunicação JSON
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // 3. Injeção dinâmica do token nos Headers para rotas protegidas pelo UserVerificationBean
  if (token) {
    headers["token"] = token;
  }

  // 4. Configuração estrutural do Request
  const config = {
    method: method,
    headers: headers,
  };

  // 5. Serialização do corpo do pedido para JSON, se existirem dados
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    // 6. Execução da chamada assíncrona ao servidor Wildfly
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // 7. Tratamento de respostas de erro capturadas pelos ExceptionMappers do Java
    if (!response.ok) {
      // Faz o parse do objeto ErrorResponse enviado pelo Backend
      const errorData = await response.json();
      // Propaga a mensagem de erro específica definida nas nossas exceções Java
      throw new Error(errorData.message || "Erro na comunicação com o servidor.");
    }

    // 8. Gestão de status 204 (No Content) comum em operações de Logout ou Delete
    if (response.status === 204) {
      return true;
    }

    // 9. Desserialização da resposta JSON para objetos Javascript consumíveis pelo React
    return await response.json();

  } catch (error) {
    // 10. Tratamento específico para falhas de conectividade (Rede/Servidor em baixo)
    if (error.message === "Failed to fetch") {
      throw new Error("Conexão recusada. Verifique se o servidor Wildfly está ativo.");
    }
    // Re-lança o erro para ser tratado pelo componente ou Store (Zustand)
    throw error;
  }
};

export default apiRequest;