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

        // 1. A segurança: Se falhar, o GenericExceptionMapper apanha o erro 401/403
        verifier.verifyUser(token);
        // 2. A lógica: O @Valid já disparou! Se houver erro de campos,
        // o ValidationExceptionMapper já enviou o 400 antes de chegar aqui.
        ClientsDTO createdClient = clientsBean.addClient(token, clientDto);
        // 3. O sucesso: Devolvemos 201 Created com o objeto
        return Response.status(201).entity(createdClient).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listClients(
            @HeaderParam("token") String token,
            @QueryParam("userId") Long userId // O parâmetro que o Admin pode usar
    ) {
        // 1. Validação de segurança (Token)
        verifier.verifyUser(token);

        // 2. Chamada ao Bean (Ele decide se filtra por userId ou mostra tudo)
        List<ClientsDTO> clients = clientsBean.listClients(token, userId);

        // 3. Resposta 200 OK com a lista (convertida pelo Bean)
        return Response.ok(clients).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON) // Adicionamos isto porque vamos devolver o DTO
    public Response updateClient(@PathParam("id") Long clientId,
                                 @HeaderParam("token") String token,
                                 @Valid ClientsDTO clientDto) {

        // 1. SEGURANÇA: Bloqueia se não tiver permissão
        // (O Mapper enviará 403 Forbidden se falhar)
        verifier.verifyOwnershipOrAdmin(token, clientId);

        // 2. LÓGICA: O Bean edita e devolve o DTO já com os dados guardados
        ClientsDTO updatedClient = clientsBean.editClient(clientId, clientDto);

        // 3. RESPOSTA: Devolvemos o objeto atualizado (Padrão REST)
        return Response.ok(updatedClient).build();
    }


    @DELETE
    @Path("/{id}")
    public Response softDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {


        // 1. Verificação de Segurança (Quem pede pode aceder a este ID?)
        // Se falhar, o verifier lança WebApplicationException e o GenericExceptionMapper trata
        verifier.verifyOwnershipOrAdmin(token, id);
        // 2. Delegação para a Lógica de Negócio
        clientsBean.softDeleteClient(id);
        // 3. Resposta de Sucesso Padronizada
        return Response.noContent().build();
    }


    @PATCH
    @Path("/{id}/restore")
    public Response restoreClient(@HeaderParam("token") String token, @PathParam("id") Long id) {

        // SEGURANÇA: Só o dono ou admin pode restaurar o recurso
        verifier.verifyOwnershipOrAdmin(token, id);
        clientsBean.restoreClient(id);
        return Response.ok("Cliente restaurado com sucesso.").build();
    }


    // --- 2. OPERAÇÕES EXCLUSIVAS DE ADMINISTRADOR (/all) ---


    /**
     * Remove fisicamente um cliente da base de dados (Hard Delete).
     * Apenas acessível por Administradores.
     * * @param token Identificador de sessão no Header.
     * @param id    Identificador único do cliente a remover.
     * @return      204 No Content em caso de sucesso.
     */
    @DELETE
    @Path("/{id}") // RESTful: O ID identifica o recurso, o verbo DELETE identifica a ação.
    public Response permanentDelete(@HeaderParam("token") String token, @PathParam("id") Long id) {

        // 1. AUTORIZAÇÃO: Bloqueia o acesso imediato se o utilizador não for ADMIN.
        // O Verifier lançará Forbidden (403) se a regra falhar.
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: Delegação da lógica de remoção física ao Bean.
        // Se o ID não existir, o Bean lançará um 404 que será capturado pelo GenericExceptionMapper.
        clientsBean.permanentDeleteClient(id);

        // 3. RESPOSTA: Retorno sem corpo (204), padrão para remoções permanentes bem-sucedidas.
        return Response.noContent().build();
    }


    /**
     * Executa a remoção lógica (Soft Delete) de todos os clientes associados a um utilizador.
     * Operação restrita a Administradores para gestão de dados em massa.
     * * @param token  Token de autenticação do Administrador.
     * @param userId Identificador do utilizador cujos clientes serão desativados.
     * @return       200 OK em caso de sucesso na operação em massa.
     */
    @PATCH // Usamos PATCH porque estamos a atualizar o estado 'softDelete' de vários recursos
    @Path("/user/{userId}/status/deactivate-all")
    public Response softDeleteAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        // 1. SEGURANÇA: Valida se o requisitante tem privilégios de ADMIN.
        // O fluxo é interrompido aqui com 403 Forbidden se o utilizador for comum.
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: Delegação da atualização em massa ao Bean.
        // O Bean executará um Update direto na BD (Bulk Update) para máxima performance.
        clientsBean.softDeleteAllClientsByUser(userId);

        // 3. RESPOSTA: Retorno de sucesso sem corpo, indicando que a transação foi concluída.
        return Response.ok().build();
    }

    /**
     * Recupera a lista de clientes que sofreram remoção lógica (Soft Delete) para um utilizador específico.
     * Funcionalidade de "Lixeira" exclusiva para consulta de Administradores.
     * * @param token  Token de autenticação (Deve ser ADMIN).
     * @param userId Identificador do utilizador dono dos registos.
     * @return       Lista de ClientsDTO (pode ser vazia) com status 200 OK.
     */
    @GET
    @Path("/user/{userId}/trash") // RESTful: Sub-recurso 'trash' identifica o estado dos clientes.
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDeletedClientsByUserId(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        // 1. SEGURANÇA: O Verifier garante que apenas um Admin ativo acede a dados "apagados".
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: Consulta ao Bean para obter os registos com softDelete = true.
        // O Bean delega ao DAO uma consulta filtrada por owner_id e status.
        List<ClientsDTO> clients = clientsBean.listDeletedClientsByUser(userId);

        // 3. RESPOSTA: Retorno da coleção. Se não houver itens, devolve [] (200 OK),
        // permitindo que o Frontend React faça o mapeamento da tabela sem erros.
        return Response.ok(clients).build();
    }

    /**
     * Reverte a remoção lógica (Soft Undelete) de todos os clientes de um utilizador.
     * Recupera em massa registos que estavam na "Lixeira" (softDelete = true).
     * * @param token  Token de autenticação (Exige privilégios de ADMIN).
     * @param userId Identificador do utilizador cujos clientes serão restaurados.
     * @return       200 OK indicando a conclusão da operação.
     */
    @PATCH // PATCH é o verbo correto para atualizações parciais de estado em massa.
    @Path("/user/{userId}/status/activate-all")
    public Response restoreAllUserClients(
            @HeaderParam("token") String token,
            @PathParam("userId") Long userId) {

        // 1. SEGURANÇA: Bloqueio imediato se o requisitante não for um Administrador ativo.
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: Delegação ao Bean para reativar os registos.
        // O Bean deve invocar um Bulk Update no DAO para garantir performance (O(1) na DB).
        clientsBean.unSoftDeleteAllClientsByUser(userId);

        // 3. RESPOSTA: Retorno de sucesso. Em operações de Admin, o código 200 é suficiente.
        return Response.ok().build();
    }

    /**
     * Remove permanentemente (Hard Delete) todos os clientes de um utilizador que se encontram na lixeira.
     * Esta ação é irreversível e restrita a Administradores.
     * * @param userId Identificador do utilizador cuja lixeira será esvaziada.
     * @param token  Token de autenticação (Validação de privilégios ADMIN).
     * @return       204 No Content em caso de sucesso absoluto.
     */
    @DELETE
    @Path("/user/{userId}/trash") // RESTful: DELETE no recurso 'trash' esvazia-o.
    public Response emptyTrash(
            @PathParam("userId") Long userId,
            @HeaderParam("token") String token) {

        // 1. SEGURANÇA: O Verifier garante que apenas um Admin ativo pode executar limpezas físicas.
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: Delegação ao Bean para remoção definitiva dos registos (softDelete = true).
        // O Bean deve garantir que esta operação ocorre dentro de uma transação atómica.
        clientsBean.emptyTrash(userId);

        // 3. RESPOSTA: 204 No Content é o padrão para remoções físicas bem-sucedidas onde não há dados a devolver.
        return Response.noContent().build();
    }

    /**
     * Cria um novo cliente e atribui-o diretamente a um utilizador específico.
     * Funcionalidade exclusiva para Administradores (Gestão de Carteira).
     * * @param userId Identificador do utilizador que será o proprietário (owner) do cliente.
     * @param dto    Dados do novo cliente (Validados via @Valid).
     * @param token  Token de autenticação do Administrador.
     * @return       201 Created com o DTO do cliente recém-criado.
     */
    @POST
    @Path("/user/{userId}") // RESTful: Criação de um item na coleção de clientes do utilizador X.
    public Response createClientForUser(
            @PathParam("userId") Long userId,
            @Valid ClientsDTO dto,
            @HeaderParam("token") String token) {

        // 1. SEGURANÇA: O Verifier garante que apenas um Admin pode "injetar" clientes para outros users.
        verifier.verifyAdmin(token);

        // 2. EXECUÇÃO: O Bean processa a criação, associa o userId como owner e persiste no DAO.
        // Se o userId não existir, o Bean deve lançar uma WebApplicationException(404).
        ClientsDTO created = clientsBean.createClientForUser(userId, dto);

        // 3. RESPOSTA: 201 Created. O objeto retornado inclui o ID gerado e metadados de auditoria.
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}