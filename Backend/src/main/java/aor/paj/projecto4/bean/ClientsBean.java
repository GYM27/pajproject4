package aor.paj.projecto4.bean;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import aor.paj.projecto4.dao.ClientsDao;
import aor.paj.projecto4.dto.ClientsDTO;
import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ClientsBean {

    @Inject
    TokenBean tokenBean;

    @Inject
    ClientsDao clientsDao;

    @PersistenceContext(unitName = "project3PU")
    private EntityManager em;

    public ClientsBean(TokenBean tokenBean, ClientsDao clientsDao, EntityManager em) {
        this.tokenBean = tokenBean;
        this.clientsDao = clientsDao;
        this.em = em;
    }

    public ClientsBean() {
    }

    // --- MÉTODOS DE CONVERSÃO (Helper) ---
    // Centralizar isto evita esqueceres-te do dto.setId() novamente
    private ClientsDTO toDTO(ClientsEntity entity) {
        ClientsDTO dto = new ClientsDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setOrganization(entity.getOrganization());
        return dto;
    }

    private List<ClientsDTO> toDTOList(List<ClientsEntity> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // --- MÉTODOS DE ESCRITA ---

    public void addClient(String token, ClientsDTO dto) {
        UserEntity owner = tokenBean.getUserEntityByToken(token);
        if (owner == null) {
            throw new WebApplicationException(Response.status(401).entity("Sessão inválida.").type(MediaType.TEXT_PLAIN).build());
        }

        if (isEmailDuplicated(dto.getEmail(), owner)) {
            throw new WebApplicationException(Response.status(409).entity("Este email já existe para este utilizador").type(MediaType.TEXT_PLAIN).build());
        }

        ClientsEntity newClient = new ClientsEntity();
        newClient.setName(dto.getName());
        newClient.setEmail(dto.getEmail());
        newClient.setPhone(dto.getPhone());
        newClient.setOrganization(dto.getOrganization());
        newClient.setSoftDelete(false);

        owner.addClient(newClient);
        // Hibernate faz persist(newClient) via Cascade ou owner.getClients().add()
    }

    public void editClient(String token, Long clientId, ClientsDTO dto) {
        ClientsEntity client = em.find(ClientsEntity.class, clientId);
        if (client == null || client.isSoftDelete()) {
            throw new WebApplicationException(Response.status(404).entity("Cliente não encontrado").build());
        }

        // Validação de email: apenas se o email for alterado
        if (!client.getEmail().equalsIgnoreCase(dto.getEmail())) {
            if (isEmailDuplicated(dto.getEmail(), client.getOwner())) {
                throw new WebApplicationException(Response.status(409).entity("Email já em uso.").build());
            }
        }

        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setOrganization(dto.getOrganization());
    }

    // --- MÉTODOS DE LISTAGEM (DTO) ---

    public List<ClientsDTO> listAllClients(String token) {
        // Chame a query que filtra os softDeletes
        List<ClientsEntity> entities = em.createNamedQuery("ClientsEntity.findAdminActive", ClientsEntity.class)
                .getResultList();

        return toDTOList(entities);
    }

    public List<ClientsDTO> listAllMyClientsDTO(String token) {
        UserEntity user = tokenBean.getUserEntityByToken(token);
        if (user == null) throw new WebApplicationException(401);

        return toDTOList(clientsDao.findActiveByOwner(user.getId()));
    }

    public List<ClientsDTO> listDeletedClientsDTO(String token) {
        UserEntity user = tokenBean.getUserEntityByToken(token);
        if (user == null) throw new WebApplicationException(401);

        return toDTOList(clientsDao.findDeletedByOwner(user.getId()));
    }

    /**
     * Requisito A6: Devolve a lista de clientes ativos criados por um utilizador específico.
     * Utiliza o método findActiveByOwner já existente no ClientsDao.
     */
    public List<ClientsDTO> listClientsByUser(Long userId) {
        List<ClientsEntity> entities = clientsDao.findActiveByOwner(userId);
        return toDTOList(entities);
    }


    // --- MÉTODOS DE ELIMINAÇÃO/RESTAURO ---

    public void softDeleteClient(Long clientId) {
        ClientsEntity client = em.find(ClientsEntity.class, clientId);
        if (client != null) client.setSoftDelete(true);
    }

    public void restoreClient(Long clientId) {
        ClientsEntity client = em.find(ClientsEntity.class, clientId);
        if (client != null) client.setSoftDelete(false);
    }

    public void permanentDeleteClient(Long clientId) {
        ClientsEntity client = em.find(ClientsEntity.class, clientId);
        if (client != null) {
            UserEntity owner = client.getOwner();
            if (owner != null) owner.removeClient(client);
            em.remove(client);
        } else {
            // Se não encontrar, avisa o Service
            throw new WebApplicationException("Cliente não encontrado", 404);
        }
    }

    // --- MÉTODOS EM MASSA ---


    /**
     * Apaga (soft delete) todos os clientes criados por um utilizador específico.
     */
    public void softDeleteAllClientsByUser(Long userId) {
        List<ClientsEntity> clients = clientsDao.findActiveByOwner(userId);
        for (ClientsEntity c : clients) {
            c.setSoftDelete(true);
            em.merge(c); // Força a gravação na base de dados!
        }
    }

    /**
     * Restaura todos os clientes apagados de um utilizador específico.
     */
    public void unSoftDeleteAllClientsByUser(Long userId) {
        List<ClientsEntity> clients = clientsDao.findDeletedByOwner(userId);
        for (ClientsEntity c : clients) {
            c.setSoftDelete(false);
            em.merge(c); // Força a gravação na base de dados!
        }
    }

    // --- UTILITÁRIOS ---

    public boolean isEmailDuplicated(String email, UserEntity owner) {
        List<ClientsEntity> results = em.createNamedQuery("ClientsEntity.findByEmailAndOwner", ClientsEntity.class)
                .setParameter("email", email)
                .setParameter("owner", owner)
                .getResultList();
        return !results.isEmpty();
    }

    public Long getOwnerIdOfClient(Long clientId) {
        ClientsEntity client = em.find(ClientsEntity.class, clientId);
        if (client == null) throw new WebApplicationException(404);
        return client.getOwner().getId();
    }

    public List<ClientsDTO> listDeletedClientsByUser(Long userId) {
        return toDTOList(clientsDao.findDeletedByOwner(userId));
    }

    public boolean emptyClientsTrash(Long userId) {
        if (userId != null) {
            List<ClientsEntity> clients = clientsDao.findDeletedByOwner(userId);
            if (clients != null) {
                for (ClientsEntity c : clients) {
                    clientsDao.hardDelete(c.getId());
                }
                return true;
            }
        }
        return false;
    }

    public boolean emptyTrash(Long userId) {
        try {
            // Procura todos os clientes do utilizador que estão na lixeira
            List<ClientsEntity> trashList = clientsDao.findDeletedClientsByUser(userId);

            for (ClientsEntity c : trashList) {
                clientsDao.remove(c); // Remove fisicamente da BD
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean createClientForUser(Long userId, ClientsDTO dto) {
        try {
            // 1. Procurar o utilizador alvo diretamente via EntityManager
            UserEntity owner = em.find(UserEntity.class, userId);

            // Se o utilizador não existir, abortamos
            if (owner == null) {
                return false;
            }

            // 2. Validar se o email já existe para este utilizador (usando o método que já criaste)
            if (isEmailDuplicated(dto.getEmail(), owner)) {
                return false;
            }

            // 3. Criar e mapear a entidade
            ClientsEntity newClient = new ClientsEntity();
            newClient.setName(dto.getName());
            newClient.setEmail(dto.getEmail());
            newClient.setPhone(dto.getPhone());
            newClient.setOrganization(dto.getOrganization());
            newClient.setSoftDelete(false);

            // 4. Associar ao dono (Owner)
            newClient.setOwner(owner);

            // 5. Persistir usando o clientsDao que já tens injetado
            clientsDao.persist(newClient);

            return true;
        } catch (Exception e) {
            System.err.println("Erro ao criar cliente para utilizador: " + e.getMessage());
            return false;
        }
    }
}