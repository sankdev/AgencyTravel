import axios from 'axios';

 //const API_URL = 'http://localhost:5000/api'; // Removed trailing slash
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


export const agencyService = {
    getAgencyProfile: async (id) => {
        const token = localStorage.getItem('token');
        const userId=localStorage.getItem('userId')
        try {
            const response = await axios.get(`${API_URL}/api/agency/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateAgencyProfile: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/api/agency/profile`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAgencyStats: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // CRUD Endpoints for CreationAgency
    createAgency: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/api/agency`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAgencies: async (params) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/agency`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getUserAgencies: async (params) => {
        const token = localStorage.getItem('token');
        const userId=localStorage.getItem('userId')
        try {
            const response = await axios.get(`${API_URL}/api/agency/userAgency/${userId}`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getAgency: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/agency/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateAgency: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/api/agency/${id}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteAgency: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/api/agency/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
