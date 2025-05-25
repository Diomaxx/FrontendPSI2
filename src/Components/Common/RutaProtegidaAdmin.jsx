import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminStatus } from '../../Services/authService.js';

/**
 * Protected route component for admin-only pages
 * Checks both authentication token and admin status
 * Redirects to login if not authenticated, or to dashboard if not admin
 */
const RutaProtegidaAdmin = ({ children }) => {
    // Check if user has authentication token
    const token = localStorage.getItem('authToken');
    
    // Check if user has admin privileges
    const isAdmin = getAdminStatus();
    
    // If no token, redirect to login
    if (!token) {
        console.log('RutaProtegidaAdmin: No hay token, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }
    
    // If token exists but user is not admin, redirect to dashboard
    if (!isAdmin) {
        console.log('RutaProtegidaAdmin: Usuario no es administrador, redirigiendo a dashboard');
        return <Navigate to="/donaciones" replace />;
    }
    
    // If user is authenticated and is admin, render the protected component
    console.log('RutaProtegidaAdmin: Usuario autorizado como administrador');
    return children;
};

export default RutaProtegidaAdmin; 