import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/invoice';

// Ajouter le token aux headers pour les requêtes authentifiées
const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const invoiceService = {
    getInvoices: async () => {
        return axios.get(`${API_URL}/api/invoice/my-invoices`, { headers: authHeader() });
    },
    getInvoicesForAgency: async () => {
        const userId=localStorage.getItem('userId')
        return axios.get(`${API_URL}/api/invoice/userAgency/${userId}`, { headers: authHeader() });
    },
    getInvoicesForCustomer: async () => {
        const userId=localStorage.getItem('userId')
        return axios.get(`${API_URL}/api/invoice/userCustomer/${userId}`, { headers: authHeader() });
    },
    getInvoiceDetails: async (invoiceId) => {
        return axios.get(`${API_URL}/api/invoice/${invoiceId}`, { headers: authHeader() });
    },
    downloadInvoice: async (invoiceId) => {
        return axios.get(`${API_URL}/api/invoice/download/${invoiceId}`, {
            headers: authHeader(),
            responseType: 'blob'
        });
    },
    createInvoice: async (invoiceData) => {
        return axios.post(`${API_URL}/`, invoiceData, { headers: authHeader() });
    },
    updateInvoice: async (invoiceId, invoiceData) => {
        return axios.patch(`${API_URL}/api/invoice/${invoiceId}`, invoiceData, { headers: authHeader() });
    },
    deleteInvoice: async (invoiceId) => {
        return axios.delete(`${API_URL}/api/invoice/${invoiceId}`, { headers: authHeader() });
    }
};
