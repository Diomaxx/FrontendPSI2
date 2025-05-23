import axios from 'axios';

const API_URL = 'http://34.123.227.162:8080/api/metricas';

export const getMetricas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};