import React from 'react';
import { Modal } from 'react-bootstrap';

const DynamicModal = ({ show, onHide, title, children }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/*  O HTML/Componentes  vão aparecer aqui */}
        {children}
      </Modal.Body>
    </Modal>
  );
};

export default DynamicModal;