package aor.paj.projecto4.bean;

import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import aor.paj.projecto4.dao.TokenDao;

import java.io.Serial;
import java.io.Serializable;

@Singleton
public class TokenCleanupBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Inject
    TokenDao tokenDao;

    // This runs every 3 hours
    @Schedule(hour = "*/3", minute = "0", second = "0", persistent = false)
    public void dailyCleanup() {
        int deleted = tokenDao.cleanUpExpiredTokens();
        System.out.println("Maintenance: Deleted " + deleted + " expired tokens.");
    }
}
