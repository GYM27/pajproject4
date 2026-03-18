package aor.paj.projecto4.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.bean.LeadsBean;
import aor.paj.projecto4.bean.LoginBean;
import aor.paj.projecto4.dto.LeadDTO;

import java.util.ArrayList;

@Path("/users")
public class LeadService {

    @Inject
    LeadsBean leadsBean;
    @Inject
    LoginBean loginBean;
    @Inject
    UserVerificationBean verifier;

    /**
     * Devolve todos os leads de um utilizador
     * @param token o token do utilizador
     * @return a resposta adequada
     */
    @GET
    @Path("/me/leads")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeadDTOs(
            @HeaderParam("token") String token
    ) {

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        ArrayList<LeadDTO> leads=leadsBean.getLeadDTOsByToken(token);
        if (leads != null) return Response.ok(leads).build();
        return Response.status(Response.Status.NOT_FOUND).build();
    }


    /**
     * ir buscar um lead por id
     * @param leadId o id do lead
     * @param token o token do utilizador
     * @return
     */
    @GET
    @Path ("/me/leads/{leadId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeadByUserIdLeadId(
            //@PathParam("userId") Long resourceId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token
            ){


        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        LeadDTO leadDTO=leadsBean.getLeadDTOByTokenLeadId(token,leadId);
        //antes disto temos que verificar se encontramos efetivamente esse lead
        if(leadDTO==null){
            return Response.status(Response.Status.NOT_FOUND).entity("Lead não encontrado para o id fornecido").build();

        }
        return Response.ok(leadDTO).build();
    }

    /**
     * U3 Adicionar um lead ao user
     * @param leadDTO o DTO do lead
     * @param token o token do user
     * @return a resposta adequada
     */
    @POST
    @Path("/me/leads")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createLead(
            //@PathParam("userId") Long resourceId,
            LeadDTO leadDTO,
            @HeaderParam("token") String token
    ) {

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        boolean success=leadsBean.addLeadDTOToUser(token, leadDTO);

        //se bem sucedido
        if(success){
            return Response.status(Response.Status.CREATED).build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar a criação do lead.")
                .build();

    }


    /**
     * U5 e U6 Edita um lead através de uma chamada put
     * @param leadId id do lead
     * @param leadDTO o json do lead
     * @param token o token do user
     * @return a resposta adequada
     */
    @PUT
    @Path("/me/leads/{leadId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces (MediaType.APPLICATION_JSON)
    public Response putLeadDTOByUserIdLeadId(
            //@PathParam("userId") Long resourceID,
            @PathParam("leadId") Long leadId,
            LeadDTO leadDTO,
            @HeaderParam("token") String token
    ){

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        boolean success=leadsBean.putLeadDTOByTokenLeadId(token, leadId,leadDTO);
        //se bem sucedido
        if(success) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar a edição do lead.")
                .build();
    }


    /**
     *Faz o soft delete de um lead
     * @param leadId o id do lead
     * @param token o token
     * @return a resposta adequada
     */
    @POST
    @Path("/me/leads/{leadId}/softdelete")
    @Produces (MediaType.APPLICATION_JSON)
    public Response softDelLeadById(
            //@PathParam("userId") Long resourceId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token
    ){
        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        boolean deleted=leadsBean.softDelLeadById(leadId,token);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o soft delete do lead.")
                .build();

    }


    //*************************Secção do Administrador***************************************************************

    /**
     * Adicionar Leads a um utilizador
     * @param userId o id do user
     * @param token o token do admin
     * @param leadDTO o lead a adicionar
     * @return a resposta adequada
     */
    @POST
    @Path("/admin/{userId}/leads")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response adminAddLeadDTOToUser(
            @PathParam("userId") Long userId,
            @HeaderParam("token") String token,
            LeadDTO leadDTO
    ){

        //validar o administrador
        verifier.verifyAdmin(token);
        //funcionalidade
        boolean success=leadsBean.addLeadDTOToUserByUserId(userId, leadDTO);

        //se bem sucedido
        if(success){
            return Response.status(Response.Status.CREATED).build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar a criação do lead.")
                .build();

    }

    /**
     * A2 Editar um lead de um utilizador
     * @param userId o id do utilizador
     * @param leadId o id da lead a editar
     * @param token o token do admin
     * @param leadDTO  a nova versão do lead
     * @return a resposta adequada
     */
    @PUT
    @Path("/admin/{userId}/leads/{leadId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response adminUpdateLeadDTOToUser(
            @PathParam("userId") Long userId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token,
            LeadDTO leadDTO
    ){

        //validar o administrador
        verifier.verifyAdmin(token);
        //funcionalidade
        boolean success=leadsBean.adminUpdateLeadDTO( userId,  leadId,  leadDTO);

        //se bem sucedido
        if(success){
            return Response.status(Response.Status.CREATED).build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar a criação do lead.")
                .build();

    }



    /**
     * A13 Hard delete de um lead
     * @param resourceId id do user
     * @param leadId id do lead
     * @param token o token do user
     * @return a resposta adequada
     */
    @DELETE
    @Path("/admin/{userId}/leads/{leadId}")
    public Response delLeadById(
            @PathParam("userId") Long resourceId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token
    ){

        //validar o administrador
        verifier.verifyAdmin(token);

        //funcionalidade
        boolean deleted=leadsBean.hardDelLeadById(leadId);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o hard delete do lead.")
                .build();
    }


    /**
     * A11 soft delete de todos os leads de um utilizador
     * @param resourceId o id do user
     * @param token o token do user
     * @return a resposta adequada
     */
    @POST
    @Path("/admin/{userId}/leads/softdeleteall")
    public Response softDelAllUserLeads(
            @PathParam("userId") Long resourceId,
            @HeaderParam("token") String token
    ){
        //validar o administrador
        verifier.verifyAdmin(token);

        //funcionalidade
        //boolean deleted=leadsBean.softDelALlUserLeads(token);
        boolean deleted=leadsBean.softDelALlUserLeadsAdmin(resourceId);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o hard delete do lead.")
                .build();
    }


    /**
     * Undelete de todos os leads de um utilizador
     * @param resourceId o id do utilizador
     * @param token o token do admin
     * @return a resposta adequada
     */
    @POST
    @Path("/admin/{userId}/leads/softundeleteall")
    public Response softUnDelAllUserLeads(
            @PathParam("userId") Long resourceId,
            @HeaderParam("token") String token
    ){
        //validar o administrador
        verifier.verifyAdmin(token);

        //funcionalidade
        boolean deleted=leadsBean.softUnDelALlUserLeadsAdmin(resourceId);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o hard delete do lead.")
                .build();
    }


    /**
     * Obtém todos os leads com soft delete de um determinado utilizador
     * @param resourceId o id do utilizador
     * @param token o token do administrador
     * @return a resposta adequada
     */
    @GET
    @Path("/admin/{userId}/leads/softdeleted/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSoftDelUserLeads(
            @PathParam("userId") Long resourceId,
            @HeaderParam("token") String token
    ){
        //validar o administrador
        verifier.verifyAdmin(token);

        //funcionalidade
        ArrayList<LeadDTO> leads = leadsBean.getSoftDelLeadsByUserId(resourceId);

        //resposta se bem sucedido
        if (leads != null) return Response.ok(leads).build();

        //resposta se mal sucedido
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    /**
     * A4 Faz o soft delete de um lead
     * @param leadId o id do lead
     * @param token o token
     * @return a resposta adequada
     */
    @POST
    @Path("/admin/{userId}/leads/{leadId}/softdelete")
    @Produces (MediaType.APPLICATION_JSON)
    public Response softDelLeadByIdAdmin(
            @PathParam("userId") Long resourceId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token
    ){
        //validar o utilizador
        verifier.verifyAdmin(token);

        //funcionalidade
        boolean deleted=leadsBean.adminSoftDelLeadById(leadId);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o soft delete do lead.")
                .build();

    }

    /**
     * Faz o soft undelete do lead
     * @param resourceId o id do utilizador
     * @param leadId o id do lead
     * @param token o token
     * @return a resposta adequada
     */
    @POST
    @Path("/admin/{userId}/leads/{leadId}/softundelete")
    @Produces (MediaType.APPLICATION_JSON)
    public Response softUnDelProjectByIdAdmin(
            @PathParam("userId") Long resourceId,
            @PathParam("leadId") Long leadId,
            @HeaderParam("token") String token
    ){
        //validar o utilizador
        verifier.verifyAdmin(token);

        //funcionalidade
        boolean deleted=leadsBean.softUnDelLeadById(leadId);

        //resposta
        if(deleted) {
            return Response.ok().build();
        }

        //se mal sucedido
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity("Erro ao processar o soft undelete do lead.")
                .build();

    }

    /**
     * A7 Devolve todos os leads de um utilizador
     * @param token o token do utilizador
     * @return a resposta adequada
     */
    @GET
    @Path("/admin/{userId}/leads")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeadDTOsFromUser(
            @PathParam("userId") Long resourceId,
            @HeaderParam("token") String token
    ) {

        //validar o utilizador
        verifier.verifyAdmin(token);

        //funcionalidade
        ArrayList<LeadDTO> leadDTOs = leadsBean.getLeadDTOsByUserId(resourceId);

        if (leadDTOs != null) return Response.ok(leadDTOs).build();
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    //A8
    @GET
    @Path("/admin/leads/state/{state}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllLeadsByState(
            @PathParam("state") int stateId,
            @HeaderParam("token") String token
    ){
        //validar o utilizador
        verifier.verifyAdmin(token);

        //funcionalidade
        ArrayList<LeadDTO> leadDTOs=leadsBean.getLeadDTOsByState(stateId);

        if (leadDTOs != null) return Response.ok(leadDTOs).build();
        return Response.status(Response.Status.NOT_FOUND).build();
    }

}