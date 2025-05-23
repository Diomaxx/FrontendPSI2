import axios from "axios";

const API_DONACIONES = "http://34.123.227.162:8080/api/donaciones/new";

const token = localStorage.getItem('authToken');

const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "" // Asegúrate de que el token se agregue correctamente
    };
};

export const fetchDonations = async () => {
    console.log("Token JWT:", getAuthHeaders()); // Log para verificar que el token está en el localStorage
    try {
        const response = await axios.get(API_DONACIONES, {
            withCredentials: false,
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
            `http://34.123.227.162:8080/api/donaciones/actualizar/${idDonacion}`,
            {
                ciUsuario,
                estado,
                imagen: imagenBase64,  // Enviamos la imagen en base64
                latitud,
                longitud
            },
            {
                withCredentials: false
            }
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

export const solicitudesAprobadas = async () => {
    try {
        const response = await axios.get('http://34.123.227.162:8080/api/donaciones/total', {
            headers: getAuthHeaders(),
        });
        console.log("Total solicitudes aprobadas:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener donaciones entregadas:", error);
        return 0;
    }
};
