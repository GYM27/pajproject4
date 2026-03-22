package aor.paj.projecto4.bean;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.ws.rs.WebApplicationException;
import aor.paj.projecto4.dao.LeadDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.LeadDTO;
import aor.paj.projecto4.entity.LeadEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.LeadState;
import java.io.Serial;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class LeadsBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @Inject
    LeadDao leadDao;
    @Inject
    TokenBean tokenBean;
    @Inject
    UserDao userDao;
    @PersistenceContext(unitName = "project3PU")
    private EntityManager em;



    // HELPERS -------------------------------------------------------------

    // Entity -> DTO
    public LeadDTO entityToDTO(LeadEntity entity) {
        if (entity == null) return null;
        LeadDTO dto = new LeadDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitulo());
        dto.setDescription(entity.getDescricao());
        dto.setState(entity.getLeadState().getStateId()); // Envia 1, 2, 3...
        dto.setDate(entity.getData());
        return dto;
    }

    // DTO -> Entity (Para criar novos registos)
    //Utiliza o Enum validado pelo DTO para garantir a integridade.
    private LeadEntity DTOToEntity(LeadDTO dto, UserEntity owner) {
        LeadEntity entity = new LeadEntity();
        entity.setTitulo(dto.getTitle());
        entity.setDescricao(dto.getDescription());
        entity.setLeadState(dto.getStateEnum());
        entity.setOwner(owner);
        entity.setSoftDelete(false);
        return entity;
    }

    /**
     * Helper para converter listas de entidades para DTOs.
     */
    private List<LeadDTO> toDTOList(List<LeadEntity> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    // ------------------------------------------

    // FUNCIONALIDADES DE USER
    /**
     * Adicionar Lead
     * devolvemos o DTO criado
     */
    public LeadDTO addLead(String token, LeadDTO dto) {
        // 1. Obtemos o dono através do token
        UserEntity owner = tokenBean.getUserEntityByToken(token);

        // 2. Criamos a entidade usando o Helper DTOtoEntity
        // Este helper já define o owner e o estado inicial validado
        LeadEntity newLead = DTOToEntity(dto, owner);

        // 3. Persistimos na Base de Dados
        // Se algo falhar aqui (ex: erro de ligação), a exceção sobe para o Mapper
        em.persist(newLead);
        em.flush(); // <--- OBRIGA o Hibernate a gerar a @CreationTimestamp AGORA

        // 4. Devolvemos o DTO preenchido (agora com o ID gerado pela BD)
        return entityToDTO(newLead);
    }


    /**
     * Procura todas as leads do utilizador autenticado.
     * O Bean resolve o Token e o DAO trata da Query.
     */
    public List<LeadDTO> getLeadsByToken(String token) {
        // 1. O Bean resolve o utilizador através do token
        UserEntity user = tokenBean.getUserEntityByToken(token);

        // 2. Chamamos o método eficiente do DAO usando apenas o ID
        List<LeadEntity> entities = leadDao.getLeadsByUserId(user.getId());

        // 3. Transformação moderna para DTO (sem necessidade de check null, o DAO devolve [] se vazio)
        return entities.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }


    /**
     * Procura uma Lead pelo ID e converte para DTO.
     * A segurança já foi validada pelo Verifier no Service.
     */
    public LeadDTO getLeadById(Long leadId) {
        // 1. Pedimos ao DAO para encontrar a entidade
        LeadEntity entity = leadDao.getLeadByLeadID(leadId);

        // 2. Convertemos para DTO
        return entityToDTO(entity);
    }

        /**
        * U5 e U6 Atualiza os dados de uma Lead.
        * A segurança (token, user ativo e posse) já foi garantida pelo Verifier no Service.
        */
    public LeadDTO editLead(Long leadId, LeadDTO dto) {
        // LeadDAO procura a Lead. Como o Verifier já correu,
        // temos a certeza absoluta que ela existe e pertence ao utilizador.
        LeadEntity lead = leadDao.getLeadByLeadID(leadId);

        // 2. Atualizamos os campos com os dados validados do DTO
        lead.setTitulo(dto.getTitle());
        lead.setDescricao(dto.getDescription());
        lead.setLeadState(dto.getStateEnum());

        // 3. O JPA deteta as alterações nos setters e fará o UPDATE no fim da transação.
        // Retornamos o DTO atualizado para o React confirmar a mudança no ecrã.
        return entityToDTO(lead);
    }

    /**
     * Marca a Lead como eliminada para que não apareça nas listagens do Dashboard.
     */
    public void softDeleteLead(Long leadId) {
        // 1. Em vez de em.find, usamos o DAO para manter o padrão Repository
        LeadEntity lead = leadDao.getLeadByLeadID(leadId);

        // 2. Efetuamos o Soft Delete (Apenas alteramos o estado do boolean)
        if (lead != null) {
            lead.setSoftDelete(true);
        }
    }



    //---------------- FUNCIONALIDADES DE ADMIN ----------------------------------------
    public List<LeadDTO> getLeadsWithFilters(Integer stateId, Long userId, Boolean softDeleted) {
        // 1. O Bean já não constrói a Query. Ele pede ao DAO.
        List<LeadEntity> entities = leadDao.findLeadsWithFilters(stateId, userId, softDeleted);

        // 2. Transforma em DTO e devolve
        return toDTOList(entities);
    }


    /**
     * Super Put Admin: Permite ao Administrador editar qualquer campo de uma Lead,
     * incluindo o seu estado de Soft Delete (Undelete).
     */
    public LeadDTO adminSuperEdit(Long leadId, LeadDTO dto) {
        // 1. Verificação de segurança básica
        if (dto == null) throw new WebApplicationException("Dados de edição inválidos", 400);

        // 2. Delegação ao DAO (Arquitetura Repository)
        LeadEntity lead = leadDao.getLeadByLeadID(leadId);

        // 3. Validação de existência (Fail-fast)
        if (lead == null) throw new WebApplicationException("Lead não encontrada", 404);

        // 4. Atualização Seletiva (O Admin só muda o que envia)
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            lead.setTitulo(dto.getTitle());
        }

        if (dto.getDescription() != null) {
            lead.setDescricao(dto.getDescription());
        }

        if (dto.getState() > 0) {
            // Validação interna já tratada pelo getStateEnum()
            lead.setLeadState(dto.getStateEnum());
        }

        // Permite ao Admin recuperar leads (Undelete)
        // Aqui assumimos que o DTO traz o estado desejado do softDelete
        lead.setSoftDelete(dto.isSoftDelete());

        // 6. Conversão consistente para o Frontend
        return entityToDTO(lead);
    }

    public LeadDTO addLeadToUser(Long userId, LeadDTO dto) {
        // 1. Delegar a procura do utilizador ao UserDao (Injetar o UserDao no topo do Bean)
        UserEntity owner = userDao.findUserById(userId);

        // 2. Validação de segurança (Negócio)
        if (owner == null || owner.isSoftDelete()) {
            throw new WebApplicationException("Utilizador destino não encontrado ou inativo", 404);
        }

        // 3. Criar a nova entidade com o dono específico
        LeadEntity newLead = DTOToEntity(dto, owner);

        // 4. Persistência
        em.persist(newLead);
        em.flush(); // Garante a geração do ID e Data para o retorno

        return entityToDTO(newLead);
    }

    /**
     * Remove fisicamente o registo da lead da base de dados.
     */
    public void hardDeleteLead(Long leadId) {
        // 1. Procurar via DAO para respeitar as camadas
        LeadEntity lead = leadDao.getLeadByLeadID(leadId);

        // 2. Validação de existência (Fail-fast)
        if (lead == null) {
            throw new WebApplicationException("Lead não encontrada para remoção.", 404);
        }

        // 3. Remoção delegada ao DAO (podes usar o remove herdado do AbstractDao)
        leadDao.remove(lead);
    }
    /**
     * Altera o estado de softDelete para true em todas as leads de um utilizador específico.
     * @return O número de registos que foram alterados.
     */
    public int softDeleteAllFromUser(Long userId) {
        // Validação básica continua aqui
        if (em.find(UserEntity.class, userId) == null) throw new WebApplicationException("User not found", 404);

        // Chama o DAO (que agora tem o UPDATE eficiente)
        return leadDao.bulkUpdateSoftDelete(userId, true);
    }

    /**
     * Recupera todas as leads de um utilizador (Undelete em massa).
     * @return O número de leads que foram trazidas de volta da lixeira.
     */
    public int undeleteAllFromUser(Long userId) {
        if (em.find(UserEntity.class, userId) == null) throw new WebApplicationException("User not found", 404);

        return leadDao.bulkUpdateSoftDelete(userId, false);
    }

}
