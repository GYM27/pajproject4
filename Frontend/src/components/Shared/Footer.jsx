import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer mt-auto py-3 bg-light border-top">
            <div className="container-fluid px-4">
                <div className="d-flex align-items-center justify-content-between small">
                    <div className="text-muted">
                        &copy; {currentYear} CRM Proj4 - Todos os direitos reservados.
                    </div>
                    <div>
                        <a href="#" className="text-decoration-none text-muted me-3">Política de Privacidade</a>
                        <a href="#" className="text-decoration-none text-muted">Termos & Condições</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;