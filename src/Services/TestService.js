import axios from 'axios';

const REST_API_URL = "/api/tests";

export const ListTests = () => axios.get(REST_API_URL);
