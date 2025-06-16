import axios from "axios";
import { getUserCI } from "./authService";
import { getAuthHeadersWithContentType, getAuthConfig } from "../Components/Common/authHeaders";

const API_SOLICITUDES = "https://dasalas.shop:8443/api/solicitudes/resumen";


export const getSolicitudesResumen = async () => {
    try {
        const response = await axios.get(API_SOLICITUDES, getAuthConfig());
        
        if (Array.isArray(response.data)) {
            return response.data.map(item => formatSolicitud(item));
        }
        
        return [];
    } catch (error) {
        console.error("Error al obtener resumen de solicitudes:", error);
        throw error;
    }
};


const formatSolicitud = (item) => {
    const productsList = Array.isArray(item.listaProductos)
        ? item.listaProductos 
        : typeof item.listaProductos === 'string'
            ? [item.listaProductos]
            : ['Productos no disponibles'];
    
    return {
        idSolicitud: item.idSolicitud || item.id || `SOL${Math.floor(100 + Math.random() * 900)}`,
        ciSolicitante: item.solicitante?.ci || item.ciUsuario || "No disponible",
        nombreSolicitante: item.solicitante?.nombre || "No disponible",
        apellidoSolicitante: item.solicitante?.apellido || "No disponible",
        comunidad: item.destino?.comunidad || "No disponible",
        direccion: item.destino?.direccion || "Dirección no disponible",
        listadoProductos: item.productos,
        fechaSolicitud: item.fechaSolicitud || new Date().toISOString(),
        fechaInicioIncendio: item.fechaInicioIncendio || null,
        telefonoSolicitante: item.solicitante?.telefono || item.celular || "No disponible",
        provincia: item.destino?.provincia || "No disponible",
        cantidadPersonas: item.cantidadPersonas || item.cantPersonas || 0,
        aprobada: item.aprobada === undefined ? null : item.aprobada,
        justificacion: item.justificacion
    };
};


export const aprobarSolicitud = async (idSolicitud) => {
    console.log("Enviando aprobación para:", idSolicitud);
    try {
        const userCI = getUserCI();
        console.log("Aprobando con CI del usuario:", userCI);
        
        const response = await axios.post(
            `https://dasalas.shop:8443/api/solicitudes-sin-responder/aprobar/${idSolicitud}`, 
            userCI,
            {
                headers: getAuthHeadersWithContentType("text/plain"),
                withCredentials: false
            }
        );
        console.log("Respuesta de aprobación:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error en aprobarSolicitud:", error);
        throw error;
    }
};


export const rechazarSolicitud = async (idSolicitud, motivo) => {
    try {
        const response = await axios.post(
            `https://dasalas.shop:8443/api/solicitudes-sin-responder/rechazar/${idSolicitud}`, 
            motivo,
            {
                headers: getAuthHeadersWithContentType("text/plain"),
                withCredentials: false
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al rechazar solicitud:", error);
        throw error;
    }
};


export const addSolicitud = async (solicitudData) => {
    try {
        const response = await axios.post("https://dasalas.shop:8443/api/solicitudes-sin-responder/crear-completa", solicitudData, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: false
        });
        return response.data;
    } catch (error) {
        console.error("Error al registrar solicitud:", error);
        throw error;
    }
};