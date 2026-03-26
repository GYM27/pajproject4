package aor.paj.projecto4.dao;

import aor.paj.projecto4.entity.UserEntity;
import jakarta.ejb.Stateless;
import aor.paj.projecto4.entity.ClientsEntity;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class ClientsDao extends AbstractDao<ClientsEntity> {

    public ClientsDao() {
        super(ClientsEntity.class);
    }

    /**
     * PESQUISA DINÂMICA
     * @param ownerId ID do proprietário (opcional para Admin)
     * @param softDelete null para ignorar, true para lixeira, false para ativos
     */
    public List<ClientsEntity> findClientsWithFilters(Long ownerId, Boolean softDelete) {
        StringBuilder sb = new StringBuilder("SELECT c FROM ClientsEntity c WHERE 1=1");

        if (ownerId != null) {
            sb.append(" AND c.owner.id = :ownerId");
        }

        if (softDelete != null) {
            sb.append(" AND c.softDelete = :softDelete");
        } else {
            sb.append(" AND c.softDelete = false"); // Comportamento padrão: apenas ativos
        }

        TypedQuery<ClientsEntity> query = em.createQuery(sb.toString(), ClientsEntity.class);

        if (ownerId != null) query.setParameter("ownerId", ownerId);
        if (softDelete != null) query.setParameter("softDelete", softDelete);

        return query.getResultList();
    }

    /**
     * ATUALIZAÇÃO EM MASSA (Substitui softDeleteAllFromUser e restoreAllFromUser)
     */
    public void bulkUpdateSoftDelete(Long userId, boolean newStatus) {
        em.createQuery("UPDATE ClientsEntity c SET c.softDelete = :newStatus WHERE c.owner.id = :userId")
                .setParameter("newStatus", newStatus)
                .setParameter("userId", userId)
                .executeUpdate();

        // Sincronização e limpeza de Cache (Crucial para refletir no React imediatamente)
        em.flush();
        em.clear();
        em.getEntityManagerFactory().getCache().evict(ClientsEntity.class);
    }

    public void hardDelete(Long id) {
        ClientsEntity client = em.find(ClientsEntity.class, id);
        if (client != null) {
            em.remove(client);
        }
    }

    /**
     * Validação de duplicados
     */
    public boolean isEmailDuplicated(String email, UserEntity owner) {
        try {
            Long count = em.createQuery(
                            "SELECT COUNT(c) FROM ClientsEntity c WHERE c.email = :email AND c.owner = :owner", Long.class)
                    .setParameter("email", email)
                    .setParameter("owner", owner)
                    .getSingleResult();
            return count > 0;
        } catch (NoResultException e) {
            return false;
        }
    }
}