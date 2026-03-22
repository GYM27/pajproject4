package pt.uc.dei.proj4.bean;

import aor.paj.projecto4.bean.ClientsBean;
import aor.paj.projecto4.bean.TokenBean;
import aor.paj.projecto4.dao.ClientsDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.ClientsDTO;
import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;
import jakarta.ws.rs.WebApplicationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ClientsBeanTest {

    @InjectMocks
    @Spy
    private ClientsBean clientsBean;

    @Mock
    private ClientsDao clientsDao;

    @Mock
    private UserDao userDao;

    @Mock
    private TokenBean tokenBean;

    private UserEntity spyUser;
    private UserEntity otherUser;
    private ClientsEntity myClient;
    private ClientsDTO clientsDTO;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // 1. Setup do Utilizador Principal (ID 1)
        UserEntity u = new UserEntity();
        u.setUsername("owner");
        u.setUserRole(UserRoles.NORMAL);
        spyUser = spy(u);
        doReturn(1L).when(spyUser).getId();

        // 2. Setup de Outro Utilizador (ID 2)
        UserEntity u2 = new UserEntity();
        otherUser = spy(u2);
        doReturn(2L).when(otherUser).getId();

        // 3. Setup do Cliente
        myClient = new ClientsEntity();
        myClient.setId(100L);
        myClient.setName("Cliente Original");
        myClient.setOwner(spyUser);
        myClient.setSoftDelete(false);

        // 4. Setup do DTO
        clientsDTO = new ClientsDTO();
        clientsDTO.setName("Novo Nome");
        clientsDTO.setEmail("novo@test.com");

        // Configuração de Mocks Globais
        when(tokenBean.getUserEntityByToken("token-valido")).thenReturn(spyUser);
        when(tokenBean.getUserEntityByToken("token-invalido")).thenReturn(null);
    }

    // --- TESTES DE ADICIONAR ---

    @Test
    @DisplayName("Deve adicionar cliente com sucesso delegando ao DAO")
    void addClientSuccess() {
        // Simula que não há duplicados
        doReturn(false).when(clientsBean).isEmailDuplicated(anyString(), any(UserEntity.class));

        assertDoesNotThrow(() -> clientsBean.addClient("token-valido", clientsDTO));

        // Verifica se chamou o persist do DAO e não o em.persist diretamente
        verify(clientsDao, times(1)).persist(any(ClientsEntity.class));
    }

    // --- TESTES DE EDIÇÃO ---

    @Test
    @DisplayName("Deve editar cliente com sucesso (2 parâmetros no Bean)")
    void editClientSuccess() {
        // No Bean: editClient(Long clientId, ClientsDTO dto)
        when(clientsDao.find(100L)).thenReturn(myClient);

        assertDoesNotThrow(() -> clientsBean.editClient(100L, clientsDTO));
        verify(clientsDao, times(1)).merge(any(ClientsEntity.class));
    }

    @Test
    @DisplayName("Deve falhar se o cliente não existe (404)")
    void editClientNotFound() {
        when(clientsDao.find(999L)).thenReturn(null);

        WebApplicationException ex = assertThrows(WebApplicationException.class,
                () -> clientsBean.editClient(999L, clientsDTO));
        assertEquals(404, ex.getResponse().getStatus());
    }

    // --- TESTES DE LISTAGEM ---

    @Test
    @DisplayName("Deve listar clientes usando o filtro opcional do DAO")
    void listClientsSuccess() {
        List<ClientsEntity> list = new ArrayList<>();
        list.add(myClient);

        // O Bean resolve o filterId como 1L porque o user é NORMAL
        when(clientsDao.findActiveWithOptionalFilter(1L)).thenReturn(list);

        List<ClientsDTO> result = clientsBean.listClients("token-valido", null);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(clientsDao).findActiveWithOptionalFilter(1L);
    }

    @Test
    @DisplayName("Deve permitir ao Admin filtrar por outro utilizador")
    void listClientsAsAdminSuccess() {
        spyUser.setUserRole(UserRoles.ADMIN);
        List<ClientsEntity> list = new ArrayList<>();

        when(clientsDao.findActiveWithOptionalFilter(2L)).thenReturn(list);

        // Admin pede explicitamente o userId 2
        clientsBean.listClients("token-valido", 2L);

        verify(clientsDao).findActiveWithOptionalFilter(2L);
    }

    // --- TESTES DE REMOÇÃO ---

    @Test
    @DisplayName("Deve realizar soft delete via DAO merge")
    void softDeleteSuccess() {
        when(clientsDao.find(100L)).thenReturn(myClient);

        clientsBean.softDeleteClient(100L);

        assertTrue(myClient.isSoftDelete());
        verify(clientsDao, times(1)).merge(myClient);
    }
}