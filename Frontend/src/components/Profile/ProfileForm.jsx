import React from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";

const ProfileForm = ({ formData, handleChange, handleSubmit, isOwnProfile, loading }) => (
  <Form onSubmit={handleSubmit}>
    <Row>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control name="firstName" value={formData.firstName || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Apelido</Form.Label><Form.Control name="lastName" value={formData.lastName || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control name="username" value={formData.username || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" value={formData.password || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group></Col>
    
    </Row>
    <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group>
    <Form.Group className="mb-3"><Form.Label>Telemóvel</Form.Label><Form.Control name="cellphone" value={formData.cellphone || ""} onChange={handleChange} disabled={!isOwnProfile} required /></Form.Group>
    <Form.Group className="mb-4"><Form.Label>URL da Foto</Form.Label><Form.Control name="photoUrl" value={formData.photoUrl || ""} onChange={handleChange} disabled={!isOwnProfile} /></Form.Group>
    {isOwnProfile && (
      <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={loading}>
        {loading ? <Spinner size="sm" /> : "Guardar Alterações"}
      </Button>
    )}
  </Form>
);
export default ProfileForm;