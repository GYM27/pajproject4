package pt.uc.dei.proj4.bean;
import aor.paj.projecto4.bean.LeadsBean;
import aor.paj.projecto4.bean.TokenBean;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import aor.paj.projecto4.dao.LeadDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.LeadDTO;
import aor.paj.projecto4.entity.LeadEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.LeadState;
import aor.paj.projecto4.utils.UserRoles;

import java.util.ArrayList;

//import static jakarta.faces.component.UIData.PropertyKeys.first;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LeadsBeanTest {
    LeadsBean leadsBean;
    UserDao userDao;
    LeadDao leadDao;
    TokenBean tokenBean;
    ArrayList<LeadEntity> leads;
    UserEntity u;
    UserEntity spyUser;
    LeadEntity l1;
    LeadEntity l2;
    LeadDTO leadDTO;

    @BeforeEach
    void setup(){
        //criar os objetos mock
        userDao=mock(UserDao.class);
        leadDao=mock(LeadDao.class);
        tokenBean=mock(TokenBean.class);

        // a class a ser testada
        leadsBean=new LeadsBean(leadDao, userDao);

        //criar pelo menos um utilizador que já "esteja na base de dados"
        u=new UserEntity();
        u.setPassword("xxxxx");
        u.setUsername("testDummy");
        u.setEmail("test@test.com");
        u.setFirstName("test");
        u.setLastName("dummy");
        u.setContact("999999999");
        u.setUserRole(UserRoles.NORMAL);


        //criar pelo menos duas leads
        l1=new LeadEntity();
        l1.setOwner(u);
        l1.setTitulo("Titulo teste lead1");
        l1.setLeadState(LeadState.NOVO);
        l1.setDescricao("Descrição teste lead1");
        l1.setSoftDelete(false);

        l2=new LeadEntity();
        l2.setOwner(u);
        l2.setTitulo("Titulo teste lead2");
        l2.setLeadState(LeadState.NOVO);
        l2.setDescricao("Descrição teste lead2");
        l2.setSoftDelete(false);

        //definir um leadDTO
        //leadDTO.setId(3L);
        leadDTO=new LeadDTO();
        leadDTO.setTitle("titulo teste dto");
        leadDTO.setDescription("descrição test dto");
        leadDTO.setState(1);

        //adicionar a um array de leads
        leads=new ArrayList<LeadEntity>();
        leads.add(l1);
        leads.add(l2);

        //definir o comportamento dos daos
        when(leadDao.getLeadsByUserId(1L)).thenReturn(leads);
        when(leadDao.getLeadsByUserId(15L)).thenReturn(null);
        when(leadDao.getLeadsByToken("token1")).thenReturn(leads);
        when(leadDao.getLeadsByToken("token2")).thenReturn(null);
        when(leadDao.getUserSoftDelLeads(1L)).thenReturn(leads);
        when(leadDao.getUserSoftDelLeads(15L)).thenReturn(null);
        //when(userDao.findUserByToken("token1")).thenReturn(u);
        when(leadDao.getLeadByLeadID(1L)).thenReturn(l1);
        doNothing().when(leadDao).persist(any(LeadEntity.class));
        when(userDao.find(1L)).thenReturn(u);
        when(userDao.find(15L)).thenReturn(null);

        // Create a spy of your user entity
        spyUser = spy(u);
        // Tell the spy to return 1L whenever getId() is called
        doReturn(1L).when(spyUser).getId();
        // make the l1 owner the spyUser
        l1.setOwner(spyUser);
        // Use the spyUser in your DAO mocks
        when(userDao.findUserByToken("token1")).thenReturn(spyUser);
        when(leadDao.getLeadByLeadID(1L)).thenReturn(l1);

    }

    @Test
    void getLeadDTOsByUserIdTest(){
        //sucesso devolve o array de leads
        assertNotNull(leadsBean.getLeadDTOsByUserId(1L));
        //insucesso o id é nulo
        assertNull(leadsBean.getLeadDTOsByUserId(null));
        //insucesso o id é de um user que não existe
        assertNull(leadsBean.getLeadDTOsByUserId(15L));
    }

    @Test
    void getLeadDTOsByTokenTest(){
        //sucesso devolve o array de leads
        assertNotNull(leadsBean.getLeadDTOsByToken("token1"));
        //insucesso o id é nulo
        assertNull(leadsBean.getLeadDTOsByToken(null));
        //insucesso o id é de um user que não existe
        assertNull(leadsBean.getLeadDTOsByToken("token2"));
    }

    @Test
    void getSoftDelLeadsByUserId(){
        //sucesso devolve o array de leads
        assertNotNull(leadsBean.getSoftDelLeadsByUserId(1L));
        //insucesso o id é nulo
        assertNull(leadsBean.getSoftDelLeadsByUserId(null));
        //insucesso o id é de um user que não tem softdeleted leads
        assertNull(leadsBean.getSoftDelLeadsByUserId(15L));

    }

    @Test
    void getLeadDTOByTokenLeadIdTest(){
        //sucesso
        assertNotNull(leadsBean.getLeadDTOByTokenLeadId("token1",1L));

        //insucesso o user está softdeleted
        spyUser.setSoftDelete(true);
        assertNull(leadsBean.getLeadDTOByTokenLeadId("token1",1L));

        //insucesso o lead pertence a outro owner
        UserEntity wrongOwner = spy(new UserEntity());
        doReturn(99L).when(wrongOwner).getId();
        l1.setOwner(wrongOwner);
        assertNull(leadsBean.getLeadDTOByTokenLeadId("token1",1L));

    }

    @Test
    void addLeadDTOToUserTest(){
        //sucesso
        assertTrue(leadsBean.addLeadDTOToUser("token1", leadDTO));
        //insucesso o utilizador não existe na base de dados
        assertFalse(leadsBean.addLeadDTOToUser("token2", leadDTO));
        //insucesso o token está null
        assertFalse(leadsBean.addLeadDTOToUser(null, leadDTO));
        //insucesso o dto está null
        assertFalse(leadsBean.addLeadDTOToUser("token2", null));
    }

    @Test
    void addLeadDTOToUserByUserIdTest(){
        //sucesso
        assertTrue(leadsBean.addLeadDTOToUserByUserId(1L, leadDTO));

        //Insucesso utilizador não existe
        // 1. verificar se lança uma exceção
        WebApplicationException exception = assertThrows(WebApplicationException.class, () -> {
            leadsBean.addLeadDTOToUserByUserId(15L, leadDTO);
        });

        // 2. verificar se o status é 404 (Not Found)
        assertEquals(404, exception.getResponse().getStatus());

        //Insucesso utilizador está sofdeleted
        u.setSoftDelete(true);
        //1. verificar se lança exceção
        WebApplicationException exception2 = assertThrows(WebApplicationException.class, () -> {
            leadsBean.addLeadDTOToUserByUserId(1L, leadDTO);
        });
        // 2. verificar se o status é 403 (Forbidden)
        assertEquals(403, exception2.getResponse().getStatus());

        //Insucesso o dto está null
        u.setSoftDelete(false);
        //1. verificar se lança exceção
        WebApplicationException exception3 = assertThrows(WebApplicationException.class, () -> {
            leadsBean.addLeadDTOToUserByUserId(1L, null);
        });
        // 2. verificar se o status é bad request
        assertEquals(400, exception3.getResponse().getStatus());

    }

    @Test
    void putLeadDTOByTokenLeadIdTest(){

        //sucesso
        assertTrue(leadsBean.putLeadDTOByTokenLeadId("token1",1L, leadDTO));

        //insucesso o token está errado
        WebApplicationException exception = assertThrows(WebApplicationException.class, () -> {
            leadsBean.putLeadDTOByTokenLeadId("token12",1L, leadDTO);
        });
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), exception.getResponse().getStatus());

        //insucesso o user está softDeleted
        spyUser.setSoftDelete(true);
        assertFalse(leadsBean.putLeadDTOByTokenLeadId("token1",1L, leadDTO));

        //insucesso o user está a tentar aceder a uma lead que não é a sua
        UserEntity wrongOwner = spy(new UserEntity());
        doReturn(99L).when(wrongOwner).getId();
        l1.setOwner(wrongOwner);
        assertFalse(leadsBean.putLeadDTOByTokenLeadId("token1", 1L, leadDTO));

        //insucesso o token está null
        assertFalse(leadsBean.putLeadDTOByTokenLeadId(null, 1L, leadDTO));
        //insucesso o leadId está null
        assertFalse(leadsBean.putLeadDTOByTokenLeadId("token1", null, leadDTO));
        //insucesso o leadDTO está null
        assertFalse(leadsBean.putLeadDTOByTokenLeadId("token1", 1L, null));

    }
}
