import axios from 'axios';

const API_URL = 'https://34.123.227.162:8443/api/metricas';
const DONACIONES_DONANTES_URL = 'https://34.123.227.162:8443/api/donaciones/donantes';

export const getMetricas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};


export const getDonacionesConDonantes = async () => {
    const response = await axios.get(DONACIONES_DONANTES_URL);
    return response.data;
};