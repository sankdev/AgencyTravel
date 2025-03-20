import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/paymentMode';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentModeService = {
    getActivePaymentModes: async () => {
        const response = await axios.get(`${API_URL}/api/paymentMode/modes`, { headers: authHeader() });
        return response.data;
    },
    createPaymentMode: async (paymentModeData) => {
        const response = await axios.post(`${API_URL}/api/paymentMode`, paymentModeData, { headers: authHeader() });
        return response.data;
    },
    updatePaymentMode: async (paymentModeId, paymentModeData) => {
        const response = await axios.put(`${API_URL}/api/paymentMode/${paymentModeId}`, paymentModeData, { headers: authHeader() });
        return response.data;
    },
    deletePaymentMode: async (paymentModeId) => {
        const response = await axios.delete(`${API_URL}/api/paymentMode/${paymentModeId}`, { headers: authHeader() });
        return response.data;
    }
};
