package aor.paj.projecto4.service;

import java.util.List;

import aor.paj.projecto4.bean.LeadsBean;
import aor.paj.projecto4.bean.LoginBean;
import aor.paj.projecto4.dto.LeadDTO;
import aor.paj.projecto4.exception.ErrorResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("leads")
public class LeadService {

    @Inject
    LeadsBean leadsBean;
    @Inject
    LoginBean loginBean;
    @Inject
    UserVerificationBean verifier;


    /**
     * Adicionar um lead ao utilizador autenticado.
     * O uso de @Valid garante que campos vazios sejam travados pelo ValidationExceptionMapper.
     */
    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createLead(@HeaderParam("token") String token,
                               @Valid LeadDTO leadDTO) {

        // 1. Segurança: Verifica se o token é válido e o utilizador está ativo
        verifier.verifyUser(token);
        // 2. Lógica: O Bean cria a lead e já nos devolve o DTO com o ID gerado
        LeadDTO created = leadsBean.addLead(token, leadDTO);
        // 3. Resposta: Status 201 (Created) enviando o objeto completo para o React
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    /**
     * Devolve a lista de leads associada ao utilizador autenticado.
     * Utilizado tanto pela página de gestão de leads como pelo Dashboard para contagens.
     */
    @GET
    @Path("/") 
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeads(@HeaderParam("token") String token) {

        // 1. Segurança: Valida token e se o utilizador está ativo.
        // Se falhar, lança 401 ou 403 e o método para aqui.
        verifier.verifyUser(token);

        // 2. Lógica: O Bean procura as entidades e converte-as para DTOs.
        // Usamos List (interface) em vez de ArrayList (implementação).
        List<LeadDTO> leads = leadsBean.getLeadsByToken(token);

        // 3. Resposta: Retornamos a lista (mesmo que esteja vazia, é um 200 OK com []).
        return Response.ok(leads).build();
    }

    /**
     * Obter uma lead específica pelo ID.
     * O verifier garante: Token válido, User ativo, Existência da lead e Posse/Admin.
     */
    @GET
    @Path("/{leadId}") // Retiramos o /me para padronizar com /clients
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeadById(@HeaderParam("token") String token,
                                @PathParam("leadId") Long leadId) {

        //Esta única linha faz todo o trabalho
        // Se não for o dono ou admin, ou se a lead não existir, lança logo a exceção (401, 403 ou 404).
        verifier.verifyLeadOwnership(token, leadId);

        // 2. LÓGICA: Se o código chegou aqui, é porque a lead existe e o user tem permissão.
        // O Bean agora só precisa de ir buscar e converter.
        LeadDTO lead = leadsBean.getLeadById(leadId);

        // 3. RESPOSTA: Sucesso garantido.
        return Response.ok(lead).build();
    }

    @PUT
    @Path("/{leadId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateLead(@HeaderParam("token") String token,
                               @PathParam("leadId") Long leadId,
                               @Valid LeadDTO leadDTO) {

        // 1. O "polícia" faz todas as verificações de token e posse
        verifier.verifyLeadOwnership(token, leadId);

        // 2. O Bean executa apenas a atualização dos dados
        LeadDTO updated = leadsBean.editLead(leadId, leadDTO);

        return Response.ok(updated).build();
    }


    /**
     * U7 Soft Delete de Lead usando o verbo DELETE.
     */
    @DELETE
    @Path("/{leadId}") // URL limpa e profissional
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteLead(@HeaderParam("token") String token,
                               @PathParam("leadId") Long leadId) {

        // A segurança continua a ser a mesma
        verifier.verifyLeadOwnership(token, leadId);

        // O Bean faz o mesmo trabalho (setSoftDelete(true))
        leadsBean.softDeleteLead(leadId);

        return Response.ok(new ErrorResponse("Lead eliminada com sucesso", 200)).build();
    }


    //*************************Secção do Administrador***************************************************************

    /**
     * Lista todas as leads do sistema com filtros dinâmicos.
     * Lista TUDO. Pode filtrar por user, por estado ou ver o que está na lixeira usando @QueryParam.
     */
    @GET
    @Path("/admin")
    @Produces(MediaType.APPLICATION_JSON)
    public Response adminGetLeads(
            @HeaderParam("token") String token,
            @QueryParam("state") Integer stateId,          // Opcional
            @QueryParam("userId") Long userId,             // Opcional
            @QueryParam("softDeleted") Boolean softDeleted // Opcional (true/false)
    ) {
        // 1. Segurança: Apenas Admins entram aqui
        verifier.verifyAdmin(token);
        // 2. Lógica: O Bean constrói a Query baseada nos filtros enviados
        List<LeadDTO> leads = leadsBean.getLeadsWithFilters(stateId, userId, softDeleted);
        return Response.ok(leads).build();
    }


    /**
     * Super Put Admin: Edita qualquer lead do sistema,
     * inclusive para fazer "Undelete"Edita qualquer lead do sistema, inclusive para fazer "Undelete"
     */
    @PUT
    @Path("/admin/{leadId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response superAdminUpdate(
            @HeaderParam("token") String token,
            @PathParam("leadId") Long leadId,
            LeadDTO dto // O DTO traz os novos valores (título, estado, ownerId, softDelete)
    ) {
        // 1. Segurança: Apenas Admins ativos
        verifier.verifyAdmin(token);

        // 2. Execução: O Bean atualiza a entidade com base no que o DTO trouxer
        LeadDTO updated = leadsBean.adminSuperEdit(leadId, dto);

        return Response.ok(updated).build();
    }


    /**
     * Admin: Cria uma nova lead e atribui-a a um utilizador específico.
     */
    @POST
    @Path("/admin/{userId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response adminAddLeadToUser(@HeaderParam("token") String token,
                                       @PathParam("userId") Long userId,
                                       @Valid LeadDTO leadDTO) {

        // 1. Segurança: Verifica se quem chama é um ADMIN ativo
        verifier.verifyAdmin(token);

        // 2. Execução: O Bean cria a lead para o utilizador de destino
        LeadDTO created = leadsBean.addLeadToUser(userId, leadDTO);

        // 3. Resposta: 201 Created com o objeto completo
        return Response.status(Response.Status.CREATED).entity(created).build();
    }


    /**
     * Hard Delete: Remove permanentemente a lead da base de dados.
     * Apenas acessível por Administradores.
     */
    @DELETE
    @Path("/admin/{leadId}")
    public Response hardDelete(@HeaderParam("token") String token,
                               @PathParam("leadId") Long leadId) {

        // 1. Segurança: Só admins entram
        verifier.verifyAdmin(token);
        // 2. Execução: Remove a linha da tabela
        leadsBean.hardDeleteLead(leadId);
        // 3. Resposta: 204 No Content (sucesso para remoções definitivas)
        return Response.noContent().build();
    }

    /**
     * A11 Soft Delete em lote: Marca todas as leads de um utilizador como eliminadas.
     * Útil para quando um utilizador sai da empresa ou muda de departamento.
     */
    @POST
    @Path("/admin/{userId}/softdeleteall")
    @Produces(MediaType.APPLICATION_JSON)
    public Response softDeleteAllFromUser(@HeaderParam("token") String token,
                                          @PathParam("userId") Long userId) {

        // 1. Segurança: Apenas administradores
        verifier.verifyAdmin(token);

        // 2. Execução: O Bean faz o update em massa
        int totalAlterado = leadsBean.softDeleteAllFromUser(userId);

        // 3. Resposta: Informamos o React de quantas leads foram "limpas"
        return Response.ok(new ErrorResponse(totalAlterado + " leads movidas para a lixeira.", 200)).build();
    }

    /**
     * Ações em lote: Recupera todas as leads de um utilizador que estavam na lixeira.
     * Útil para reverter um erro ou quando um utilizador volta a ficar ativo.
     */
    @POST
    @Path("/admin/{userId}/softundeleteall")
    @Produces(MediaType.APPLICATION_JSON)
    public Response undeleteAllFromUser(@HeaderParam("token") String token,
                                        @PathParam("userId") Long userId) {

        // 1. Segurança: Verificação de Administrador
        verifier.verifyAdmin(token);

        // 2. Execução: O Bean executa o Update em massa na BD
        int totalRecuperado = leadsBean.undeleteAllFromUser(userId);

        // 3. Resposta: Informamos o Admin do impacto da ação
        return Response.ok(new ErrorResponse(totalRecuperado + " leads recuperadas com sucesso.", 200)).build();
    }

}
