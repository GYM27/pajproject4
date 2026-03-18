package aor.paj.projecto4.service;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.bean.LoginBean;
import aor.paj.projecto4.bean.TokenBean;
import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;

@RequestScoped
public class UserVerificationBean {

    @Inject
    private LoginBean loginBean;
    @Inject
    private TokenBean tokenBean;
    // Precisas disto para procurar o cliente e ver quem é o dono
    @jakarta.persistence.PersistenceContext(unitName = "project3PU")
    private jakarta.persistence.EntityManager em;

//todo, tb temos que verificar se o utililizador está inativo
    public void verifyUser(String token){

        //verificar se o token do user está válido
        if(token==null||!tokenBean.isTokenValid(token)){
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Token Inválido")
                    .build()
            );

        }

        //o token está válido, vamos buscar o utilizador
        UserEntity userEntity=tokenBean.getUserEntityByToken(token);
        //para ser extra cuidadoso
        if (userEntity == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Utilizador não encontrado.")
                            .build()
            );
        }

        //verificamos se o utilizador está ativo
        if(userEntity.isSoftDelete()){
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador inativo")
                            .build()
            );
        }

        //se não for um admin verificamos se pode aceder ao recurso pretendido
        /*if(userEntity.getUserRole()!=UserRoles.ADMIN){
            if(!userEntity.getId().equals(resourceId)){
                throw new WebApplicationException(
                        Response.status(Response.Status.FORBIDDEN)
                                .entity("Não tem permissão para aceder a este recurso.")
                                .build()
                );
            }
        }*/

    }



    public void verifyAdmin(String token){

        //verificar se o token do user está válido
        if(!tokenBean.isTokenValid(token)||token==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Token Inválido")
                            .build()
            );

        }

        //verificar se o utilizador está activo
        if(tokenBean.getUserSoftDelete(token)){
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador inativo")
                            .build()
            );
        }

        //verificar se o utilizador é um admin
        if (tokenBean.getUserRoleByToken(token)!= UserRoles.ADMIN) {
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador não é um administrador")
                            .build()
            );
        }

    }

    // --- NOVO MÉTODO ---
    public void verifyOwnershipOrAdmin(String token, Long clientId) {
        // 1. Reaproveita a validação básica (Token válido e User Ativo)
        verifyUser(token);

        // 2. Obtém o utilizador para verificar o papel (Role) e ID
        UserEntity userEntity = tokenBean.getUserEntityByToken(token);

        // 3. Se for ADMIN, ignora o resto e deixa passar
        if (userEntity.getUserRole() == UserRoles.ADMIN) {
            return;
        }

        // 4. Se for USER, temos de verificar se o cliente lhe pertence
        ClientsEntity client = em.find(ClientsEntity.class, clientId);

        if (client == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity("Cliente não encontrado.")
                            .build()
            );
        }

        // 5. Comparação de IDs (Dono do Cliente vs Utilizador do Token)
        if (!client.getOwner().getId().equals(userEntity.getId())) {
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Não tem permissão para aceder a este recurso.")
                            .build()
            );
        }
    }
}
