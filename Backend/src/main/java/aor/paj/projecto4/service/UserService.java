package aor.paj.projecto4.service;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.bean.LoginBean;
import aor.paj.projecto4.bean.UsersBean;
//import pt.uc.dei.proj3.dto.RegisterDTO;
import aor.paj.projecto4.dto.UserBaseDTO;
import aor.paj.projecto4.dto.UserDTO;

import java.util.List;


@Path("/users")
public class UserService {

    @Inject
    UsersBean usersBean;

    @Inject
    private LoginBean loginBean;
    @Inject
    UserVerificationBean verifier;


    /**
     * Devolve o json UserBaseDTO correspondente a um utilizador identificado por id
     * @param token      token to utilizador
     * @return json do UserBaseDTO ou mensagem de erro
     */
    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(
            @HeaderParam("token") String token) {

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        UserDTO u = usersBean.getUserDTOByToken(token);
        if (u == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(u).build();
    }

    /**
     * Regista um novo utilizador
     *
     * @param user
     * @return Json do novo user, mensagem de sucesso ou erro
     */
    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerUser(@Valid UserDTO user) {
        boolean created = usersBean.registerUser(user);
        if (created) {
            return Response.status(Response.Status.CREATED).build();//201
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Username already exists or invalid data")
                    .build(); //400
        }
    }

    /**
     * Edita um utilizador através de um put. De momento ignora leads,projetos, clients
     * @param token       do user a editar
     * @param userDTO o DTO com as novas informações do user
     * @return json do editDTO, mensagem de sucesso ou de erro
     */
    @PUT
    @Path("/me")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    /*public Response patchEditUser(
            //@PathParam("id") Long resourceId,
            @HeaderParam("token") String token,
            @Valid UserBaseDTO userBaseDTO) {

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        boolean success = usersBean.putEditUser(token, userBaseDTO);

        if (success) {
            return Response.ok(userBaseDTO).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Erro ao atualizar o perfil.")
                    .build();
        }
    }*/

    public Response putEditUser(
            //@PathParam("id") Long resourceId,
            @HeaderParam("token") String token,
            @Valid UserDTO userDTO) {

        //validar o utilizador
        verifier.verifyUser(token);

        //funcionalidade
        boolean success = usersBean.putEditOwnUser(token, userDTO);

        if (success) {
            return Response.ok(userDTO).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Erro ao atualizar o perfil.")
                    .build();
        }
    }

    //*********************************************Admin Section***************************************

    /**
     * Desativa(softdeletes) um utilizador só pode ser feito pelo admin
     *
     * @param resourceId o id do user a inativar
     * @param token      o token do administrador
     * @return a resposta da ação
     */
    @POST
    @Path("/admin/{id}/softdelete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response deactivateUser(
            @PathParam("id") Long resourceId,
            @HeaderParam("token") String token
    ) {
        //verificar se o utilizador é válide e é um admin
        verifier.verifyAdmin(token);
        boolean sucess = usersBean.softDeleteUser(resourceId);
        if (sucess) {
            return Response.ok("Utilizador desativado.").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    /**
     * Reativa(softUndeletes) um utilizador só pode ser feito pelo admin
     * @param resourceId o id do user a reativar
     * @param token      o token do administrador
     * @return a resposta da ação
     */
    @POST
    @Path("/admin/{id}/softundelete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reActivateUser(
            @PathParam("id") Long resourceId,
            @HeaderParam("token") String token
    ) {
        //verificar se o utilizador é válide e é um admin
        verifier.verifyAdmin(token);
        boolean sucess = usersBean.softUnDeleteUser(resourceId);
        if (sucess) {
            return Response.ok("Utilizador reativado.").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    /**
     * Apaga permanentemente um utilizador só pode ser feito pelo admin
     * @param resourceId o id do user a apagar permanentemente
     * @param token      o token do administrador
     * @return a resposta da ação
     */
    @DELETE
    @Path("/admin/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUser(
            @PathParam("id") Long resourceId,
            @HeaderParam("token") String token
    ) {
        //verificar se o utilizador é válido e é um admin
        verifier.verifyAdmin(token);

        boolean sucess = usersBean.deleteUser(resourceId);
        if (sucess) {
            return Response.ok("Utilizador apagado.").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    /**
     * Devolve o DTO de um utilizador ao administrador
     * @param token o token do admin
     * @return o json de DTOs dos users
     */
    @GET
    @Path("/admin/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(
            @PathParam("id") Long resourceId,
            @HeaderParam("token") String token
    ) {
        //verificar se o utilizador é válido e é um admin
        verifier.verifyAdmin(token);

        //funcionalidade
        UserBaseDTO u = usersBean.getUserBaseDTOById(resourceId);

        //resposta
        if (u == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(u).build();

    }

    /**
     * Devolve o DTO de todos os utilizadores ao administrador
     * @param token o token do admin
     * @return o json de DTOs dos users
     */
    @GET
    @Path("/admin")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllUsers(
            @HeaderParam("token") String token
    ) {
        //verificar se o utilizador é válido e é um admin
        verifier.verifyAdmin(token);
        //devolver os utilizadores
        List<UserBaseDTO> users = usersBean.getAllUsersButAdmin(token);
        if (users == null) {
            return Response.serverError().entity("Erro ao aceder à base de dados").build();
        }
        return Response.ok(users).build();
    }


    @PUT
    @Path("/admin/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response adminPutEditUser(
            @PathParam("id") Long resourceId,
            @HeaderParam("token") String token,
            @Valid UserBaseDTO userBaseDTO) {

        //validar o utilizador
        verifier.verifyAdmin(token);

        //funcionalidade
        boolean success = usersBean.putEditUser(resourceId, userBaseDTO);

        if (success) {
            return Response.ok(userBaseDTO).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Erro ao atualizar o perfil.")
                    .build();
        }
    }

}