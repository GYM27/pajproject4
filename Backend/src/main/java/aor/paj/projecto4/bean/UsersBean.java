package aor.paj.projecto4.bean;

import aor.paj.projecto4.pojo.User;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.LoginDTO;
import aor.paj.projecto4.dto.LoginResponseDTO;
import aor.paj.projecto4.dto.UserBaseDTO;
import aor.paj.projecto4.dto.UserDTO;
import aor.paj.projecto4.entity.UserEntity;

import aor.paj.projecto4.service.UserVerificationBean;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;


@Stateless
public class UsersBean implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;



    //Injectamos aqui o UserDao para conseguirmos ir à base de dados buscar coisas
    @Inject
    UserDao userDao;
    @Inject
    TokenBean tokenBean;
    @Inject
    private UserVerificationBean userVerificationBean;

    public UsersBean() {
    }

    //Devido aos testes, construtor
    public UsersBean(UserDao userDao, TokenBean tokenBean) {
        this.userDao = userDao;
        this.tokenBean = tokenBean;
    }

    /**
     * Método privado para irmos buscar a UserEntity por id
     * @param id id do UserEntity que queremos
     * @return a UserEntity
     */
    private UserEntity getUserEntityByID(Long id){
        return userDao.find(id);
    }

    /**
     * Recebe uma entidade e devolve um pojo, neste caso em particular.
     * Não tenho a certeza de ser necessário
     * @param entity UserEntity que queremos converter
     * @return o POJO User
     */
    public User convertToPojo (UserEntity entity){
        User pojo= new User();
        if(entity!=null){
            pojo.setId(entity.getId());
            pojo.setUsername(entity.getUsername());
            //user.setPassword(entity.getPassword());
            pojo.setContact(entity.getContact());
            pojo.setFirstName(entity.getFirstName());
            pojo.setLastName(entity.getLastName());
            pojo.setPhoto(entity.getPhoto());
            pojo.setEmail(entity.getEmail());
            pojo.setUserRole(entity.getUserRole());
            //isto requer um two step Process
            //ArrayList<Lead> leadPojos= (ArrayList<Lead>) convertEntityLeads(entity.getLeads());
            //pojo.setLeads(leadPojos);
            return pojo;
        }
        return  null;
    }

    /**
     * Converte uma UserEntity num UserBaseDTO
     * mais uma vez não seis e necessário, é preciso começar em algum lado
     * @param entity UserEntity que queremos converter
     * @return o UserBaseDTO convertido
     */
    public UserBaseDTO convertToUserBaseDTO (UserEntity entity){
        UserBaseDTO userBaseDTO= new UserBaseDTO();
        if(entity!=null){
            //todo talvez este DTO devesse ter o id?
            userBaseDTO.setCellphone(entity.getContact());
            userBaseDTO.setFirstName(entity.getFirstName());
            userBaseDTO.setLastName(entity.getLastName());
            userBaseDTO.setPhotoUrl(entity.getPhoto());
            userBaseDTO.setEmail(entity.getEmail());
            // Novos campos necessários para a página de Administrador
            userBaseDTO.setId(entity.getId());
            //userBaseDTO.setUsername(entity.getUsername());
            userBaseDTO.setSoftDelete(entity.isSoftDelete());

            if(entity.getUserRole() != null) {
                userBaseDTO.setRole(entity.getUserRole().name());
            }

            return userBaseDTO;
        }
        return  null;
    }

    public UserDTO convertToUserDTO (UserEntity entity){
        UserDTO userDTO= new UserDTO();
        if(entity!=null){
            userDTO.setUsername(entity.getUsername());
            userDTO.setPassword(entity.getPassword());
            userDTO.setCellphone(entity.getContact());
            userDTO.setFirstName(entity.getFirstName());
            userDTO.setLastName(entity.getLastName());
            userDTO.setPhotoUrl(entity.getPhoto());
            userDTO.setEmail(entity.getEmail());
            // Novos campos necessários para a página de Administrador
            userDTO.setId(entity.getId());
            //userBaseDTO.setUsername(entity.getUsername());
            userDTO.setSoftDelete(entity.isSoftDelete());

            if(entity.getUserRole() != null) {
                userDTO.setRole(entity.getUserRole().name());
            }

            return userDTO;
        }
        return  null;
    }


    /*/**
     * Recebe uma lista de LeadEntity e devolve uma lista de POJO's Lead
     * @param leadEntityList
     * @return
     */
    /*private List<Lead> convertEntityLeads(List<LeadEntity> leadEntityList){
        ArrayList<Lead> leadPojos= new ArrayList<Lead>();
        if(leadEntityList!=null){
            for (LeadEntity le :leadEntityList){
                Lead lp=new Lead();
                lp.setId(le.getId());
                lp.setEstado(le.getLeadState());
                lp.setTitulo(le.getTitulo());
                lp.setDescricao(le.getDescricao());
                leadPojos.add(lp);
            }
            return leadPojos;
        }
        return  null;
    }*/

    /*/**
     * Recebe um username e devolve um POJO do User
     * Mais uma vez não sei se necessário
     * @param username wel duh
     * @return o User que tem esse username
     */
    /*public User getUserbyUsername(String username){
        UserEntity userEntity=userDao.findUserByUsername(username);
        if(userEntity!=null){
            return convertToPojo(userEntity);
        }else{
            return null;
        }
    }*/

    /**
     * Recebe um loginDTO com o username e pass de quem está a tentar fazer login
     * @param loginDTO
     * @return devolve um User POJO se as credenciais estão corretas
     */
    public LoginResponseDTO authenticateUser(LoginDTO loginDTO) {
        //verificar se chegou cá alguma coisa
        if(loginDTO==null) return null;

        UserEntity userEntity = userDao.findUserByUsername(loginDTO.getUsername());

        // validar credenciais e ver se não está softDeleted
        if (userEntity != null && userEntity.getPassword().equals(loginDTO.getPassword())&&!userEntity.isSoftDelete()) {

            // 1. Gerar o token
            String token = tokenBean.generateNewToken(userEntity);

            // 2. Devolver a resposta
            return new LoginResponseDTO(
                    userEntity.getId(),
                    userEntity.getFirstName(),
                    userEntity.getUserRole(),
                    token
            );
        }
        return null;
    }


    public UserBaseDTO getUserBaseDTOByToken(String token){
        if(token==null){
            return  null;
        }
        UserEntity userEntity= tokenBean.getUserEntityByToken(token);
        if(userEntity!=null){
            return convertToUserBaseDTO(userEntity);
        }
        return null;
    }

    public UserDTO getUserDTOByToken(String token){
        if(token==null){
            return  null;
        }
        UserEntity userEntity= tokenBean.getUserEntityByToken(token);
        if(userEntity!=null){
            return convertToUserDTO(userEntity);
        }
        return null;
    }



    public UserBaseDTO getUserBaseDTOById(Long id){
        if(id==null){
            return null;
        }

        UserEntity userEntity=userDao.find(id);
        if(userEntity!=null){
            return convertToUserBaseDTO(userEntity);
        }

        return null;
    }



    /**
     * Regista um novo utilizador
     * @param userDTO o novo utilizador
     * @return true se bem-sucedido, false senão
     */
    //todo podia ser boa ideia devolver antes um objeto com boolean e mensagem de erro
    public boolean registerUser(UserDTO userDTO){
        if(userDTO==null) return false;
        //verificar primeiro se o username já existe
        if(userDao.findUserByUsername(userDTO.getUsername())!=null) return false;
        //verificar se o email já existe
        if(userDao.findUserByEmail(userDTO.getEmail())!=null) return false;
        //verificar se o telefone já existe
        if(userDao.findUserByContact(userDTO.getCellphone())!=null) return false;

        try{
            UserEntity userEntity = new UserEntity();
            userEntity.setFirstName(userDTO.getFirstName());
            userEntity.setLastName(userDTO.getLastName());
            userEntity.setUsername(userDTO.getUsername());
            userEntity.setPassword(userDTO.getPassword());
            userEntity.setEmail(userDTO.getEmail());
            userEntity.setContact(userDTO.getCellphone());
            userEntity.setPhoto(userDTO.getPhotoUrl());
            userDao.persist(userEntity);
            return true;
        }
        catch (Exception e){
            return  false;
        }


    }

    //devolver um objeto com mensagem de erro e boolean
    public boolean putEditUser(Long id, UserBaseDTO userBaseDTO){
        if(id==null) return false;
        if(userBaseDTO==null) return false;

        UserEntity userEntity=userDao.find(id);
        if(userEntity==null)return false;

        //verificar se o email já existe
        if(userDao.findUserByEmail(userBaseDTO.getEmail())!=null&&
                !userDao.findUserByEmail(userBaseDTO.getEmail()).getId().equals(userEntity.getId())
        ) return false;
        //verificar se o telefone já existe
        if(userDao.findUserByContact(userBaseDTO.getCellphone())!=null&&
                !userDao.findUserByContact(userBaseDTO.getCellphone()).getId().equals(userEntity.getId())
        ) return false;


        try {
            userEntity.setFirstName(userBaseDTO.getFirstName());
            userEntity.setLastName(userBaseDTO.getLastName());
            userEntity.setEmail(userBaseDTO.getEmail());
            userEntity.setContact(userBaseDTO.getCellphone());
            userEntity.setPhoto(userBaseDTO.getPhotoUrl());
            return true;
        } catch (Exception e) {
            return false;
        }

    }

    public boolean putEditOwnUser(String token, UserDTO userDTO){
        if(token==null)return false;
        if(userDTO==null) return false;

        //vamos buscar o utilizador se ele não existe morre já
        UserEntity userEntity=userDao.findUserByToken(token);
        if(userEntity==null) return false;


        //verificar se o email já existe e é diferente do próprio utilizador que está a alterar
        if(userDao.findUserByEmail(userDTO.getEmail())!=null&&
                !userDao.findUserByEmail(userDTO.getEmail()).getId().equals(userEntity.getId())) return false;

        //verificar se o telefone já existe e é diferente do próprio utilizador que está a alterar
        if(userDao.findUserByContact(userDTO.getCellphone())!=null&&
                !userDao.findUserByContact(userDTO.getCellphone()).getId().equals(userEntity.getId())
        ) return false;


        try {
            userEntity.setUsername(userDTO.getUsername());
            userEntity.setPassword(userDTO.getPassword());
            userEntity.setFirstName(userDTO.getFirstName());
            userEntity.setLastName(userDTO.getLastName());
            userEntity.setEmail(userDTO.getEmail());
            userEntity.setContact(userDTO.getCellphone());
            userEntity.setPhoto(userDTO.getPhotoUrl());
            return true;
        } catch (Exception e) {
            return false;
        }

    }

    public boolean softDeleteUser(Long id){
        if(id==null)return false;

        UserEntity userEntity=userDao.find(id);
        if(userEntity!=null){
            //se o user já tem softDelete não é preciso voltar a fazer o mesmo
            if (userEntity.isSoftDelete()) return false;
            //se não tem agora já o podemos desativar
            userEntity.setSoftDelete(true);
            return true;
        }
        return false;
    }

    public boolean softUnDeleteUser(Long id){
        if(id==null)return false;

        UserEntity userEntity=userDao.find(id);
        if(userEntity!=null){
            //só fazemos isto se o user já estiver desativado
            if(userEntity.isSoftDelete()){
                userEntity.setSoftDelete(false);
                return true;
            }
        }
        return false;
    }

    public boolean deleteUser(Long id){
        if(id==null)return false;
        UserEntity userEntity=userDao.find(id);
        if(userEntity!=null){
            userDao.hardDelete(id);
            return true;
        }
        return false;
    }

    public ArrayList<UserBaseDTO> getAllUsers(){
        ArrayList<UserEntity> userEntities= (ArrayList<UserEntity>) userDao.findAll();
        ArrayList<UserBaseDTO> result= new ArrayList<UserBaseDTO>();
        if(userEntities!=null&&!userEntities.isEmpty()){
            for(UserEntity u : userEntities){
                result.add(convertToUserBaseDTO(u));
            }
            return result;
        }

        return null;
    }

    public ArrayList<UserBaseDTO> getAllUsersButAdmin(String token){
        //se não há token morre já
        if(token==null) return null;
        //se há token vamos buscar o id do admin
        Long adminId=userDao.findUserByToken(token).getId();

        ArrayList<UserEntity> userEntities= (ArrayList<UserEntity>) userDao.findAll();
        ArrayList<UserBaseDTO> result= new ArrayList<UserBaseDTO>();
        if(userEntities!=null&&!userEntities.isEmpty()){
            for(UserEntity u : userEntities){
                //só adicionamos os utilizadores que não são o admin para este não ter a hipótese de cometer Seppuku
                if(!u.getId().equals(adminId)){
                    result.add(convertToUserBaseDTO(u));
                }

            }
            return result;
        }

        return null;
    }

}
