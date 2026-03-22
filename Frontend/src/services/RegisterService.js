import api from './api';

/**
 * Serviço responsável pelo registo de utilizadores.
 * O parâmetro 'registerData' representa o DTO completo vindo do formulário.
 */
export const registerUser = async (registerData) => {
  try {
    // 1. Chamada ao motor central (api.js)
    // O 'registerData' é enviado como o corpo (body) do pedido POST
    const response = await api("/users/register", "POST", registerData);

    // 2. Retorno de sucesso estruturado para o componente
    return { 
      success: true, 
      message: "Utilizador registado com sucesso!",
      data: response 
    };

  } catch (error) {
    // 3. Propagação de erros (ex: 409 Conflict se o email já existir no Java)
    console.error("Erro no RegisterService:", error.message);
    throw error;
  }
};