import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/customer';

// Ajouter le token aux headers pour les requêtes authentifiées
const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const customerService = {
    // Profil
    getCustomerProfile: async () => {
        return axios.get(`${API_URL}/api/customer/customers/profile`, { headers: authHeader() });
    },
    getCustomerProfileById: async (id) => {
        return axios.get(`${API_URL}/api/customer/customers/profile/${id}`, { headers: authHeader() });
    },
    getAllCustomersWithoutRestriction:async () => {
        return axios.get(`${API_URL}/api/customer/customers/without`, { headers: authHeader() });
    },
    updateCustomerProfile :async (profileData) => {
        return axios.put(`${API_URL}/customers/profile`, profileData, {
            headers: {
                ...authHeader(),
                "Content-Type": "multipart/form-data",
            }
        });
    },
    createCustomer: async (customerData) => {
        const headers = authHeader();
        delete headers["Content-Type"];
        return axios.post(`${API_URL}/api/customer/customers`, customerData, { headers });
    },

    // Réservations 
    
    getCustomerReservations: async () => {
        return axios.get(`${API_URL}/api/customer/customers/reservations`, { headers: authHeader() });
    },

    getReservationDetails: async (reservationId) => {
        return axios.get(`${API_URL}/customers/reservations/${reservationId}`, { headers: authHeader() });
    },

    createReservation: async (reservationData) => {
        return axios.post(`${API_URL}/api/customer/reservations`, reservationData, { headers: authHeader() });
    },

    cancelReservation: async (reservationId) => {
        return axios.put(
            `${API_URL}/api/customer/customers/reservations/${reservationId}/cancel`,
            {},
            { headers: authHeader() }
        );
    },

    // Factures
    getCustomerInvoices: async () => {
        return axios.get(`${API_URL}/api/customer/customers/invoices`, { headers: authHeader() });
    },

    getInvoiceDetails: async (invoiceId) => {
        return axios.get(`${API_URL}/api/customer/customers/invoices/${invoiceId}`, { headers: authHeader() });
    },

    downloadInvoice: async (invoiceId) => {
        return axios.get(`${API_URL}/api/customer/customers/invoices/${invoiceId}/download`, {
            headers: authHeader(),
            responseType: 'blob'
        });
    },

    // Paiements
    initiatePayment: async (invoiceId, paymentData) => {
        return axios.post(
            `${API_URL}/api/customer/customers/invoices/${invoiceId}/pay`,
            paymentData,
            { headers: authHeader() }
        );
    },

    // Customers
    getAllCustomers: async () => {
        return axios.get(`${API_URL}/api/customer/customers/all`, { headers: authHeader() });
    }
};
