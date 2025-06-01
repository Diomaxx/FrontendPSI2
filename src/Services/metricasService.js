import axios from 'axios';

const API_URL = '/api/metricas';
const DONACIONES_DONANTES_URL = '/api/donaciones/donantes';

export const getMetricas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};


export const getDonacionesConDonantes = async () => {
    const response = await axios.get(DONACIONES_DONANTES_URL);
    return response.data;
};