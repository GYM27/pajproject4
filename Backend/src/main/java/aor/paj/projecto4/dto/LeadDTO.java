package aor.paj.projecto4.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class LeadDTO {

    private Long id;

    //@NotNull(message = "O estado do lead é obrigatório")
    private int state = 1;

    @NotBlank(message = "O Título do lead não pode estar vazio")
    private String title;

    @NotBlank(message = "A Descrição do lead não pode estar vazio")
    private String description;

    private LocalDateTime date;


    public LeadDTO(Long id, String titulo, String descricao) {
        this.id=id;
        this.title = titulo;
        this.description = descricao;
    }

    public LeadDTO() {} // Essential for JSON-B!

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
