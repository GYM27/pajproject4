package aor.paj.projecto4.dto;

import jakarta.validation.constraints.NotBlank;

public class UserDTO extends UserBaseDTO{
    @NotBlank(message = "O username não pode estar vazio")
    private String username;
    @NotBlank(message = "A password não pode estar vazia")
    private String password;

    public UserDTO() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
