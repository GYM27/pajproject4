package aor.paj.projecto4.dao;

import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import aor.paj.projecto4.entity.TokenEntity;
import aor.paj.projecto4.entity.UserEntity;

import java.io.Serial;
import java.time.LocalDateTime;

@Stateless
public class TokenDao extends AbstractDao<TokenEntity>{
    @Serial
    private static final long serialVersionUID = 1L;

    public TokenDao() {
        // We pass UserEntity.class to the AbstractDao constructor
        super(TokenEntity.class);
    }

    public int invalidateToken(String tokenValue){
        return em.createNamedQuery("token.invalidate")
                .setParameter("tokenValue", tokenValue)
                .executeUpdate();
    }

    public int cleanUpExpiredTokens(){
        return em.createNamedQuery("token.cleanExpired")
                .setParameter("now", LocalDateTime.now())
                .executeUpdate();
    }

    public TokenEntity findToken(String tokenValue){

        return em.createNamedQuery("token.findToken", TokenEntity.class)
                .setParameter("tokenValue", tokenValue)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public Long findUserIdByToken(String tokenValue){
        try{
            return em.createNamedQuery("token.returnUserID", Long.class)
                    .setParameter("tokenValue",tokenValue)
                    .getSingleResult();
        }catch (NoResultException e){
            return null;
        }
    }

    public UserEntity findUserEntityByToken(String tokenValue){
        try{
            return em.createNamedQuery("token.returnUserEntity", UserEntity.class)
                    .setParameter("tokenValue",tokenValue)
                    .getSingleResult();
        }catch (NoResultException e){
            return null;
        }
    }
}
