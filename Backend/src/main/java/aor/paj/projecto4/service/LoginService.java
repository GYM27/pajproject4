package aor.paj.projecto4.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.bean.LoginBean;
import aor.paj.projecto4.dto.LoginDTO;
import aor.paj.projecto4.dto.LoginResponseDTO;

@Path("/users")
public class LoginService {
    @Inject
    LoginBean loginBean;

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(LoginDTO loginDTO) {

            LoginResponseDTO loginResponseDTO= loginBean.login(loginDTO);

            if(loginResponseDTO!=null){
                return Response.ok(loginResponseDTO).build();
            }else{
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

    }

    //logout
    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("token") String token){
         //é capaz de ser overkill usar um boolean, mas mais future proof?
        if (loginBean.logout(token)) {
            return Response.noContent().build(); // 204
        } else {
            return Response.ok("Session already expired").build(); // 200
        }
    }
}
