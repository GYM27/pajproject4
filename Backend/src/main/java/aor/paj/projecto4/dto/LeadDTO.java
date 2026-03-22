package aor.paj.projecto4.dto;

import aor.paj.projecto4.utils.LeadState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.json.bind.annotation.JsonbTransient;

import java.time.LocalDateTime;

public class LeadDTO {

    private Long id;

    @NotNull(message = "O estado da lead é obrigatório")
    private LeadState state = LeadState.NOVO;

    @NotBlank(message = "O Título do lead não pode estar vazio")
    private String title;

    @NotBlank(message = "A Descrição da lead não pode estar vazio")
    private String description;

    private LocalDateTime date;
    private boolean softDelete;

    public LeadDTO(Long id, String titulo, String descricao) {
        this.id = id;
        this.title = titulo;
        this.description = descricao;
    }

    public LeadDTO() {
    } // Essential for JSON-B!

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
        return state.getStateId();
    }

    public void setState(int stateId) {
        this.state = LeadState.fromId(stateId);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSoftDelete() {
        return softDelete;
    }

    public void setSoftDelete(boolean softDelete) {
        this.softDelete = softDelete;
    }

    public void setState(LeadState state) {
        this.state = state;
    }

    // Invisível no JSON, mas usado pelo Bean para gravar na BD
    @JsonbTransient
    public LeadState getStateEnum() {
        return this.state;
    }
}