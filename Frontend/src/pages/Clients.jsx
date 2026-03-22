import { useNavigate } from "react-router-dom";
import { useClientStore } from "../stores/ClientsStore";
import { useEffect, useState } from "react";
import { Container, Button, Spinner } from 'react-bootstrap';

const Clients = () => {
    const { clients, loading, fetchMyClients, deleteClient } = useClientStore();
    const navigate = useNavigate();
    const [openCardId, setOpenCardId] = useState(null);

    useEffect(() => {
        fetchMyClients();
    }, [fetchMyClients]);

    const toggleCard = (id) => {
        setOpenCardId(openCardId === id ? null : id);
    };

    // 1. Se estiver a carregar, mostra APENAS o loading
    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" variant="primary" />
                <p>A carregar clientes...</p>
            </Container>
        );
    }

    // 2. Se não estiver a carregar, mostra a página real
    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Gestão de Clientes</h3>
                <Button variant="primary" onClick={() => navigate('/clients/new')}>
                    + Novo Cliente
                </Button>
            </div>

            <div className="lista-clientes">
                {clients.length === 0 ? (
                    <p>Ainda não tens clientes registados.</p>
                ) : (
                    clients.map((client) => (
                        <div 
                            key={client.id} 
                            className={`clientes-card ${openCardId === client.id ? 'aberto' : 'fechado'}`}
                            onClick={() => toggleCard(client.id)}
                        >
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <strong className="org-name">{client.organization || "Sem Organização"}</strong>
                                <i className={`fa-solid fa-chevron-down seta ${openCardId === client.id ? 'rodada' : ''}`}></i>
                            </div>

                            <div className="card-detalhes">
                                <hr />
                                <p><strong>Responsável:</strong> {client.name}</p>
                                <p><strong>Email:</strong> {client.email}</p>
                                <p><strong>Telefone:</strong> {client.phone}</p>
                                
                                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                        variant="outline-primary" 
                                        className="me-2"
                                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                                    >
                                        Editar
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={() => {
                                            if(window.confirm("Apagar este cliente?")) deleteClient(client.id)
                                        }}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Container>
    );
};

export default Clients;