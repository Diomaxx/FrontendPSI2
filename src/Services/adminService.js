import axios from "axios";
import { getAuthHeaders, getAuthConfig } from "../Components/Common/authHeaders";

const API_BASE = "https://springboot-backend-dpyv.onrender.com/api/usuarios";

export const fetchNonAdminUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE}/noAdmin`, getAuthConfig());
        return response.data;
    } catch (error) {
        console.error("Error fetching non-admin users:", error);
        throw error;
    }
};


export const toggleUserActiveStatus = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE}/active/${userId}`, {}, getAuthConfig());
        return response.data;
    } catch (error) {
        console.error("Error toggling user active status:", error);
        throw error;
    }
};


export const promoteUserToAdmin = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE}/admin/${userId}`, {}, getAuthConfig());
        return response.data;
    } catch (error) {
        console.error("Error promoting user to admin:", error);
        throw error;
    }
}; 