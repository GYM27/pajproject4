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


    public List<ClientsEntity> findDeletedByOwner(Long ownerId) {
        return em.createNamedQuery("ClientsEntity.findDeletedByOwner", ClientsEntity.class)
                .setParameter("ownerId", ownerId)
                .getResultList();
    }

    public List<ClientsEntity> findActiveByOwner(UserEntity owner) {
        return em.createNamedQuery("ClientsEntity.findActiveByOwner", ClientsEntity.class)
                .setParameter("owner", owner)
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


    public List<ClientsEntity> findActiveWithOptionalFilter(Long ownerId) {
        // 1. Definição da Query Base
        // Começamos com a base que todos os resultados devem ter: não estar na lixeira.
        String jpql = "SELECT c FROM ClientsEntity c WHERE c.softDelete = false";

        // 2. Construção Dinâmica
        // Se o ownerId não for nulo, "colamos" um filtro extra à String da query.
        // Se for nulo (ex: Admin a ver tudo), a query permanece a original.
        if (ownerId != null) {
            jpql += " AND c.owner.id = :ownerId";
        }

        // 3. Criação da Query tipada
        TypedQuery<ClientsEntity> query = em.createQuery(jpql, ClientsEntity.class);

        // 4. Atribuição de Parâmetros Segura
        // Só tentamos preencher o parâmetro ":ownerId" se ele realmente existir na String acima.
        // Usar setParameter previne ataques de SQL Injection.
        if (ownerId != null) {
            query.setParameter("ownerId", ownerId);
        }

        // 5. Execução
        return query.getResultList();
    }


    // --- VALIDAÇÕES DE NEGÓCIO ---

    /**
     * Verifica se um email já existe para um determinado dono.
     * Importante para evitar duplicados na carteira de um utilizador.
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



