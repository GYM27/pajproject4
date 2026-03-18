package aor.paj.projecto4.dto;

import aor.paj.projecto4.utils.UserRoles;

public class LoginResponseDTO {
    private Long id;
    private String firstName;
    private UserRoles userRole;
    private String token;

    public LoginResponseDTO(Long id, String firstName, UserRoles userRole, String token) {
        this.id = id;
        this.firstName = firstName;
        this.userRole = userRole;
        this.token = token;
    }

    public LoginResponseDTO(){}

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public UserRoles getUserRole() {
        return userRole;
    }

    public String getToken() {
        return token;
    }
}
