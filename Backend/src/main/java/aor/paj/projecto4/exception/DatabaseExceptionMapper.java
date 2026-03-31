package aor.paj.projecto4.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Este é o meu Mapper "Detective".
 * Em vez de olhar só para a superfície, ele vai escavar dentro do erro
 * para ver se a causa real foi a base de dados a queixar-se de duplicados.
 * Assim, mesmo que o Java embrulhe o erro em 'EJBException', eu encontro-o!
 */
@Provider
public class DatabaseExceptionMapper implements ExceptionMapper<RuntimeException> {

    @Override
    public Response toResponse(RuntimeException exception) {

        // 1. Começo a escavar o erro. Vou olhar para a "causa" original.
        Throwable cause = exception;

        // 2. Vou fazer um ciclo "enquanto" para percorrer todas as camadas do erro.

        while (cause != null) {
            String message = cause.getMessage();

            // 3. Se eu encontrar estas palavras mágicas em qualquer camada do erro...
            if (message != null && (message.contains("duplicate key") || message.contains("ConstraintViolation"))) {

                // Encontrei! Crio o meu erro 409 (Conflito) para o React saber que o e-mail já existe.
                ErrorResponse error = new ErrorResponse(
                        "Conflito de dados: Este registo (ex: e-mail) já se encontra em utilização.",
                        409
                );

                return Response.status(Response.Status.CONFLICT)
                        .entity(error)
                        .type(MediaType.APPLICATION_JSON)
                        .build();
            }

            // Se não encontrei nesta camada, passo para a causa seguinte (mais profunda).
            cause = cause.getCause();
        }

        // 4. Se o ciclo acabar e eu não encontrar nada de base de dados,
        // não quero dar um erro 500 aqui. Vou deixar o erro passar
        // para que o meu 'GlobalExceptionMapper' o trate como um erro normal de servidor.
        throw exception;
    }
}