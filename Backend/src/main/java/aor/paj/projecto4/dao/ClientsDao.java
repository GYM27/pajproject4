package aor.paj.projecto4.dao;

import jakarta.ejb.Stateless;
import aor.paj.projecto4.entity.ClientsEntity;

import java.util.List;


@Stateless
public class ClientsDao extends AbstractDao<ClientsEntity> {


    public ClientsDao() {
        super(ClientsEntity.class);
    }


    public List<ClientsEntity> findDeletedByOwner(Long ownerId) {
        return em.createNamedQuery("ClientsEntity.findDeletedByOwner", ClientsEntity.class)
                .setParameter("ownerId", ownerId)
                .getResultList();
    }

    public List<ClientsEntity> findActiveByOwner(Long ownerId) {
        return em.createNamedQuery("ClientsEntity.findActiveByOwner", ClientsEntity.class)
                .setParameter("ownerId", ownerId)
                .getResultList();
    }

    public void hardDelete(Long id) {
        // 1. Encontra o cliente na base de dados pelo ID
        ClientsEntity client = em.find(ClientsEntity.class, id);

        // 2. Se ele existir, remove-o
        if (client != null) {
            em.remove(client);

        }
    }

    public List<ClientsEntity> findDeletedClientsByUser(Long userId) {
        return em.createQuery("SELECT c FROM ClientsEntity c WHERE c.owner.id = :userId AND c.softDelete = true", ClientsEntity.class)
                .setParameter("userId", userId)
                .getResultList();
    }
}



