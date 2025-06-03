import axios from 'axios';

const REST_API_URL = "https://dasalas.shop:8443/api/tests";

export const ListTests = () => axios.get(REST_API_URL);
