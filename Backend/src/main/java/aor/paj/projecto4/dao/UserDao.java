package aor.paj.projecto4.dao;

import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import aor.paj.projecto4.entity.LeadEntity;
import aor.paj.projecto4.entity.TokenEntity;
import aor.paj.projecto4.entity.UserEntity;

import java.io.Serial;
import java.io.Serializable;

@Stateless
public class UserDao extends AbstractDao<UserEntity> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public UserDao() {
        // We pass UserEntity.class to the AbstractDao constructor
        super(UserEntity.class);
    }

    //ir buscar um user por token usando Criteria API

    /**
     * Ir buscar um user por token usando Criteria API
     * @param tokenValue
     * @return UserEntity
     */
    public UserEntity findUserByToken(String tokenValue){

        CriteriaBuilder cb= em.getCriteriaBuilder();

        // 1. We want a User, but we are searching through Tokens
        CriteriaQuery query= cb.createQuery(UserEntity.class);
        Root<TokenEntity> tokenRoot=query.from(TokenEntity.class);

        // 2. Define the path: Token -> Owner (the User)
        query.select(tokenRoot.get("owner"));

        // 3. Define the conditions (Predicates)
        Predicate equalToken = cb.equal(tokenRoot.get("tokenValue"), tokenValue);
        Predicate isActive = cb.equal(tokenRoot.get("active"), true);

        // 4. Combine and Execute
        query.where(cb.and(equalToken, isActive));

        try {
            return (UserEntity) em.createQuery(query).getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public UserEntity findUserByUsername(String username){
        try{
            return (UserEntity) em.createNamedQuery("User.findUserByUsername")
                    .setParameter("username",username)
                    .getSingleResult();

        }catch(NoResultException e){
            return null;
        }
    }

    public UserEntity findUserByEmail(String email) {
        try {
            return (UserEntity) em.createNamedQuery("User.findUserByEmail").setParameter("email", email)
                    .getSingleResult();

        } catch (NoResultException e) {
            return null;
        }
    }

    public UserEntity findUserByContact(String contact){
        try{
            return (UserEntity) em.createNamedQuery("User.findUserByContact").setParameter("contact",contact).getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public boolean hardDelete(Long id) {
        UserEntity userEntity = em.find(UserEntity.class, id);
        if (userEntity != null) {
            for (LeadEntity l : userEntity.getLeads()){
                l.setOwner(null);
            }
              // adicionar este passo para eliminar o user mas manter os dados
//            // 2. Desvincular todos os Clientes (Deixá-los órfãos)
//            for (ClientsEntity c : userEntity.getClients()) {
//                c.setOwner(null);
//            }
            //todo temos que fazer o mesmo para os clientes
            em.remove(userEntity);
            return true;
        }
        return false;
    }

    public UserEntity findUserById(Long id) {
        try {
            return em.find(UserEntity.class, id);
        } catch (Exception e) {
            return null;
        }
    }

}
