package aor.paj.projecto4.bean;

import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Inject;
import aor.paj.projecto4.dto.LoginDTO;
import aor.paj.projecto4.dto.LoginResponseDTO;

import java.io.Serial;
import java.io.Serializable;

@SessionScoped
public class LoginBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    //because we are gonna need all of that juicy information
    @Inject UsersBean usersBean;
    @Inject TokenBean tokenBean;
    private LoginResponseDTO loggedUser; //the user that is currently logged in
    //empty constructor because you need it, for reasons.... magic stuff
    public LoginBean(){}

    /**
     * Valida o utilizador que está a tentar fazer login
     * @param loginDTO dto que recebemos do front end com username e password
     * @return um LoginResponseDTO se o user é autenticado, null se falhar
     */
    public LoginResponseDTO login(LoginDTO loginDTO){
        this.loggedUser=usersBean.authenticateUser(loginDTO);
        return loggedUser;
    }

    //not sure if needed mas fica cá
    public boolean isLoggedIn() {
        return loggedUser != null;
    }

    /**
     * Faz logout do utilizador, invalida o token
     * @param token o valor do token do user
     * @return true se bem-sucedido, false se falha
     */
    //todo invalidar o token qd o user faz logout
    public boolean logout(String token){
        if(tokenBean.invalidateToken(token)){
            this.loggedUser=null;
            return true;
        }
        return false;
    }

    public LoginResponseDTO getLoggedUser() {
        return loggedUser;
    }
}
