

const API_URL= "http://localhost:8080/LuisF-proj4/rest/users";

export const userService= {

    getMe: async ()=>{
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'token': token // Entrega a chave no cabeçalho, como o Java quer
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao comunicar com o servidor");
        }

        return await response.json(); // Devolve os dados prontos a usar
    }
};