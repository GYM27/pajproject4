import React from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";

const FormContainer = ({ title, icon, loading, onSubmit, onCancel, children }) => (
    <Container className="mt-4">
        <Row className="justify-content-center">
            <Col md={8} lg={6}>
                <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                        <h3 className="mb-4 fw-bold text-primary">
                            <i className={`bi ${icon} me-2`}></i>{title}
                        </h3>
                        <form onSubmit={onSubmit}>
                            {children}
                            <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-4">
                                <Button variant="outline-secondary" onClick={onCancel}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner size="sm" className="me-2" /> : null}
                                    {loading ? "A guardar..." : "Gravar"}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
);

export default FormContainer;