import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/vols';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const volService = {
    getVols: async () => {
        const response = await axios.get(`${API_URL}/api/vols`, { headers: authHeader() });
        return response.data; // Ensure data is returned
    },
    getVolById: async (id) => {
        return axios.get(`${API_URL}/api/vols/${id}`, { headers: authHeader() });
    },
    getVolsByAgency: async () => {
        const response = await axios.get(`${API_URL}/api/vols/all`, { headers: authHeader() });
        return response.data; // Ensure data is returned
    },
    createVol: async (volData) => {
        return axios.post(`${API_URL}/api/vols/post`, volData, { headers: authHeader() });
    },
    updateVol: async (id, volData) => {
        return axios.put(`${API_URL}/api/vols/${id}`, volData, { headers: authHeader() });
    },
    deleteVol: async (id) => {
        return axios.delete(`${API_URL}/api/vols/${id}`, { headers: authHeader() });
    }
};
