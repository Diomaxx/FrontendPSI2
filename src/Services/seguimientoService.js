import axios from "axios";

const API_SEGUIMIENTOS = "http://34.123.227.162:8080/api/seguimientodonaciones/completos"; // Ajusta si el endpoint es diferente

export const fetchSeguimientos = async () => {
    try {
        const response = await axios.get(API_SEGUIMIENTOS, {
            headers: { "Content-Type": "application/json" },
            withCredentials: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener seguimientos:", error);
        return [];
    }
};
export const donacionesEntregadas = async () => {
    try {
        const response = await axios.get('http://34.123.227.162:8080/api/seguimientodonaciones/contar-entregadas');
        console.log("Total donaciones entregadas:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener donaciones entregadas:", error);
        return 0;
    }
};
