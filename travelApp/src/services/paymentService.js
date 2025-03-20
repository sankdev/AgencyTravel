import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/payment';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentService = {
    createPayment: async (paymentData) => {
        const response = await axios.post(`${API_URL}/api/payment`, paymentData, { headers: authHeader() });
        return response.data;
    },
    getPayments: async () => {
        const response = await axios.get(`${API_URL}/api/payment`, { headers: authHeader() });
        return response.data;
    },
    getPaymentById: async (paymentId) => {
        const response = await axios.get(`${API_URL}/api/payment/${paymentId}`, { headers: authHeader() });
        return response.data;
    },
    updatePayment: async (paymentId, paymentData) => {
        const response = await axios.patch(`${API_URL}/api/payment/${paymentId}`, paymentData, { headers: authHeader() });
        return response.data;
    },
    deletePayment: async (paymentId) => {
        const response = await axios.delete(`${API_URL}/api/payment/${paymentId}`, { headers: authHeader() });
        return response.data;
    },
    validatePay: async (paymentId) => {
        const response = await axios.put(`${API_URL}/api/payment/validate/${paymentId}`, {}, { headers: authHeader() });
        return response.data;
    },
};
