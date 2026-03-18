package pt.uc.dei.proj4.bean;
import aor.paj.projecto4.bean.ClientsBean;
import aor.paj.projecto4.bean.TokenBean;
import aor.paj.projecto4.dto.ClientsDTO;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.WebApplicationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import aor.paj.projecto4.dao.ClientsDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;

import java.util.ArrayList;

//import static jakarta.faces.component.UIData.PropertyKeys.first;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public class ClientsBeanTest {
    ClientsBean clientsBean;
    UserDao userDao;
    ClientsDao clientsDao;
    TokenBean tokenBean;
    ArrayList<ClientsEntity> clients;
    UserEntity u;
    UserEntity spyUser;
    ClientsEntity c1;
    ClientsEntity c2;
    ClientsDTO clientsDTO;
    EntityManager em;

    @BeforeEach
    void setup(){
        //criar os objetos mock
        userDao=mock(UserDao.class);
        clientsDao=mock(ClientsDao.class);
        tokenBean=mock(TokenBean.class);
        em=mock(EntityManager.class);


        // a class a ser testada
        //leadsBean=new LeadsBean(leadDao, userDao);
        clientsBean=new ClientsBean( tokenBean,  clientsDao, em);

        //criar pelo menos um utilizador que já "esteja na base de dados"
        u=new UserEntity();
        u.setPassword("xxxxx");
        u.setUsername("testDummy");
        u.setEmail("test@test.com");
        u.setFirstName("test");
        u.setLastName("dummy");
        u.setContact("999999999");
        u.setUserRole(UserRoles.NORMAL);


        //criar pelo menos dois clients
        c1=new ClientsEntity();
        c1.setId(1L);
        c1.setName("Teste Cliente 1");
        c1.setEmail("client1@test.com");
        c1.setPhone("1111111111");
        c1.setOrganization("Acme inc");
        c1.setOwner(u);
        c1.setSoftDelete(false);

        c2=new ClientsEntity();
        c2.setId(1L);
        c2.setName("Teste Cliente 2");
        c2.setEmail("client2@test.com");
        c2.setPhone("222222222");
        c2.setOrganization("Looney Toons");
        c2.setOwner(u);
        c2.setSoftDelete(false);

        //definir um clientDTO
        clientsDTO=new ClientsDTO();
        clientsDTO.setName("nome do dto");
        clientsDTO.setEmail("email@email.com");
        clientsDTO.setOrganization("Acme");
        clientsDTO.setPhone("999999999");

        //adicionar a um array de leads
        clients=new ArrayList<ClientsEntity>();
        clients.add(c1);
        clients.add(c2);


        //definir o comportamento dos daos
//        when(clientsDao.findAll(1L)).thenReturn(clients);
//        when(clientsDao.findAll(15L)).thenReturn(null);
        when(clientsDao.findActiveByOwner(1L)).thenReturn(clients);
        when(clientsDao.findActiveByOwner(15L)).thenReturn(null);
        when(clientsDao.findDeletedByOwner(1L)).thenReturn(clients);
        when(clientsDao.findDeletedByOwner(15L)).thenReturn(null);
        //when(userDao.findUserByToken("token1")).thenReturn(u);
        //when(leadDao.getLeadByLeadID(1L)).thenReturn(l1);
        when(tokenBean.getUserEntityByToken("token1")).thenReturn(u);
        when(tokenBean.getUserEntityByToken("token2")).thenReturn(null);
        doNothing().when(clientsDao).persist(any(ClientsEntity.class));
        when(userDao.find(1L)).thenReturn(u);
        when(userDao.find(15L)).thenReturn(null);

        // Create a spy of your user entity
        /*spyUser = spy(u);
        // Tell the spy to return 1L whenever getId() is called
        doReturn(1L).when(spyUser).getId();
        // make the l1 owner the spyUser
        c1.setOwner(spyUser);
        // Use the spyUser in your DAO mocks
        when(userDao.findUserByToken("token1")).thenReturn(spyUser);
        when(leadDao.getLeadByLeadID(1L)).thenReturn(l1);*/


    }

    @Test
    void addClientTest(){

        //insucesso token errado throws exception
        WebApplicationException exception = assertThrows(WebApplicationException.class, () -> {
            clientsBean.addClient("token2", clientsDTO);
        });
        // 2. verificar se o status é 401
        assertEquals(401, exception.getResponse().getStatus());

        //insucesso devido a email duplicado
        //Criar um  Spy odo bean que estamos a testar
        ClientsBean spyBean = spy(clientsBean);

        // fazer um mock da resposta do método (testamos esse método em separado se tivermos a oportunidade mais tarde)
        doReturn(true).when(spyBean).isEmailDuplicated(anyString(), any(UserEntity.class));

        // verificamos no sy e não no bean original
        WebApplicationException exception2 = assertThrows(WebApplicationException.class, () -> {
            spyBean.addClient("token1", clientsDTO);
        });

        assertEquals(409, exception2.getResponse().getStatus());
    }

    @Test
    void editClientTest(){

            // setup dos objetos
            ClientsBean spyBean = spy(clientsBean); // Create the spy
            Long targetId = 1L;

            // criar um cliente que ja existe na base de dados
            ClientsEntity existingClient = new ClientsEntity();
            existingClient.setEmail("old@email.com");
            existingClient.setOwner(u); // u from your @BeforeEach

            // fazer mock do comportamento do em
            when(em.find(ClientsEntity.class, targetId)).thenReturn(existingClient);

            //fazer mock do método interno de verificação de email, devolve true qd o email é new@email.com
            doReturn(true).when(spyBean).isEmailDuplicated(eq("new@email.com"), any(UserEntity.class));

            // por o dto com esse email
            clientsDTO.setEmail("new@email.com");

            WebApplicationException exception = assertThrows(WebApplicationException.class, () -> {
                spyBean.editClient("token1", targetId, clientsDTO);
            });

            assertEquals(409, exception.getResponse().getStatus());
        }

        @Test
        void listAllMyClientsDTOTest(){
            //sucesso o user existe
            assertDoesNotThrow(() -> {
                clientsBean.listAllMyClientsDTO("token1");
            });

            //insucesso o user não existe
            WebApplicationException exception = assertThrows(WebApplicationException.class, () -> {
                clientsBean.listAllMyClientsDTO("token2");
            });
            assertEquals(401, exception.getResponse().getStatus());
        }






}
