package aor.paj.projecto4.bean;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.dao.LeadDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.LeadDTO;
import aor.paj.projecto4.entity.LeadEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.LeadState;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;

@Stateless
public class LeadsBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @Inject
    LeadDao leadDao;
    @Inject
    UserDao userDao;

    /**
     * Construtor vazio
     */
    public LeadsBean(){}

    /**
     * Construtor necessário para os testes unitários
     * @param leadDao o Dao de acesso aos leads
     * @param userDao o Dao de acesso aos users
     */
    public LeadsBean(LeadDao leadDao, UserDao userDao) {
        this.leadDao = leadDao;
        this.userDao = userDao;
    }


    /**
     * Devolve a lista de leadDTOs de um utilizador
     * @param userId o id do utilizador
     * @return arrayList de DTOs desse utilizador
     */
    public ArrayList<LeadDTO> getLeadDTOsByUserId(Long userId){
        if(userId!=null){

            ArrayList<LeadEntity> leadEntities= (ArrayList<LeadEntity>) leadDao.getLeadsByUserId(userId);
            if(leadEntities==null) return null;

            ArrayList<LeadDTO> leadDTOS=new ArrayList<>();
            for(LeadEntity l:leadEntities){
                if(l!=null){
                    leadDTOS.add(convertLeadEntityToDTO(l));
                }
            }
            return leadDTOS;
        }
        return null;
    }


    /**
     * Devolve um arrayList de DTOs dos leads do utilizador
     * @param token o token de acesso do utilizador
     * @return arrayList de DTOs dos leads do utilizador
     */
    public ArrayList<LeadDTO> getLeadDTOsByToken(String token){
        if(token!=null){

            ArrayList<LeadEntity> leadEntities= (ArrayList<LeadEntity>) leadDao.getLeadsByToken(token);
            if(leadEntities==null) return null;
            ArrayList<LeadDTO> leads=new ArrayList<>();
            for(LeadEntity l:leadEntities){
                if(l!=null){
                    leads.add(convertLeadEntityToDTO(l));
                }
            }
            return leads;
        }
        return null;
    }


    /**
     * Devolve arrayList de leads com softDelete do utilizador
     * @param userId o idd do utilizador
     * @return arrayList de leads com softDelete
     */
    public ArrayList<LeadDTO> getSoftDelLeadsByUserId(Long userId){
        if(userId!=null){
            ArrayList<LeadEntity> leadEntities= (ArrayList<LeadEntity>) leadDao.getUserSoftDelLeads(userId);
            ArrayList<LeadDTO> result=new ArrayList<>();
            if(leadEntities!=null&&!leadEntities.isEmpty()){
                for(LeadEntity l : leadEntities){
                    result.add(convertLeadEntityToDTO(l));
                }
                return result;
            }
        }
        return null;
    }

    /*public Lead convertLeadEntityToPojo(LeadEntity leadEntity){
        if(leadEntity!=null){
            Lead lead=new Lead();
            lead.setId(leadEntity.getId());
            lead.setTitulo(leadEntity.getTitulo());
            lead.setDescricao(leadEntity.getDescricao());
            lead.setEstado(leadEntity.getLeadState());
            lead.setData(leadEntity.getData());
            return lead;
        }
        return null;
    }*/


    /**
     * Converte uma LeadEntity no seu DTO
     * @param leadEntity a leadEntity
     * @return o seu DTO
     */
    public LeadDTO convertLeadEntityToDTO(LeadEntity leadEntity){
        if(leadEntity!=null){
            LeadDTO leadDTO=new LeadDTO();
            leadDTO.setId(leadEntity.getId());
            leadDTO.setTitle(leadEntity.getTitulo());
            leadDTO.setDescription(leadEntity.getDescricao());
            leadDTO.setState(leadEntity.getLeadState().getStateId());
            leadDTO.setDate(leadEntity.getData());
            return leadDTO;
        }
        return null;

    }


    /**
     * Devolve um leadDTO correspondente a um lead específico de um utilizador específico
     * @param token o token de acesso do utilizador
     * @param leadId o id do lead a devolver
     * @return o dto do lead
     */
    public LeadDTO getLeadDTOByTokenLeadId(String token, Long leadId){
        UserEntity userEntity=userDao.findUserByToken(token);
        //check if user is empty
        if(userEntity==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("Invalid Token").build());
        }
        //check if user is softDeleted
        if(userEntity.isSoftDelete()){
            return null;
        }
        Long userId=userEntity.getId();
        //just get the lead by id and then check if leadownerid=userid
        LeadEntity leadEntity=leadDao.getLeadByLeadID(leadId);
        if(leadEntity!=null&&leadEntity.getOwner().getId().equals(userId)){
            return convertLeadEntityToDTO(leadEntity);
        }

        return null;

    }


    /**
     * Adiciona um lead ao utilizador
     * @param token o token de identificação do utilizador
     * @param leadDTO o DTO do novo lead
     * @return true se bem sucedido, falso caso contrário
     */
    public boolean addLeadDTOToUser(String token, LeadDTO leadDTO){
        //go get the user
        UserEntity u= userDao.findUserByToken(token);
        if(u!=null){
            if(leadDTO!=null){
                try{
                    LeadEntity l =new LeadEntity();
                    l.setOwner(u);
                    l.setLeadState(LeadState.fromId(leadDTO.getState()));
                    l.setDescricao(leadDTO.getDescription());
                    l.setTitulo(leadDTO.getTitle());
                    leadDao.persist(l);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        }
        return false;
    }


    /**
     * Adiciona um lead ao utilizador, utilizado pelo Admin, identifica o utilizador pelo seu id
     * @param userId id do utilizador
     * @param leadDTO DTO do novo lead
     * @return true se bem sucedido, falso caso contrário
     */
    public boolean addLeadDTOToUserByUserId(Long userId, LeadDTO leadDTO){
        UserEntity u= userDao.find(userId);

        //verificar se o user existe
        if(u==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity("User not found").build());
        }

        //verificar o se o user está soft deleted
        if(u.isSoftDelete()){
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("User is not active").build());
        }

        //verificar se o lead veio mesmo
        if(leadDTO==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity("Lead is empty").build());
        }

        //agora que já verificamos tudo podemos adicionar
        try{
            LeadEntity l =new LeadEntity();
            l.setOwner(u);
            l.setLeadState(LeadState.fromId(leadDTO.getState()));
            l.setDescricao(leadDTO.getDescription());
            l.setTitulo(leadDTO.getTitle());
            leadDao.persist(l);
            return true;
        } catch (Exception e) {
            return false;
        }

    }


    /**
     * Permite editar um lead de um utilizador
     * @param token o token identificador do utilizador
     * @param leadId oo id do lead
     * @param leadDTO o DTO com as alterações
     * @return true se bem sucedido, false caso contrário.
     */
    public boolean putLeadDTOByTokenLeadId(String token, Long leadId, LeadDTO leadDTO){
        if(token==null) return false;
        UserEntity userEntity=userDao.findUserByToken(token);
        //check if user is empty
        if(userEntity==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity("User not found").build());
        }
        //check if user is soft deleted
        if(userEntity.isSoftDelete()){
            return false;
        }
        Long userId=userEntity.getId();

        //Check if the leadId owner is the user

        if(leadId!=null&&leadDTO!=null){
            LeadEntity l=leadDao.getLeadByLeadID(leadId);

            //Check if the leadId owner is the user
            if(!userId.equals(l.getOwner().getId())){
                return false;
            }
            //if everything is ok do the thing;
            l.setTitulo(leadDTO.getTitle());
            l.setLeadState(LeadState.fromId(leadDTO.getState()));
            l.setDescricao(leadDTO.getDescription());
            return true;
        }

        return false;
    }

    /**
     * Permite ao admin editar um lead de um utilizador
     * @param userId o id do utilizador
     * @param leadId o id do lead
     * @param leadDTO o DTO com as novas informações
     * @return true se bem sucedido, falso caso contrário
     */
    public boolean adminUpdateLeadDTO(Long userId, Long leadId, LeadDTO leadDTO){
        UserEntity userEntity=userDao.find(userId);
        //check if user is empty
        if(userEntity==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity("User not found").build());
        }
        //check if user is soft deleted
        if(userEntity.isSoftDelete()){
            throw new WebApplicationException(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity("User is not active").build());
        }

        //check if lead received is null
        if(leadDTO==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity("Lead is empty").build());
        }

        //Check if the lead to edit is on the database
        LeadEntity l=leadDao.getLeadByLeadID(leadId);
        if(l==null){
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity("Lead to edit not found").build());
        }

        //if everything is ok do the thing;
        try{

            l.setTitulo(leadDTO.getTitle());
            l.setLeadState(LeadState.fromId(leadDTO.getState()));
            l.setDescricao(leadDTO.getDescription());
            leadDao.merge(l);
            return true;
        } catch (Exception e) {
            return false;
        }

    }


    /**
     * Permite apagar definitivamente um lead
     * @param leadId id do lead a apagar
     * @return true se bem sucedido, falso caso contrário
     */
    public boolean hardDelLeadById(Long leadId){
        if(leadId!=null){
            return leadDao.hardDelete(leadId);
            }
        return false;
    }

    public boolean softDelLeadById(Long leadId, String token){
        if(leadId==null) return false;
        if(token==null) return false;
        UserEntity u= userDao.findUserByToken(token);
        if(u==null) return false;
        LeadEntity l =leadDao.getLeadByLeadID(leadId);
        if(l==null) return false;
        if(!l.getOwner().getId().equals(u.getId())) return false;

        return leadDao.softDelete(leadId);
    }

    public boolean adminSoftDelLeadById(Long leadId){
        if(leadId!=null){
            return leadDao.softDelete(leadId);
        }
        return false;
    }

    public boolean softUnDelLeadById(Long leadId){
        if(leadId!=null){
            return leadDao.softUnDelete(leadId);
        }
        return false;
    }

    /*public boolean softDelALlUserLeads(String token){
        if(token!=null){
            return leadDao.softDelALlUserLeads(token);
        }
        return false;
    }*/

    public boolean softDelALlUserLeadsAdmin(Long id){
        if(id!=null){
            return leadDao.softDelALlUserLeadsAdmin(id);
        }
        return false;
    }



    /*public boolean softUnDelALlUserLeads(String token){
        if(token!=null){
            return leadDao.softUnDelALlUserLeads(token);
        }
        return false;
    }*/

    public boolean softUnDelALlUserLeadsAdmin(Long id){
        if(id!=null){
            return leadDao.softUnDelALlUserLeadsAdmin(id);
        }
        return false;
    }



    public ArrayList<LeadDTO> getLeadDTOsByState(Integer stateId){
        //verificar se chegaram cá as informações todas
        if(stateId==null) return null;

        //verificar se o stateId está correto e corresponde a algum estado
        LeadState state;
        try {
            state=LeadState.fromId(stateId);
        } catch (Exception e) {
            return null;
        }

        //verificar se há algum resultado
        ArrayList<LeadEntity> leadEntities= (ArrayList<LeadEntity>) leadDao.getLeadsByState(state);
        if(leadEntities==null) return null;

        ArrayList<LeadDTO> leads= new ArrayList<>();
        //converter para os DTOs
        for(LeadEntity l : leadEntities){
            leads.add(convertLeadEntityToDTO(l));
        }
        //devolver o resultado
        return leads;
    }

}
