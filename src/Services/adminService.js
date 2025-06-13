import axios from "axios";

const API_BASE = "https://dasalas.shop:8443/api/usuarios";

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
};

export const fetchNonAdminUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE}/noAdmin`, {
            withCredentials: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching non-admin users:", error);
        throw error;
    }
};

export const toggleUserActiveStatus = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE}/active/${userId}`, {}, {
            withCredentials: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error toggling user active status:", error);
        throw error;
    }
};

export const promoteUserToAdmin = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE}/admin/${userId}`, {}, {
            withCredentials: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error promoting user to admin:", error);
        throw error;
    }
}; 