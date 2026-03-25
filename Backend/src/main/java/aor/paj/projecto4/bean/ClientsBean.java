package aor.paj.projecto4.bean;

import java.util.List;
import java.util.stream.Collectors;

import aor.paj.projecto4.dao.ClientsDao;
import aor.paj.projecto4.dao.UserDao;
import aor.paj.projecto4.dto.ClientsDTO;
import aor.paj.projecto4.entity.ClientsEntity;
import aor.paj.projecto4.entity.UserEntity;
import aor.paj.projecto4.utils.UserRoles;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;


@Stateless
public class ClientsBean {

    @Inject
    TokenBean tokenBean;

    @Inject
    ClientsDao clientsDao;

    @Inject
    UserDao userDao;


    public ClientsBean() {
            }

    // --- MÉTODOS DE CONVERSÃO (Helper) ---
    // Centralizar construçao de DTO  Entity to DTO
    private ClientsDTO toDTO(ClientsEntity entity) {
        ClientsDTO dto = new ClientsDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setOrganization(entity.getOrganization());
        return dto;
    }

    //DTO para Entity do zero
    private ClientsEntity toEntity(ClientsDTO dto, UserEntity owner) {
        ClientsEntity entity = new ClientsEntity();
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setOrganization(dto.getOrganization());
        entity.setOwner(owner);
        entity.setSoftDelete(false);
        return entity;
    }

    // meetodo para editar um cliente e nao mexer no owner nem no softdelete
    private void updateEntityFromDTO(ClientsEntity entity, ClientsDTO dto) {
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setOrganization(dto.getOrganization());

    }

    /**
     * Converte uma lista de Entidades (Base de Dados) para uma lista de DTOs (Frontend).
     */
    private List<ClientsDTO> toDTOList(List<ClientsEntity> entities) {
        return entities.stream() // 1. Cria um "fluxo" de dados a partir da lista de entidades
                .map(this::toDTO) // 2. Para cada entidade no fluxo, chama o teu método 'toDTO' para a transformar
                .collect(Collectors.toList()); // 3. Reagrupa todos os DTOs transformados numa nova Lista
    }

    // --- MÉTODOS DE ESCRITA ---

    public ClientsDTO addClient(String token, ClientsDTO dto) {
        // 1. Obtém o dono através do token (o Service já garantiu que o token é válido)
        UserEntity owner = tokenBean.getUserEntityByToken(token);

        // 2. Transforma o DTO numa Entity pronta para a BD
        // O teu método toEntity já define o owner e o softDelete = false
        ClientsEntity newClient = toEntity(dto, owner);

        // 3. Persiste na Base de Dados
        // Se o email for duplicado para este owner, a BD lança uma exceção.
        // O GenericExceptionMapper apanha e envia o ErrorResponse(409/400)
        clientsDao.persist(newClient);

        // 4. Retorna o DTO com o ID que a base de dados acabou de gerar
        return toDTO(newClient);
    }

    public ClientsDTO editClient(Long clientId, ClientsDTO dto) {
        // 1. Procura a entidade existente
        ClientsEntity client = clientsDao.find(clientId);

        // 2. Valida se o cliente existe e não está na lixeira
        if (client == null || client.isSoftDelete()) {
            throw new WebApplicationException("Cliente não encontrado", Response.Status.NOT_FOUND);
        }

        // 3. Atualiza os campos permitidos (O Owner NUNCA é alterado aqui)
        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setOrganization(dto.getOrganization());

        clientsDao.merge(client);

        // 4. Converte para DTO e devolve
        // Se houver conflito de email na BD, o GenericExceptionMapper envia o erro 409
        return toDTO(client);
    }

    // --- MÉTODOS DE LISTAGEM (DTO) ---

     /**
     * Lista todos os clientes ativos associados ao utilizador do token.
     * Utiliza Streams para transformar Entidades em DTOs de forma eficiente e segura.
     */
    public List<ClientsDTO> listClients(String token, Long userId) {
        // 1. Quem está a pedir? (O Verifier já validou, mas precisamos da entidade aqui)
        UserEntity requester = tokenBean.getUserEntityByToken(token);
        if (requester == null) {
            throw new WebApplicationException("Sessão inválida", Response.Status.UNAUTHORIZED);
        }

        // 2. Definir o filtro de ID (A lógica de "Poder")
        Long filterId = userId;

        // Se NÃO for Admin, ignoramos o userId que veio do React e forçamos o dele
        if (requester.getUserRole() != UserRoles.ADMIN) {
            filterId = requester.getId();
        }

        // 3. Buscar na BD (O DAO decide se filtra por ID ou traz tudo se for null)
        List<ClientsEntity> entities = clientsDao.findActiveWithOptionalFilter(filterId);

        // 4. Converter usando o teu Helper toDTOList (Limpeza total!)
        return toDTOList(entities);
    }

    public List<ClientsDTO> listDeletedClientsDTO(String token) {
        UserEntity user = tokenBean.getUserEntityByToken(token);
        if (user == null) throw new WebApplicationException(401);

        return toDTOList(clientsDao.findDeletedByOwner(user.getId()));
    }

    /**
     * Requisito A6: Devolve a lista de clientes ativos de um utilizador específico (para Admin).
     */
    public List<ClientsDTO> listClientsByUser(Long userId) {
        // 1. Procurar o utilizador alvo na base de dados pelo ID (usando o UsersDao)
        // Aqui não usamos o token, pois o Admin quer ver os clientes de OUTRO utilizador
        UserEntity targetOwner = userDao.find(userId);

        if (targetOwner == null) {
            throw new WebApplicationException(Response.status(404).entity("Utilizador não encontrado.").build());
        }

        // 2. Chamar o método do DAO que já criámos e que aceita a Entity
        List<ClientsEntity> entities = clientsDao.findActiveByOwner(targetOwner);

        // 3. Converter a lista de entidades para DTOs (usando o teu método privado)
        return toDTOList(entities);
    }

    // --- MÉTODOS DE ELIMINAÇÃO/RESTAURO ---

    public ClientsDTO softDeleteClient(Long clientId) {
        // Procura a entidade na Base de Dados
        ClientsEntity client = clientsDao.find(clientId);
        // Verificação de Existência e Estado
        // Se o cliente não existir ou já estiver apagado, lançamos 404.
        // O GenericExceptionMapper vai criar o ErrorResponse
        if (client == null || client.isSoftDelete()) {
            throw new WebApplicationException("Cliente nao encontrado");
        }
        // Execução da Operação
        client.setSoftDelete(true);

        // 4. Persistência Explícita (Crucial para o Teste Unitário)
        // Chamamos o merge para que o Mockito no teste possa "ver" esta ação
        clientsDao.merge(client);


        // Converte para DTO antes de devolver
        return toDTO(client);

        // O Hibernate/JPA fará o flush automático para a BD no final da transação
    }

    public ClientsDTO restoreClient(Long clientId) {
        ClientsEntity client = clientsDao.find(clientId);
        if (client == null) {
            throw new WebApplicationException("Cliente não encontrado", Response.Status.NOT_FOUND);
        }

        if (!client.isSoftDelete()) {
            throw new WebApplicationException("Cliente já se encontra em estado ativo",  Response.Status.CONFLICT);
        }

        client.setSoftDelete(false);
        clientsDao.merge(client);
        return toDTO(client);
    }

    public ClientsDTO permanentDeleteClient(Long clientId) {
        // 1. Procura a entidade
        ClientsEntity client = clientsDao.find(clientId);

        // 2. Valida existência
        if (client == null) {
            throw new WebApplicationException("Cliente não encontrado", Response.Status.NOT_FOUND);
        }

        // 3. Regra de Negócio: Só permitimos apagar permanentemente o que já passou pela "Lixeira"
        if (!client.isSoftDelete()) {
            throw new WebApplicationException("O cliente deve estar na lixeira antes de ser removido permanentemente", Response.Status.CONFLICT);
        }

        // 4. Mapeamos para DTO ANTES de remover, para poder devolver a informação ao Frontend
        ClientsDTO dto = toDTO(client);

        // 5. REMOÇÃO FÍSICA da Base de Dados
        clientsDao.remove(client);

        return dto;
    }

    // --- MÉTODOS EM MASSA ---


    /**
     * Apaga (soft delete) todos os clientes criados por um utilizador específico.
     */
    public void softDeleteAllClientsByUser(Long userId) {

        UserEntity targetOwner = userDao.find(userId);
        if (targetOwner == null) throw new WebApplicationException(404);

        List<ClientsEntity> clients = clientsDao.findActiveByOwner(targetOwner);
        for (ClientsEntity c : clients) {
            c.setSoftDelete(true);
            clientsDao.merge(c);
        }
    }

    /**
     * Restaura todos os clientes apagados de um utilizador específico.
     */
    public void unSoftDeleteAllClientsByUser(Long userId) {
        // 1. Validar utilizador alvo
        UserEntity targetOwner = userDao.find(userId);
        if (targetOwner == null) {
            throw new WebApplicationException("Utilizador não encontrado", Response.Status.NOT_FOUND);
        }

        // 2. Procurar apenas os clientes que estão atualmente na lixeira (softDelete = true)
        // Usamos o ID do utilizador para filtrar na NamedQuery que já tens
        List<ClientsEntity> deletedClients = clientsDao.findDeletedByOwner(userId);

        // 3. Se a lixeira estiver vazia, não há nada a fazer
        if (deletedClients.isEmpty()) {
            throw new WebApplicationException("O utilizador não tem clientes na lixeira para restaurar", Response.Status.NOT_MODIFIED);
        }

        // 4. Restaurar todos (O JPA faz o update automático no commit da transação)
        for (ClientsEntity c : deletedClients) {
            c.setSoftDelete(false);
            clientsDao.merge(c);
        }
    }

    // --- UTILITÁRIOS ---

    public boolean isEmailDuplicated(String email, UserEntity owner) {
        return clientsDao.isEmailDuplicated(email, owner);
    }

    public Long getOwnerIdOfClient(Long clientId) {
        ClientsEntity client = clientsDao.find(clientId);
        if (client == null) throw new WebApplicationException(404);
        return client.getOwner().getId();
    }

    public List<ClientsDTO> listDeletedClientsByUser(Long userId) {
        // 1. Validar se o utilizador "alvo" existe (Segurança de Dados)
        if (userDao.find(userId) == null) {
            throw new WebApplicationException("Utilizador não encontrado", Response.Status.NOT_FOUND);
        }
        // 2. A tua lógica original (Limpa e Eficiente)
        // O toDTOList é uma excelente prática para evitar loops espalhados pelo código.
        return toDTOList(clientsDao.findDeletedByOwner(userId));
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

    /**
     * Cria um cliente e atribui-o diretamente a um utilizador (Acesso Admin).
     */
    public ClientsDTO createClientForUser(Long userId, ClientsDTO dto) {
        // 1. Procurar o utilizador alvo (Melhor usar o DAO específico de User)
        UserEntity targetOwner = userDao.find(userId);

        // 2. Se o ID não existir, lançamos 404 (O GenericExceptionMapper trata o resto)
        if (targetOwner == null) {
            throw new WebApplicationException("Utilizador alvo não encontrado", Response.Status.NOT_FOUND);
        }

        // 3. Reutilizar o teu mapeador toEntity (Dono + softDelete=false)
        ClientsEntity newClient = toEntity(dto, targetOwner);

        // 4. Persistir (A BD valida a @UniqueConstraint email+owner)
        clientsDao.persist(newClient);

        // 5. Devolver o DTO (Padrão profissional: devolve o que foi criado)
        return toDTO(newClient);
    }
}