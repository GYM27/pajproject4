// URL base baseada no teu ApplicationConfig.java e pom.xml do backend
const API_URL = "http://localhost:8080/LuisF-proj4/rest/users/login";

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    // Verificação manual do status da resposta (importante para REST)
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Utilizador ou password incorretos.");
      }
      throw new Error("Erro no servidor. Tente mais tarde.");
    }

    // 1. Captura o token que o Java enviou no Header chamado "token"
    const token = response.headers.get("token");

    // 2. Captura os dados do perfil (username, etc.) que vêm no corpo da resposta
    const data = await response.json();

    // 3. Devolve um objeto único com tudo.
    // Se o token vier no header, ele é adicionado ao resultado.
    return {
      ...data,
      token: token || data.token // Tenta ler do header, se não houver, tenta do corpo
    };
  } catch (error) {
    // Em vez de apenas 'throw error', vamos analisar a falha
    console.error("Erro na chamada de Login:", error.message);

    // Se o erro for de rede (ex: Wildfly desligado), o 'fetch' lança TypeError
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Não foi possível ligar ao servidor. Verifique se o backend está a correr.",
      );
    }

    // Re-lançamos o erro já "tratado" ou com a mensagem correta para o componente
    throw error;
  }
};
