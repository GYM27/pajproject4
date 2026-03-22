package aor.paj.projecto4.service;

import aor.paj.projecto4.entity.LeadEntity;
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


    public UserEntity verifyUser(String token) {

        //verificar se o token do user está válido
        if (token == null || !tokenBean.isTokenValid(token)) {
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Token Inválido")
                            .build()
            );

        }

        //o token está válido, vamos buscar o utilizador
        UserEntity userEntity = tokenBean.getUserEntityByToken(token);
        //para ser extra cuidadoso
        if (userEntity == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Utilizador não encontrado.")
                            .build()
            );
        }

        //verificamos se o utilizador está ativo
        if (userEntity.isSoftDelete()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador inativo")
                            .build()
            );
        }

        return userEntity;
    }


    public void verifyAdmin(String token) {

        //verificar se o token do user está válido
        if (token == null || !tokenBean.isTokenValid(token)) {
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Token Inválido")
                            .build()
            );

        }

        //verificar se o utilizador está activo
        if (tokenBean.getUserSoftDelete(token)) {
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador inativo")
                            .build()
            );
        }

        //verificar se o utilizador é um admin
        if (tokenBean.getUserRoleByToken(token) != UserRoles.ADMIN) {
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("Utilizador não é um administrador")
                            .build()
            );
        }

    }

    // ------------------ Metodo para verificar ownership clientes e Leads-----------------------

    /**
     * Autorização: Garante que apenas o dono do cliente ou um Admin acedam aos dados.
     * @param token O token de sessão enviado no Header.
     * @param clientId O ID do cliente que se pretende manipular.
     */
    public void verifyOwnershipOrAdmin(String token, Long clientId) {
        //O ID não pode ser nulo
        if (clientId == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity("O ID do Cliente é obrigatório.")
                            .build()
            );
        }

        //Verifica se quem faz o pedido existe e tem sessão válida.
        // valida token e se o user está ativo.
        verifyUser(token);

        //Recupera o objeto do utilizador para saber o seu Role e ID.
        UserEntity userEntity = tokenBean.getUserEntityByToken(token);

        // Se o utilizador for Administrador, o método termina aqui (return).
        // O Admin tem permissão total e ignora as verificações de posse seguintes.
        if (userEntity.getUserRole() == UserRoles.ADMIN) {
            return;
        }

        //Tenta encontrar o cliente na base de dados pelo ID fornecido.
        ClientsEntity client = em.find(ClientsEntity.class, clientId);

        // Se o cliente não existir (ID errado ou apagado), lança 404 Not Found.
        // Isto evita erros de NullPointer mais à frente no código.
        if (client == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND)
                            .entity("Cliente não encontrado.")
                            .build()
            );
        }

        // (OWNERSHIP):
        // Compara o ID do dono do cliente
        // com o ID de quem está a pedir
        if (!client.getOwner().getId().equals(userEntity.getId())) {
            // Se os IDs forem diferentes, o acesso é negado (403 Forbidden).
            // Um utilizador comum não pode "espreitar" os clientes de outros.
            throw new WebApplicationException(Response.status(Response.Status.FORBIDDEN)
                            .entity("Não tem permissão para aceder a este recurso.")
                            .build()
            );
        }
    }


    /**
     * Verifica se o utilizador tem permissão para aceder/alterar uma Lead específica.
     *
     * @param token  O token de sessão.
     * @param leadId O ID da lead que se pretende aceder.
     */
    public void verifyLeadOwnership(String token, Long leadId) {

        // 1. Validar se o ID foi enviado
        if (leadId == null) {
            throw new WebApplicationException(Response.status(Response.Status.BAD_REQUEST)
                            .entity("O ID da Lead é obrigatório.")
                            .build()
            );
        }
        // AUTENTICAÇÃO: Reutiliza o verifyUser para garantir que o token é válido e o user está ativo.
        // Se o token for inválido, o código "morre" aqui e lança 401 ou 403 automaticamente.
        verifyUser(token);

        // Obtemos a entidade do utilizador para saber quem ele é no sistema.
        UserEntity user = tokenBean.getUserEntityByToken(token);

        // Se o utilizador for um Administrador, ele tem permissao total
        // O método termina aqui (return) e permite que o Admin avance para o Bean.
        if (user.getUserRole() == UserRoles.ADMIN) return;

        // Procuramos a Lead na Base de Dados pelo ID fornecido no URL.
        LeadEntity lead = em.find(LeadEntity.class, leadId);

        // Se a lead não existir (ou já tiver sido apagada da DB)
        if (lead == null) {
            throw new WebApplicationException("Lead não encontrada", 404);
        }

        // (OWNERSHIP):
        // Comparamos o ID do dono da Lead com o ID do utilizador que enviou o token.
        // Se os IDs forem diferentes, significa que um utilizador comum está a tentar aceder a dados de outro.
        if (!lead.getOwner().getId().equals(user.getId())) {
            // Bloqueamos o acesso com 403 Forbidden.
            throw new WebApplicationException("Acesso negado a esta lead", 403);
        }

    }
}
