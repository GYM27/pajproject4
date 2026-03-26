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
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addClient(@HeaderParam("token") String token, @Valid ClientsDTO clientDto) {
        verifier.verifyUser(token);
        ClientsDTO createdClient = clientsBean.addClient(token, clientDto);
        return Response.status(201).entity(createdClient).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listClients(
            @HeaderParam("token") String token,
            @QueryParam("userId") Long userId
    ) {
        verifier.verifyUser(token);
        // O Bean agora trata a lógica Admin vs User internamente
        List<ClientsDTO> clients = clientsBean.listClients(token, userId);
        return Response.ok(clients).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateClient(@PathParam("id") Long clientId,
                                 @HeaderParam("token") String token,
                                 @Valid ClientsDTO clientDto) {
        verifier.verifyOwnershipOrAdmin(token, clientId);
        ClientsDTO updatedClient = clientsBean.editClient(clientId, clientDto);
        return Response.ok(updatedClient).build();
    }

    @DELETE
    @Path("/{id}")
    public Response softDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {
        verifier.verifyOwnershipOrAdmin(token, id);
        clientsBean.softDeleteClient(id);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/restore")
    public Response restoreClient(@HeaderParam("token") String token, @PathParam("id") Long id) {
        verifier.verifyOwnershipOrAdmin(token, id);
        clientsBean.restoreClient(id);
        return Response.ok("Cliente restaurado com sucesso.").build();
    }

    // --- 2. OPERAÇÕES EXCLUSIVAS DE ADMINISTRADOR ---

    @DELETE
    @Path("/{id}/permanent") // Diferenciação clara para o Hard Delete
    public Response permanentDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {
        verifier.verifyAdmin(token);
        clientsBean.permanentDeleteClient(id);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/user/{userId}/status/deactivate-all")
    public Response softDeleteAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {
        verifier.verifyAdmin(token);
        clientsBean.softDeleteAllClientsByUser(userId); // Agora usa Bulk Update
        return Response.ok().build();
    }

    @GET
    @Path("/user/{userId}/trash")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDeletedClientsByUserId(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {
        verifier.verifyAdmin(token);
        // Atualizado para usar o novo método dinâmico com filtro
        List<ClientsDTO> clients = clientsBean.listDeletedClientsDTO(token, userId);
        return Response.ok(clients).build();
    }

    @PATCH
    @Path("/user/{userId}/status/activate-all")
    public Response restoreAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {
        verifier.verifyAdmin(token);
        clientsBean.unSoftDeleteAllClientsByUser(userId); // Agora usa Bulk Update
        return Response.ok().build();
    }

    @DELETE
    @Path("/user/{userId}/trash")
    public Response emptyTrash(
            @PathParam("userId") Long userId,
            @HeaderParam("token") String token) {
        verifier.verifyAdmin(token);
        clientsBean.emptyTrash(userId);
        return Response.noContent().build();
    }

    @POST
    @Path("/user/{userId}")
    public Response createClientForUser(
            @PathParam("userId") Long userId,
            @Valid ClientsDTO dto,
            @HeaderParam("token") String token) {
        verifier.verifyAdmin(token);
        ClientsDTO created = clientsBean.createClientForUser(userId, dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @GET
    @Path("/trash")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllDeletedClients(@HeaderParam("token") String token) {
        verifier.verifyAdmin(token);
        // Chama a lixeira global sem filtro de utilizador
        List<ClientsDTO> clients = clientsBean.listAllDeletedClients();
        return Response.ok(clients).build();
    }
}