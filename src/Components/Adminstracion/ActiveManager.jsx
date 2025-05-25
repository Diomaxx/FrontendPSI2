import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toggleUserActiveStatus } from "../../Services/adminService.js";

const UserCard = ({ user, onToggleStatus, isLoading }) => {
    // Handle the toggle status action
    const handleToggleStatus = async () => {
        await onToggleStatus(user.idUsuario);
    };

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-3">
            <div className="glass-card p-3 h-100 position-relative"
                 style={{
                     borderRadius: "16px",
                     transition: "transform 0.2s ease, box-shadow 0.2s ease"
                 }}>
                
                {/* Status indicator bar */}
                <div className="position-absolute top-0 start-0 h-100"
                     style={{
                         width: "4px",
                         backgroundColor: user.active ? "#28a745" : "#6c757d",
                         borderRadius: "16px 0 0 16px"
                     }}></div>

                {/* User information section */}
                <div className="ps-3">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="text-white fw-bold mb-0">
                            {user.nombre} {user.apellido}
                        </h6>
                        <span className={`badge ${user.active ? 'bg-success' : 'bg-secondary'}`}
                              style={{
                                  padding: "4px 8px",
                                  borderRadius: "50px",
                                  fontSize: "0.7rem"
                              }}>
                            {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* User details */}
                    <div className="mb-2">
                        <small className="text-light opacity-75">CI:</small>
                        <p className="text-white mb-1 small">{user.ci}</p>
                    </div>

                    {user.telefono && (
                        <div className="mb-2">
                            <small className="text-light opacity-75">Teléfono:</small>
                            <p className="text-white mb-1 small">{user.telefono}</p>
                        </div>
                    )}

                    {user.correoElectronico && (
                        <div className="mb-3">
                            <small className="text-light opacity-75">Email:</small>
                            <p className="text-white mb-0 small text-truncate" title={user.correoElectronico}>
                                {user.correoElectronico}
                            </p>
                        </div>
                    )}

                    {/* Action button */}
                    <div className="d-flex justify-content-end">
                        <button
                            className={`btn btn-sm px-3 ${
                                user.active 
                                    ? 'btn-outline-light' 
                                    : 'btn-light text-dark'
                            }`}
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            style={{
                                borderRadius: "6px",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className={`bi ${user.active ? 'bi-toggle-off' : 'bi-toggle-on'} me-1`}></i>
                                    {user.active ? 'Desactivar' : 'Activar'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActiveManager = ({ users, onUserUpdated }) => {
    // State for tracking loading status of individual users
    const [loadingUsers, setLoadingUsers] = useState(new Set());
    // State for search functionality
    const [searchTerm, setSearchTerm] = useState('');

    // Handle status toggle for a specific user
    const handleToggleUserStatus = async (userId) => {
        try {
            // Add user to loading set
            setLoadingUsers(prev => new Set([...prev, userId]));
            
            // Call the API to toggle status
            await toggleUserActiveStatus(userId);
            
            // Refresh the users list
            onUserUpdated();
            
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Error al cambiar el estado del usuario. Intente nuevamente.");
        } finally {
            // Remove user from loading set
            setLoadingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter and sort users for display based on search term
    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        const ci = user.ci?.toString().toLowerCase() || '';
        const email = user.correoElectronico?.toLowerCase() || '';
        const telefono = user.telefono?.toString().toLowerCase() || '';
        
        return fullName.includes(searchLower) || 
               ci.includes(searchLower) || 
               email.includes(searchLower) ||
               telefono.includes(searchLower);
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        // Sort by active status first (active users first), then by name
        if (a.active !== b.active) {
            return b.active - a.active;
        }
        return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
    });

    return (
        <div>
            {/* Search Controls */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="glass-panel p-3" style={{borderRadius: '12px'}}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-search me-2" style={{color: 'rgb(102, 147, 194)', fontSize: '1.2rem'}}></i>
                                <h6 className="text-white fw-bold mb-0">Buscar Usuarios</h6>
                            </div>
                            <div className="flex-grow-1">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre, apellido, CI, teléfono o email..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgb(59, 119, 157)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        padding: '8px 12px'
                                    }}
                                />
                            </div>
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        borderColor: 'rgb(59, 119, 157)',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary statistics */}
            <div className="row mb-4">
                <div className="col-6 col-md-3">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                        <h4 className="text-white fw-bold mb-1">{filteredUsers.length}</h4>
                        <small className="text-light opacity-75">
                            {searchTerm ? 'Resultados Encontrados' : 'Total Usuarios'}
                        </small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(40, 167, 69, 0.2)'}}>
                        <h4 className="text-success fw-bold mb-1">
                            {filteredUsers.filter(u => u.active).length}
                        </h4>
                        <small className="text-light opacity-75">Activos</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(108, 117, 125, 0.2)'}}>
                        <h4 className="text-secondary fw-bold mb-1">
                            {filteredUsers.filter(u => !u.active).length}
                        </h4>
                        <small className="text-light opacity-75">Inactivos</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(25, 73, 115, 0.3)'}}>
                        <h4 className="fw-bold mb-1" style={{color: 'rgb(102, 147, 194)'}}>
                            {loadingUsers.size}
                        </h4>
                        <small className="text-light opacity-75">Procesando</small>
                    </div>
                </div>
            </div>

            {/* Users grid */}
            {sortedUsers.length > 0 ? (
                <div className="row">
                    {sortedUsers.map(user => (
                        <UserCard
                            key={user.idUsuario}
                            user={user}
                            onToggleStatus={handleToggleUserStatus}
                            isLoading={loadingUsers.has(user.idUsuario)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-search text-light opacity-50" style={{fontSize: '3rem'}}></i>
                    <p className="text-light opacity-75 mt-3 mb-0">
                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
                    </p>
                    {searchTerm && (
                        <button
                            className="btn btn-outline-light btn-sm mt-2"
                            onClick={() => setSearchTerm('')}
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActiveManager;