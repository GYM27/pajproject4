import React, {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Container, Card, Button, Row, Col} from "react-bootstrap";
import {useLeadStore} from "../../stores/LeadsStore";
import {useUserStore} from "../../stores/UserStore";

// Importa os componentes do novo sistema de Modais
import DynamicModal from "../../Modal/DynamicModal.jsx";
import EditLeadForm from "./EditLeadForm";

const LeadDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {leads, deleteLead, fetchMyLeads} = useLeadStore();
    const userRole = useUserStore((state) => state.userRole);

    // Estado unificado para os Modais (tal como no Leads.jsx)
    const [modalConfig, setModalConfig] = useState({
        show: false,
        title: "",
        type: null,
        data: null,
    });

    const lead = leads.find((l) => String(l.id) === String(id));

    const closeModal = () => setModalConfig({...modalConfig, show: false});

    const openEdit = () => {
        setModalConfig({
            show: true,
            title: "Editar Lead",
            type: "EDIT",
            data: lead,
        });
    };

    const openDelete = () => {
        setModalConfig({
            show: true,
            title: "Confirmar Eliminação",
            type: "DELETE",
            data: lead,
        });
    };

    const handleConfirmDelete = async () => {
        const success = await deleteLead(id, userRole);
        if (success) {
            closeModal();
            navigate("/leads");
        }
    };

    if (!lead)
        return (
            <Container className="mt-4">
                <p>Lead não encontrada.</p>
            </Container>
        );

    return (
        <Container className="mt-4">
            <Button
                variant="link"
                onClick={() => navigate("/leads")}
                className="mb-3 p-0"
            >
                <i className="bi bi-arrow-left"></i> Voltar para a lista
            </Button>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h2 className="fw-bold mb-4">{lead.title}</h2>
                    <Row className="mb-4">
                        <Col md={12}>
                            <h5>Descrição</h5>
                            <p className="bg-light p-3 rounded">
                                {lead.description || "Sem descrição."}
                            </p>
                            <p className="text-muted small">
                                Criada em: {lead.formattedDate}
                            </p>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button variant="outline-primary" onClick={openEdit}>
                            <i className="bi bi-pencil"></i> Editar
                        </Button>
                        <Button variant="danger" onClick={openDelete}>
                            <i className="bi bi-trash"></i> Apagar
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* MODAL DINÂMICO REUTILIZADO */}
            <DynamicModal
                show={modalConfig.show}
                onHide={closeModal}
                title={modalConfig.title}
            >
                {modalConfig.type === "EDIT" && (
                    <EditLeadForm
                        leadData={modalConfig.data}
                        onSuccess={() => {
                            // Atualiza a store para refletir as mudanças no ecrã de detalhes
                            fetchMyLeads(userRole);
                            closeModal();
                        }}
                        onCancel={closeModal}
                    />
                )}

                {modalConfig.type === "DELETE" && (
                    <div>
                        <p>
                            Tem a certeza que deseja apagar a lead{" "}
                            <strong>{lead.title}</strong>?
                        </p>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Confirmar
                            </Button>
                        </div>
                    </div>
                )}
            </DynamicModal>
        </Container>
    );
};

export default LeadDetails;
