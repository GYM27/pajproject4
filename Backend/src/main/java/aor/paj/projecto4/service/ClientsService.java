package aor.paj.projecto4.service;

import java.util.List;

import aor.paj.projecto4.bean.ClientsBean;
import aor.paj.projecto4.dto.ClientsDTO;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
@Produces(MediaType.APPLICATION_JSON) // 1. Garante que o cabeçalho HTTP diz que é JSON
public Response restoreClient(@HeaderParam("token") String token, @PathParam("id") Long id) {
    verifier.verifyOwnershipOrAdmin(token, id);
    
    // 2. Guarda o DTO retornado pelo Bean
    ClientsDTO restoredClient = clientsBean.restoreClient(id);
    
    // 3. Retorna o objeto em vez da String
    return Response.ok(restoredClient).build();
}

    /**
     * Endpoint: Lixeira exclusiva do próprio utilizador (User Normal)
     * Rota React: api("/clients/my-trash", "GET")
     */
    @GET
    @Path("/me-trash")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMyTrash(@HeaderParam("token") String token) {
        // 1. Apenas exige que seja um utilizador válido
        verifier.verifyUser(token);

        // 2. Chama o teu método inteligente. Como ele não é Admin,
        // o teu Bean vai ignorar o 'null' e usar o ID do próprio utilizador.
        List<ClientsDTO> trash = clientsBean.listDeletedClientsDTO(token, null);

        return Response.ok(trash).build();
    }

    // --- 2. OPERAÇÕES EXCLUSIVAS DE ADMINISTRADOR ---

   @DELETE
@Path("/{id}/permanent") // Diferenciação clara para o Hard Delete
public Response permanentDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {
    // 1. Verifica se é Admin
    verifier.verifyAdmin(token);
    
    // 2. Chama o método correto de apagar definitivamente no Bean
    clientsBean.permanentDeleteClient(id);
    
    // 3. Retorna 204 No Content (o padrão para DELETEs bem-sucedidos)
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