package aor.paj.projecto4.service;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.bean.ClientsBean;
import aor.paj.projecto4.dto.ClientsDTO;
import java.util.List;

@Path("/clients")
public class ClientsService {

    @Inject
    ClientsBean clientsBean;

    @Inject
    UserVerificationBean verifier;

    // --- 1. OPERAÇÕES DE UTILIZADOR E DONO ---

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addClient(@HeaderParam("token") String token, @Valid ClientsDTO clientDto) {
        // Apenas verifica se o token é válido e o user está ativo
        verifier.verifyUser(token);
        try {
            clientsBean.addClient(token, clientDto);
            return Response.status(201).entity("Cliente criado com sucesso.").build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        } catch (Exception e) {
            return Response.status(500).entity("Erro interno ao criar cliente.").build();
        }
    }

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listMyClients(@HeaderParam("token") String token) {
        verifier.verifyUser(token);
        try {
            // 2. O Bean filtra por owner_id e converte para DTO
            List<ClientsDTO> clients = clientsBean.listAllMyClientsDTO(token);
            return Response.ok(clients).build();
        } catch (Exception e) {
            return Response.status(500).entity("Erro ao carregar os seus clientes.").build();
        }
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateClient(@PathParam("id") Long clientId,
                                 @HeaderParam("token") String token,
                                 @Valid ClientsDTO clientDto) {
        try {
            // SEGURANÇA: Bloqueia se não for o dono nem admin
            verifier.verifyOwnershipOrAdmin(token, clientId);

            clientsBean.editClient(token, clientId, clientDto);
            return Response.ok("Cliente atualizado com sucesso.").build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        }
    }

    @POST
    @Path("/{id}/delete")
    public Response softDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {
        try {
            // SEGURANÇA: Bloqueia se não for o dono nem admin
            verifier.verifyOwnershipOrAdmin(token, id);

            clientsBean.softDeleteClient(id);
            return Response.ok("Cliente movido para a lixeira.").build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        }
    }

    @POST
    @Path("/{id}/restore")
    public Response restoreClient(@HeaderParam("token") String token, @PathParam("id") Long id) {
        try {
            // SEGURANÇA: Só o dono ou admin pode restaurar o recurso
            verifier.verifyOwnershipOrAdmin(token, id);

            clientsBean.restoreClient(id);
            return Response.ok("Cliente restaurado com sucesso.").build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        }
    }

    // --- 2. OPERAÇÕES EXCLUSIVAS DE ADMINISTRADOR (/all) ---

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllClients(@HeaderParam("token") String token) {
        verifier.verifyAdmin(token);
        try {
            List<ClientsDTO> clients = clientsBean.listAllClients(token);
            return Response.ok(clients).build();
        } catch (Exception e) {
            return Response.status(500).entity("Erro ao carregar lista global.").build();
        }
    }

    @DELETE
    @Path("/{id}/permanent")
    public Response permanentDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {
        // Aqui usamos verifyAdmin porque o requisito geralmente diz que
        // utilizadores comuns não podem apagar fisicamente da BD
        verifier.verifyAdmin(token);
        try {
            clientsBean.permanentDeleteClient(id);
            return Response.ok("Cliente removido permanentemente.").build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        }
    }

     /**
     *Filtrar lista de clientes criados por um utilizador
     */
    @GET
    @Path("/admin/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getClientsByUserId(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        // Verifica se quem está a fazer o pedido é realmente um administrador
        verifier.verifyAdmin(token);

        try {
            List<ClientsDTO> clients = clientsBean.listClientsByUser(userId);
            return Response.ok(clients).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erro ao carregar a lista de clientes do utilizador.")
                    .build();
        }
    }

    /**
     * Apagar (soft delete) todos os clientes criados por um utilizador
     */
    @POST
    @Path("/admin/user/{userId}/softdeleteall")
    public Response softDeleteAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        // Verifica se quem está a fazer o pedido é administrador
        verifier.verifyAdmin(token);

        try {
            clientsBean.softDeleteAllClientsByUser(userId);
            return Response.ok("Todos os clientes do utilizador foram apagados com sucesso.").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erro ao apagar os clientes do utilizador.")
                    .build();
        }
    }

    @GET
    @Path("/admin/user/{userId}/deleted")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDeletedClientsByUserId(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {
        verifier.verifyAdmin(token);
        try {
            List<ClientsDTO> clients = clientsBean.listDeletedClientsByUser(userId);
            return Response.ok(clients).build();
        } catch (Exception e) {
            return Response.status(500).entity("Erro ao carregar clientes apagados.").build();
        }
    }

    /**
     * Restaurar todos os clientes apagados de um utilizador (Soft Undelete All)
     */
    @POST
    @Path("/admin/user/{userId}/restoreall")
    public Response restoreAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        verifier.verifyAdmin(token);

        try {
            clientsBean.unSoftDeleteAllClientsByUser(userId);
            return Response.ok("Todos os clientes do utilizador foram restaurados com sucesso.").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erro ao restaurar os clientes do utilizador.")
                    .build();
        }
    }

    @DELETE
    @Path("/admin/user/{userId}/emptytrash")
    @Produces(MediaType.APPLICATION_JSON)
    public Response emptyTrash(@PathParam("userId") Long userId, @HeaderParam("token") String token) {
        // 1. Verifica se quem está a pedir é Admin
        verifier.verifyAdmin(token);

        // 2. Chama o Bean para apagar tudo
        boolean success = clientsBean.emptyTrash(userId);

        if (success) {
            return Response.ok().build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Erro ao esvaziar lixeira").build();
    }

    @POST
    @Path("/admin/user/{userId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createClientForUser(@PathParam("userId") Long userId, ClientsDTO dto, @HeaderParam("token") String token) {
        verifier.verifyAdmin(token);
        boolean created = clientsBean.createClientForUser(userId, dto);
        if (created) return Response.ok().build();
        return Response.status(400).entity("Erro ao criar cliente para este utilizador").build();
    }

}