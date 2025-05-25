import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente RutaProtegida
const RutaProtegida = ({ children }) => {
    // Verificar si el token está presente en localStorage
    const token = localStorage.getItem('authToken');

    // Si no hay token, redirigir a la página de inicio de sesión
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si hay token, renderizar el contenido protegido
    return children;
};

export default RutaProtegida;
