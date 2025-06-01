import axios from 'axios';

const REST_API_URL = "http://34.123.227.162:8080/api/tests";

export const ListTests = () => axios.get(REST_API_URL);
