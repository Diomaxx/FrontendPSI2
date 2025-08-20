import axios from "axios";
import { getAuthConfig } from "../Components/Common/authHeaders";

const API_DONACIONES_REPORTE = "https://springboot-backend-dpyv.onrender.com/api/historial/reporte-completo/";

export const fetchDonationsReporte = async () => {
    try {
        const response = await axios.get(API_DONACIONES_REPORTE, {
            ...getAuthConfig(),
        });
        console.log("Donations REPORTE API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching donations:", error);
        return [];
    }
};


export const fetchDonacionPorId = async (id) => {
    const url = `https://springboot-backend-dpyv.onrender.com/api/historial/reporte-completo/${id}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthConfig().headers,
        });

        if (!response.ok) {
            throw new Error("Error al obtener la donación");
        }

        return await response.json();
    } catch (error) {
        console.error("Error en fetchDonacionPorId:", error);
        throw error;
    }
};
