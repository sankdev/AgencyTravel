import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/apis'; // Base URL for the API

export const flightService = {
    searchFlights: async (params) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/apis/flights/search`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getFlightDetails: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/apis/flights/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    searchPlaces: async (query) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/apis/flights/places`, {
                params: { query },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
