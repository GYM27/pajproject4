import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

const ActionButton = ({ icon, variant, onClick, tooltip, size = "sm", disabled = false }) => {
    const button = (
        <Button
            variant={`outline-${variant}`}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className="p-1 d-flex align-items-center justify-content-center"
            style={{ width: "30px", height: "30px" }}
        >
            <i className={`bi ${icon}`} style={{ fontSize: "0.9rem" }}></i>
        </Button>
    );

    if (!tooltip) return button;

    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            {button}
        </OverlayTrigger>
    );
};

export default ActionButton;