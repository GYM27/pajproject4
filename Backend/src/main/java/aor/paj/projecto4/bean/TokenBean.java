package aor.paj.projecto4.bean;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import aor.paj.projecto4.dao.TokenDao;
import aor.paj.projecto4.entity.TokenEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Stateless
public class TokenBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Inject
    TokenDao tokenDao;

    public String generateNewToken(UserEntity owner){
        String randomValue = UUID.randomUUID().toString();
        TokenEntity newToken = new TokenEntity();
        newToken.setTokenValue(randomValue);
        newToken.setOwner(owner);
        tokenDao.persist(newToken);
        return randomValue;
    }

    public boolean invalidateToken(String token){
        //se o token foi invalidado pelo menos uma linha foi alterada
        int result = tokenDao.invalidateToken(token);
        return result > 0;
    }

    /**
     * Verifica se um token existe, está ativo e se não devia ter já expirado
     * @param tokenValue o token que estamos a tentar validar
     * @return true se todas as condições são cumpridas, false se falha qualquer uma delas
     */
    public boolean isTokenValid(String tokenValue) {
        TokenEntity token = tokenDao.findToken(tokenValue);

        //primeiro verificar se não existe ou se não está ativo
        if (token == null || !token.isActive()) {
            return false;
        }

        //depois verificar se já devia ter expirado
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            // Optional: Invalidate it now so it's "dead" immediately
            invalidateToken(tokenValue);
            return false;
        }

        return true;
    }

    public Long getUserIdByToken(String token) {
        // 1. Check if token is valid first (expiry, etc.)
        if (!isTokenValid(token)) {
            return null;
        }
        // 2. Ask the Dao for the owner's ID
        return tokenDao.findUserIdByToken(token);
    }

    public UserEntity getUserEntityByToken(String token){
        // 1. Check if token is valid first (expiry, etc.)
        if (!isTokenValid(token)) {
            return null;
        }

        return tokenDao.findUserEntityByToken(token);
    }

    public UserRoles getUserRoleByToken(String token){
        UserEntity userEntity=getUserEntityByToken(token);
        if(userEntity!=null){
            return userEntity.getUserRole();
        }
        return null;
    }

    public boolean getUserSoftDelete(String token){
        UserEntity userEntity=getUserEntityByToken(token);
        if(userEntity!=null){
            return userEntity.isSoftDelete();
        }
        return true;
    }




}
