import axios from "axios";
import { getAuthHeaders, getAuthConfig } from "../Components/Common/authHeaders";

const API_SEGUIMIENTOS = "https://dasalas.shop:8443/api/seguimientodonaciones/completos"; // Ajusta si el endpoint es diferente


export const fetchSeguimientos = async () => {
    try {
        const response = await axios.get(API_SEGUIMIENTOS, getAuthConfig());
        return response.data;
    } catch (error) {
        console.error("Error al obtener seguimientos:", error);
        return [];
    }
};

export const donacionesEntregadas = async () => {
    try {
        const response = await axios.get('https://dasalas.shop:8443/api/seguimientodonaciones/contar-entregadas', getAuthConfig());
        console.log("Total donaciones entregadas:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener donaciones entregadas:", error);
        return 0;
    }
};
