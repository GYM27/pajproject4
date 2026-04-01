package aor.paj.projecto4.dao;

import java.util.List;

import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;
import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;

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
    public int bulkUpdateSoftDelete(Long userId, boolean newStatus) {
      return  em.createQuery("UPDATE ClientsEntity c SET c.softDelete = :newStatus WHERE c.owner.id = :userId")
                .setParameter("newStatus", newStatus)
                .setParameter("userId", userId)
                .executeUpdate();


    }

    /**
     * BULK DELETE: Esvazia a lixeira numa única query (Resolve o N+1)
     * @param userId ID do proprietário
     */
    public int emptyTrashByUserId(Long userId) {
        Query query = em.createQuery(
                "DELETE FROM ClientsEntity c WHERE c.owner.id = :userId AND c.softDelete = true"
        );
        query.setParameter("userId", userId);
        return query.executeUpdate();
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