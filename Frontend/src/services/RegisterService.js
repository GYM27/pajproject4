const API_URL = "http://localhost:8080/LuisF-proj4/rest/users/register";

export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.status === 201) {
      return { message: "Utilizador criado com sucesso!" }; // Devolvemos isto para o componente
    }

    if (!response.ok) {
      // Se o status for 409, o backend está a dizer que o user já existe
      if (response.status === 409)
        throw new Error("Este utilizador ou email já está registado.");

      // Erro genérico para qualquer outro problema do servidor (500, 404, etc)
      throw new Error(
        "O sistema está temporariamente indisponível. Tente mais tarde.",
      );
    }

    return await response.json();
  } catch (error) {
    // ESTA LINHA É PARA TI: Vês o erro real no F12 do browser
    console.error("Erro Técnico Oculto:", error);

    // ESTA MENSAGEM É PARA O USER:
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Não foi possível ligar ao servidor. Verifique a sua ligação.",
      );
    }

    // Se já for uma das mensagens que escrevemos acima, ele apenas a passa adiante
    throw error;
  }
};
