package aor.paj.projecto4.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GenericExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Override
    public Response toResponse(WebApplicationException exception) {
        // 1. Descobrimos qual é o código de erro (401, 403, 404, etc)
        int status = exception.getResponse().getStatus();

        // 2. Criamos o nosso objeto de erro com a mensagem que vinha na exceção
        ErrorResponse error = new ErrorResponse(
                exception.getMessage(),
                status
        );

        // 3. Devolvemos o JSON bonitinho para o React
        return Response.status(status)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}