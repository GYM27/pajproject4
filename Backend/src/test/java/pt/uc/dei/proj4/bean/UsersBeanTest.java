package pt.uc.dei.proj4.bean;

import aor.paj.projecto4.bean.TokenBean;
import aor.paj.projecto4.bean.UsersBean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.LoginDTO;
import aor.paj.projecto4.dto.UserBaseDTO;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UsersBeanTest {
    UsersBean usersBean;
    UserDao userDao;
    TokenBean tokenBean;
    UserEntity u;   // User 1 (ID 1)
    UserEntity u2;  // User 2 (ID 2)
    LoginDTO loginDTO1;
    LoginDTO loginDTO2;

    @BeforeEach
    void setup() {
        userDao = mock(UserDao.class);
        tokenBean = mock(TokenBean.class);
        usersBean = new UsersBean(userDao, tokenBean);

        // user1
        u = spy(new UserEntity());
        u.setUsername("testDummy");
        u.setPassword("xxxxx");
        u.setEmail("test@test.com");
        u.setContact("999999999");
        u.setUserRole(UserRoles.NORMAL);
        u.setSoftDelete(false);
        doReturn(1L).when(u).getId(); // Force ID = 1

        // user2
        u2 = spy(new UserEntity());
        u2.setUsername("u2");
        u2.setPassword("BonoVox");
        u2.setEmail("u2@u2.com");
        u2.setContact("888888888");
        u2.setUserRole(UserRoles.NORMAL);
        u2.setSoftDelete(false);
        doReturn(2L).when(u2).getId(); // Force ID = 2

        // Login DTOs
        loginDTO1 = new LoginDTO(u.getUsername(), u.getPassword());
        loginDTO2 = new LoginDTO(u.getUsername(), "wrong_password");


        when(userDao.find(1L)).thenReturn(u);
        when(userDao.find(13L)).thenReturn(null);

        when(userDao.findUserByEmail("test@test.com")).thenReturn(u);
        when(userDao.findUserByContact("999999999")).thenReturn(u);
        when(userDao.findUserByUsername("testDummy")).thenReturn(u);
        when(userDao.findUserByToken("token1")).thenReturn(u);

        when(userDao.findUserByEmail("other@email.com")).thenReturn(u2);
        when(userDao.findUserByContact("888888888")).thenReturn(u2);

        when(tokenBean.generateNewToken(u)).thenReturn("token1");
        when(tokenBean.getUserEntityByToken("token1")).thenReturn(u);
        when(tokenBean.getUserEntityByToken("token2")).thenReturn(null);
    }

    @Test
    void testAuthenticateUser() {
        assertNotNull(usersBean.authenticateUser(loginDTO1));
        assertEquals("token1", usersBean.authenticateUser(loginDTO1).getToken());
        assertNull(usersBean.authenticateUser(loginDTO2));
    }

    @Test
    void testGetUserBaseDTOById() {
        assertNotNull(usersBean.getUserBaseDTOById(1L));
        assertNull(usersBean.getUserBaseDTOById(13L));
    }

    @Test
    void putEditUserTest() {

        UserBaseDTO userBaseDTO = usersBean.convertToUserBaseDTO(u2);

        userBaseDTO.setEmail("new_unique@email.com");
        userBaseDTO.setCellphone("777777777");
        assertTrue(usersBean.putEditUser(1L, userBaseDTO));

        userBaseDTO.setEmail("other@email.com"); // Dao returns u2 (ID 2)
        assertFalse(usersBean.putEditUser(1L, userBaseDTO), "Should fail because ID 2 != ID 1");

        userBaseDTO.setEmail("new_unique@email.com"); // reset email
        userBaseDTO.setCellphone("888888888"); // Dao returns u2 (ID 2)
        assertFalse(usersBean.putEditUser(1L, userBaseDTO));

        assertFalse(usersBean.putEditUser(null, userBaseDTO));
        assertFalse(usersBean.putEditUser(1L, null));
    }

    @Test
    void softDeleteUserTest() {
        assertTrue(usersBean.softDeleteUser(1L));
        u.setSoftDelete(true);
        assertFalse(usersBean.softDeleteUser(1L));
    }
}