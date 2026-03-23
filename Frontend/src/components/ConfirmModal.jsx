import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, onHide, onConfirm, title, message, variant = "danger" }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        {/* Ícone dinâmico baseado na variante (danger para apagar, warning para avisos) */}
        <i className={`bi ${variant === 'danger' ? 'bi-exclamation-octagon' : 'bi-exclamation-triangle'} text-${variant} display-4 mb-3`}></i>
        <p className="fs-5 text-secondary">{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pb-4">
        <Button variant="outline-secondary" onClick={onHide} className="px-4">
          Cancelar
        </Button>
        <Button variant={variant} onClick={onConfirm} className="px-4 fw-bold">
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;