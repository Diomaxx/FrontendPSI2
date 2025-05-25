import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Style.css";
import Header from "../Common/Header.jsx";
import ActiveManager from "./ActiveManager.jsx";
import PromotionManager from "./PromotionManager.jsx";
import { fetchNonAdminUsers } from "../../Services/adminService.js";

const AdminPanel = () => {
    // State management for users data and loading states
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('status'); // 'status' or 'promotion'

    const handleRefreshUsers = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const usersData = await fetchNonAdminUsers();
                setUsers(usersData);
            } catch (err) {
                console.error("Error loading users:", err);
                setError("Error al cargar los usuarios. Intente nuevamente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [refreshTrigger]);

    return (
        <div className="list-div">
            {/* Header component for navigation */}
            <Header />
            
            <div className="container-fluid px-3 px-md-5 py-4">
                {/* Page title section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="glass-card p-4 text-center">
                            <h1 className="text-white fw-bold mb-3">
                                <i className="bi bi-shield-check me-3"></i>
                                Panel de Administración
                            </h1>
                            <p className="text-light opacity-75 mb-4">
                                Gestión de usuarios y permisos del sistema
                            </p>
                            
                            {/* Tab Navigation */}
                            <div className="d-flex justify-content-center">
                                <div className="btn-group" role="group" style={{borderRadius: '12px', overflow: 'hidden'}}>
                                    <button
                                        type="button"
                                        className={`btn px-4 py-2 fw-medium ${
                                            activeTab === 'status' 
                                                ? 'text-light' 
                                                : 'btn-outline-light text-light'
                                        }`}
                                        onClick={() => handleTabChange('status')}
                                        style={{
                                            borderRadius: '12px 0 0 12px',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: activeTab === 'status' ? 'rgb(25, 73, 115)' : 'transparent',
                                            border: activeTab === 'status' ? '2px solid rgb(59, 119, 157)' : '2px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        <i className="bi bi-toggle-on me-2"></i>
                                        Gestión de Estado
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn px-4 py-2 fw-medium ${
                                            activeTab === 'promotion' 
                                                ? 'text-light' 
                                                : 'btn-outline-light text-light'
                                        }`}
                                        onClick={() => handleTabChange('promotion')}
                                        style={{
                                            borderRadius: '0 12px 12px 0',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: activeTab === 'promotion' ? 'rgb(25, 73, 115)' : 'transparent',
                                            border: activeTab === 'promotion' ? '2px solid rgb(59, 119, 157)' : '2px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        <i className="bi bi-person-badge me-2"></i>
                                        Promoción Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="row">
                        <div className="col-12">
                            <div className="glass-card p-4 text-center">
                                <div className="spinner-border text-warning" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="text-white mt-3 mb-0">Cargando usuarios...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="glass-card p-4">
                                <div className="alert alert-danger mb-0" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main content when data is loaded */}
                {!loading && !error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="glass-card p-0" style={{borderRadius: '16px', overflow: 'hidden'}}>
                                {/* Tab Content Container */}
                                <div className="position-relative">
                                    {/* Status Management Tab */}
                                    <div 
                                        className={`tab-content ${activeTab === 'status' ? 'active' : ''}`}
                                        style={{
                                            display: activeTab === 'status' ? 'block' : 'none'
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle p-3 me-3" style={{width: '50px', height: '50px', backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        <i className="bi bi-toggle-on text-light" style={{fontSize: '1.5rem'}}></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white fw-bold mb-1">Gestión de Estado de Usuarios</h3>
                                                        <p className="text-light opacity-75 mb-0 small">
                                                            Activar o desactivar usuarios en el sistema
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge text-light px-3 py-2" style={{backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        {users.length} Usuarios
                                                    </span>
                                                </div>
                                            </div>
                                            <ActiveManager
                                                users={users} 
                                                onUserUpdated={handleRefreshUsers}
                                            />
                                        </div>
                                    </div>

                                    {/* Promotion Management Tab */}
                                    <div 
                                        className={`tab-content ${activeTab === 'promotion' ? 'active' : ''}`}
                                        style={{
                                            display: activeTab === 'promotion' ? 'block' : 'none'
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle p-3 me-3" style={{width: '50px', height: '50px', backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        <i className="bi bi-person-badge text-light" style={{fontSize: '1.5rem'}}></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white fw-bold mb-1">Promoción a Administrador</h3>
                                                        <p className="text-light opacity-75 mb-0 small">
                                                            Otorgar permisos de administrador a usuarios del sistema
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge text-light px-3 py-2" style={{backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        {users.filter(u => !u.admin).length} Elegibles
                                                    </span>
                                                </div>
                                            </div>
                                            <PromotionManager
                                                users={users} 
                                                onUserUpdated={handleRefreshUsers}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel; 