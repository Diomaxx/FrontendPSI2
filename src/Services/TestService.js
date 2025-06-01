import axios from 'axios';

const REST_API_URL = "https://34.123.227.162:8443/api/tests";

export const ListTests = () => axios.get(REST_API_URL);
