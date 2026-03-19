import React from 'react';
import {useNavigate} from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "Utilizador";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    return (
        <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
            <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6" href="#">
                BRIDGE
            </a>
            <div className="navbar-nav w-100 d-flex flex-row justify-content-end align-items-center px-3">
                <span className="text-white me-3">Olá, {userName}</span>
                <div className="nav-item text-nowrap">
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;