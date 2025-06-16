import axios from "axios";
import { getAuthHeaders, getAuthConfig } from "../Components/Common/authHeaders";

const API_DONACIONES = "https://dasalas.shop:8443/api/donaciones/new";

export const fetchDonations = async () => {
    try {
        const response = await axios.get(API_DONACIONES, {
            ...getAuthConfig(),
        });
        console.log("Donations API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching donations:", error);
        return [];
    }
};


export const actualizarEstadoDonacion = async (idDonacion, ciUsuario, estado, imagenBase64, latitud, longitud) => {
    console.log("Actualizando estado de donación:", { idDonacion, ciUsuario, estado, imagenBase64, latitud, longitud });

    try {
        const response = await axios.post(
            `https://dasalas.shop:8443/api/donaciones/actualizar/${idDonacion}`,
            {
                ciUsuario,
                estado,
                imagen: imagenBase64,
                latitud,
                longitud
            },
            getAuthConfig()
        );

        console.log("Respuesta de actualización:", response.data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            const mensaje = error.response.data.error;
            console.warn("Mensaje del servidor:", mensaje);

            alert(mensaje);

            throw new Error(mensaje);
        } else {
            console.error("Error inesperado:", error);
            throw new Error("Ocurrió un error inesperado al actualizar la donación.");
        }
    }
};

