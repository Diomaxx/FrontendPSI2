import axios from 'axios';


const API_URL = '/auth';
const USUARIO_URL = '/api/usuarios';

// Global variable to store the CI (subject) from token
export let globalCI = null;

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Error al iniciar sesión';
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${USUARIO_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Error al registrarse';
    }
};

// Function to parse and decode JWT tokens
export const parseJwt = (token) => {
    try {
        // Split the token into its parts (header, payload, signature)
        const base64Url = token.split('.')[1];
        // Replace characters that are not valid for base64 URL encoding
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decode the base64 string and parse it as JSON
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
};

// Function to extract the 'sub' claim from the token
export const extractSubject = (token) => {
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.sub) {
        return decodedToken.sub;
    }
    return null;
};

export const saveToken = (token, expiration) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpirationDate', expiration.toString());
    
    // Extract the subject (CI) from the token and store it in the global variable
    const subject = extractSubject(token);
    if (subject) {
        globalCI = subject;
        console.log('CI del usuario extraído del token:', globalCI);
        // Optional: also store in localStorage for persistence across page refreshes
        localStorage.setItem('userCI', subject);
    }
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const getUserCI = () => {
    // Return from global variable if available, otherwise try localStorage
    return globalCI || localStorage.getItem('userCI');
};

// Function to fetch user data by CI to check admin status
export const fetchUserByCI = async (ci) => {
    try {
        const response = await axios.get(`${USUARIO_URL}/ci/${ci}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by CI:', error);
        throw error.response?.data?.message || 'Error al obtener datos del usuario';
    }
};

// Function to save admin status in localStorage
export const saveAdminStatus = (isAdmin) => {
    localStorage.setItem('isAdmin', isAdmin.toString());
    console.log('Estado de administrador guardado:', isAdmin);
};

// Function to get admin status from localStorage
export const getAdminStatus = () => {
    const adminStatus = localStorage.getItem('isAdmin');
    return adminStatus === 'true';
};

// Function to check admin status after login
export const checkAndSaveAdminStatus = async (ci) => {
    try {
        const userData = await fetchUserByCI(ci);
        const isAdmin = userData.admin || false;
        saveAdminStatus(isAdmin);
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        // If there's an error, default to false (not admin)
        saveAdminStatus(false);
        return false;
    }
};

// Function to set new password for existing user
export const setNewPassword = async (ci, password) => {
    try {
        const response = await axios.post(`${USUARIO_URL}/newPassword/${ci}`, {
            contrasena: password
        });
        return response.data;
    } catch (error) {
        console.error('Error setting new password:', error);
        throw error.response?.data?.message || 'Error al establecer la nueva contraseña';
    }
};

export const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userCI');
    localStorage.removeItem('isAdmin'); // Clear admin status on logout
    globalCI = null;
};