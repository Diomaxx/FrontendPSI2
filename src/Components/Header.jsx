import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ showLogout = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bgStyle, setBgStyle] = useState({});

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const path = location.pathname;
        if (path === '/login' || path === '/registrate') {
            setBgStyle({
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
            });
        } else if (path === '/solicitudes' || path === '/donaciones' || path === '/solicitar' || path === '/seguimiento' || path === '/metricas') {
            setBgStyle({
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
            });
        } else {
            setBgStyle({
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',

            });
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <header className="p-2 p-md-3 d-flex flex-column flex-md-row align-items-center justify-content-between"
                style={bgStyle}>
            <div className="ms-md-3 col-12 col-md-auto mb-2 mb-md-0 text-center text-md-start">
                <Link to="/login" className="d-inline-block">
                    <img src="/logoMIN.png" alt="Logo" style={{maxHeight: '50px', height: '100%'}} className="img-fluid" />
                </Link>
            </div>
            <nav className="col-12 col-md-auto d-flex flex-wrap justify-content-center justify-content-md-end align-items-center">
                <Link
                    to="/solicitar"
                    className={`mx-2 mx-md-3 my-1 px-2 text-decoration-none fw-medium ${isActive('/solicitar')
                        ? 'text-white border-bottom border-2 border-warning pb-1'
                        : 'text-light opacity-75 hover-effect'}`}
                >
                    Solicitar
                </Link>
                <Link
                    to="/solicitudes"
                    className={`mx-2 mx-md-3 my-1 px-2 text-decoration-none fw-medium ${isActive('/solicitudes')
                        ? 'text-white border-bottom border-2 border-warning pb-1'
                        : 'text-light opacity-75 hover-effect'}`}
                >
                    Solicitudes
                </Link>
                <Link
                    to="/donaciones"
                    className={`mx-2 mx-md-3 my-1 px-2 text-decoration-none fw-medium ${isActive('/donaciones')
                        ? 'text-white border-bottom border-2 border-warning pb-1'
                        : 'text-light opacity-75 hover-effect'}`}
                >
                    Donaciones
                </Link>
                <Link
                    to="/seguimiento"
                    className={`mx-2 mx-md-3 my-1 px-2 text-decoration-none fw-medium ${isActive('/seguimiento')
                        ? 'text-white border-bottom border-2 border-warning pb-1'
                        : 'text-light opacity-75 hover-effect'}`}
                >
                    Seguimiento
                </Link>
                <Link
                    to="/metricas"
                    className={`mx-2 mx-md-3 my-1 px-2 text-decoration-none fw-medium ${isActive('/metricas')
                        ? 'text-white border-bottom border-2 border-warning pb-1'
                        : 'text-light opacity-75 hover-effect'}`}
                >
                    Dashboard
                </Link>

                {showLogout && (
                    <button
                        className="btn btn-sm btn-warning ms-3 me-md-4 px-3 py-2 fw-medium text-dark rounded-pill"
                        onClick={handleLogout}
                        style={{
                            borderRadius: '4px',
                            border: 'none',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        Cerrar sesión
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Header;