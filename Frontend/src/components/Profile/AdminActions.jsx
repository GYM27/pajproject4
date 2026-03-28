import React from "react";
import { Button } from "react-bootstrap";


const AdminActions = ({ onHardDelete }) => {
  
  return (
    <div className="d-flex flex-column gap-2 mt-4 border-top pt-4">
          <Button variant="danger" className="mt-2" onClick={onHardDelete}>Apagar Utilizador Permanente</Button>
    </div>
  );
};
export default AdminActions;