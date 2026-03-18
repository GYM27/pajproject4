package aor.paj.projecto4.dao;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import aor.paj.projecto4.entity.LeadEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.LeadState;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Stateless
public class LeadDao extends AbstractDao<LeadEntity> implements Serializable {
    @Inject UserDao userDao;

    @Serial
    private static final long serialVersionUID = 1L;

    public LeadDao() {
        // We pass UserEntity.class to the AbstractDao constructor
        super(LeadEntity.class);
    }

    public List<LeadEntity> getLeadsByUserId(Long id) {
        try {
            return em.createNamedQuery("lead.findLeadsByUserId", LeadEntity.class)
                    .setParameter("id", id)
                    .getResultList(); // This is the correct method for lists
        } catch (Exception e) {

            return null;
        }
    }

    //*******************new method
    public List<LeadEntity> getLeadsByToken(String token) {
        UserEntity userEntity=userDao.findUserByToken(token);

        //check to see if the user exists
        if(userEntity==null){
            return null;
        }

        //check to see if the user is softDeleted
        if(userEntity.isSoftDelete()){
            return null;
        }

        Long id= userEntity.getId();
        try {
            return em.createNamedQuery("lead.findLeadsByUserId", LeadEntity.class)
                    .setParameter("id", id)
                    .getResultList(); // This is the correct method for lists
        } catch (Exception e) {

            return null;
        }
    }

    public List<LeadEntity> getUserSoftDelLeads(Long userId){
        try {
            return em.createNamedQuery("lead.findSoftDelUserLeads", LeadEntity.class)
                    .setParameter("id", userId)
                    .getResultList(); // This is the correct method for lists
        } catch (Exception e) {

            return null;
        }
    }

    public LeadEntity getLeadByUserIdLeadId(Long resourceId, Long leadId){
        try{
            return em.createNamedQuery("lead.findLeadsByUserIdLeadId", LeadEntity.class)
                    .setParameter("resourceId", resourceId)
                    .setParameter("leadId", leadId)
                    .getSingleResult();

        }catch (Exception e){
            return null;
        }
    }

    public LeadEntity getLeadByLeadID(Long leadId){
        //todo verificar null do leadID, fazer o mesmo em todos os métodos deste dao
        try{
            return em.createNamedQuery("lead.findLeadByLeadID", LeadEntity.class)
                    .setParameter("leadId", leadId)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }

    }

    public boolean hardDelete(Long id) {
        LeadEntity leadEntity = em.find(LeadEntity.class, id);
        if (leadEntity != null) {
            em.remove(leadEntity);
            return true;
        }
        return false;
    }

    public boolean softDelete(Long id){
        LeadEntity leadEntity = em.find(LeadEntity.class, id);
        if (leadEntity != null) {
            if(!leadEntity.isSoftDelete()){
                leadEntity.setSoftDelete(true);
                return true;
            }
        }
        return false;
    }

    public boolean softUnDelete(Long id){
        LeadEntity leadEntity = em.find(LeadEntity.class, id);
        if (leadEntity != null) {
            if(leadEntity.isSoftDelete()){
                leadEntity.setSoftDelete(false);
                return true;
            }
        }
        return false;
    }

    public boolean softDelALlUserLeads(String token){
        if(token!=null){
            UserEntity userEntity=userDao.findUserByToken(token);
            for(LeadEntity l : userEntity.getLeads()){
                if(!l.isSoftDelete()){
                    l.setSoftDelete(true);

                }
            }

            return true;
        }
        return false;
    }


    public boolean softDelALlUserLeadsAdmin(Long id){
        //primeiro ver se o id está null e se sim morre já
        if(id==null) return false;
        //ir buscar o utilizador em questão
        UserEntity userEntity=userDao.find(id);
        //se não o encontramos morre já
        if(userEntity==null) return false;
        //se o encontramos fazemos softDelete de todas as suas leads;
        for(LeadEntity l : userEntity.getLeads()){
            if(!l.isSoftDelete()){
                l.setSoftDelete(true);
            }
        }
        //se chegamos aqui correu tudo bem
        return true;
    }

    public boolean softUnDelALlUserLeads(String token){
        if(token!=null){
            UserEntity userEntity=userDao.findUserByToken(token);
            for(LeadEntity l : userEntity.getLeads()){
                if(l.isSoftDelete()){
                    l.setSoftDelete(false);

                }
            }
            return true;
        };
        return false;
    }

    public boolean softUnDelALlUserLeadsAdmin(Long id){
        //primeiro ver se o id está null e se sim morre já
        if(id==null) return false;
        //ir buscar o utilizador em questão
        UserEntity userEntity=userDao.find(id);
        //se não o encontramos morre já
        if(userEntity==null) return false;
        //se o encontramos fazemos softDelete de todas as suas leads;
        for(LeadEntity l : userEntity.getLeads()){
            if(l.isSoftDelete()){
                l.setSoftDelete(false);
            }
        }
        return true;
    }


    public List<LeadEntity> getLeadsByState(LeadState leadState){
        try{
            return em.createNamedQuery("lead.findLeadByState", LeadEntity.class)
                    .setParameter("leadState", leadState)
                    .getResultList();
        } catch (Exception e) {
            return null;
        }
    }


}
