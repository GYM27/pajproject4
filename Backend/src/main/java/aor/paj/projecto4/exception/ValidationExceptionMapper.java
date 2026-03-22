package aor.paj.projecto4.exception;


import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.stream.Collectors;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        // 1. Extraímos todas as mensagens de erro das anotações (ex: "Email inválido")
        // e juntamo-las numa única String separada por vírgulas.
        String errorMessage = exception.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));

        // 2. Usamos o nosso ErrorResponse para manter o padrão
        ErrorResponse error = new ErrorResponse(
                "Erro de validação: " + errorMessage,
                400 // Bad Request
        );

        // 3. Devolvemos o erro 400 ao Frontend
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}