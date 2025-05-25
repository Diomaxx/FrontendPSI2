import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { promoteUserToAdmin } from "../../Services/adminService.js";

const PromotionUserRow = ({ user, onPromoteUser, isLoading }) => {
    // Handle the promotion action
    const handlePromoteUser = () => {
        onPromoteUser(user);
    };

    return (
        <tr className="glass-panel" style={{backgroundColor: 'rgba(1, 3, 26, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <td className="p-3">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle me-3" style={{width: '10px', height: '10px', backgroundColor: 'rgb(102, 147, 194)'}}></div>
                    <div>
                        <h6 className="text-white fw-bold mb-0">{user.nombre} {user.apellido}</h6>
                        <small className="text-light opacity-75">Candidato a Administrador</small>
                    </div>
                </div>
            </td>
            <td className="p-3">
                <span className="text-white">{user.ci}</span>
            </td>
            <td className="p-3">
                <span className="text-white">
                    {user.telefono || 'No especificado'}
                </span>
            </td>
            <td className="p-3">
                <span className="text-white text-truncate" style={{maxWidth: '200px', display: 'inline-block'}} title={user.correoElectronico}>
                    {user.correoElectronico || 'No especificado'}
                </span>
            </td>
            <td className="p-3">
                <span className={`badge ${user.active ? 'bg-success' : 'bg-secondary'}`}
                      style={{
                          padding: "4px 8px",
                          borderRadius: "50px",
                          fontSize: "0.7rem"
                      }}>
                    {user.active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="p-3">
                <button
                    className="btn btn-sm px-3 text-light fw-medium"
                    onClick={handlePromoteUser}
                    disabled={isLoading}
                    style={{
                        backgroundColor: 'rgb(25, 73, 115)',
                        borderColor: 'rgb(59, 119, 157)',
                        borderRadius: "6px",
                        transition: "all 0.2s ease"
                    }}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Promoviendo...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-person-badge me-1"></i>
                            Hacer Admin
                        </>
                    )}
                </button>
            </td>
        </tr>
    );
};

const ConfirmationModal = ({ show, user, onConfirm, onCancel, isLoading }) => {
    if (!show || !user) return null;

    return (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="glass-modal modal-content border-0"
                     style={{
                         backgroundColor: 'rgba(0, 0, 0, 0.8)',
                         backdropFilter: 'blur(10px)',
                         borderRadius: '16px',
                         border: '1px solid rgba(255, 255, 255, 0.1)'
                     }}>
                    
                    {/* Modal header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title text-white fw-bold">
                            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                            Confirmar Promoción a Administrador
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onCancel}
                            disabled={isLoading}
                        ></button>
                    </div>
                    
                    {/* Modal body */}
                    <div className="modal-body">
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>¡Atención!</strong> Esta acción no se puede deshacer.
                        </div>
                        
                        <p className="text-white mb-3">
                            ¿Está seguro que desea promover al siguiente usuario a administrador?
                        </p>
                        
                        {/* User details in modal */}
                        <div className="glass-panel p-3 mb-3"
                             style={{
                                 borderRadius: "8px",
                                 backgroundColor: 'rgba(255, 255, 255, 0.05)'
                             }}>
                            <div className="row">
                                <div className="col-6">
                                    <small className="text-light opacity-75">Nombre:</small>
                                    <p className="text-white mb-2 fw-medium">
                                        {user.nombre} {user.apellido}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <small className="text-light opacity-75">CI:</small>
                                    <p className="text-white mb-2 fw-medium">{user.ci}</p>
                                </div>
                                {user.telefono && (
                                    <div className="col-6">
                                        <small className="text-light opacity-75">Teléfono:</small>
                                        <p className="text-white mb-2 fw-medium">{user.telefono}</p>
                                    </div>
                                )}
                                {user.correoElectronico && (
                                    <div className={user.telefono ? "col-6" : "col-12"}>
                                        <small className="text-light opacity-75">Email:</small>
                                        <p className="text-white mb-0 fw-medium">{user.correoElectronico}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-light opacity-75 small mb-0">
                            El usuario obtendrá permisos completos de administrador del sistema.
                        </p>
                    </div>
                    
                    {/* Modal footer */}
                    <div className="modal-footer border-0 pt-0">
                        <button 
                            type="button" 
                            className="btn btn-outline-light me-2" 
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-warning text-dark fw-medium" 
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Promoviendo...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Confirmar Promoción
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PromotionManager = ({ users, onUserUpdated }) => {
    // State for managing modal and loading states
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // State for search functionality
    const [searchTerm, setSearchTerm] = useState('');

    // Handle opening the confirmation modal
    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        if (!isLoading) {
            setShowModal(false);
            setSelectedUser(null);
        }
    };

    // Handle confirming the promotion
    const handleConfirmPromotion = async () => {
        if (!selectedUser) return;

        try {
            setIsLoading(true);
            
            // Call the API to promote user
            await promoteUserToAdmin(selectedUser.idUsuario);
            
            // Refresh the users list
            onUserUpdated();
            
            // Close modal
            setShowModal(false);
            setSelectedUser(null);
            
            // Show success message
            alert(`${selectedUser.nombre} ${selectedUser.apellido} ha sido promovido a administrador exitosamente.`);
            
        } catch (error) {
            console.error("Error promoting user:", error);
            alert("Error al promover el usuario. Intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter users that are not already admins and apply search filter
    const eligibleUsers = users.filter(user => !user.admin);
    
    const filteredUsers = eligibleUsers.filter(user => {
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
                <div className="col-12 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(25, 73, 115, 0.3)'}}>
                        <h4 className="fw-bold mb-1" style={{color: 'rgb(102, 147, 194)'}}>
                            {filteredUsers.length}
                        </h4>
                        <small className="text-light opacity-75">
                            {searchTerm ? 'Resultados Encontrados' : 'Usuarios Elegibles'}
                        </small>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(40, 167, 69, 0.2)'}}>
                        <h4 className="text-success fw-bold mb-1">
                            {filteredUsers.filter(u => u.active).length}
                        </h4>
                        <small className="text-light opacity-75">Activos</small>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(108, 117, 125, 0.2)'}}>
                        <h4 className="text-secondary fw-bold mb-1">
                            {filteredUsers.filter(u => !u.active).length}
                        </h4>
                        <small className="text-light opacity-75">Inactivos</small>
                    </div>
                </div>
            </div>

            {/* Information alert */}
            <div className="alert alert-info mb-4" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Información:</strong> Solo se muestran usuarios que no son administradores. 
                Los usuarios promovidos desaparecerán de esta lista.
            </div>

            {/* Users table */}
            {sortedUsers.length > 0 ? (
                <div className="glass-panel" style={{borderRadius: '16px', overflow: 'hidden'}}>
                    <table className="table table-dark mb-0">
                        <thead style={{backgroundColor: 'rgba(25, 73, 115, 0.3)', borderBottom: '2px solid rgb(59, 119, 157)'}}>
                            <tr>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-person me-2"></i>Usuario
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-card-text me-2"></i>CI
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-telephone me-2"></i>Teléfono
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-envelope me-2"></i>Email
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-activity me-2"></i>Estado
                                </th>
                                <th className="p-3 fw-bold text-center" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-gear me-2"></i>Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(user => (
                                <PromotionUserRow
                                    key={user.idUsuario}
                                    user={user}
                                    onPromoteUser={handleOpenModal}
                                    isLoading={isLoading && selectedUser?.idUsuario === user.idUsuario}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel p-5 text-center" style={{borderRadius: '16px'}}>
                    <i className="bi bi-search text-light opacity-50" style={{fontSize: '3rem'}}></i>
                    <p className="text-light opacity-75 mt-3 mb-0">
                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios elegibles para promoción'}
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

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={showModal}
                user={selectedUser}
                onConfirm={handleConfirmPromotion}
                onCancel={handleCloseModal}
                isLoading={isLoading}
            />
        </div>
    );
};

export default PromotionManager;