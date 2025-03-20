import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

//const API_URL = 'http://localhost:5000/api/pricing-rules';

const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}/api/pricing-rules`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const pricingRuleService = {
  createPricingRule: async (data) => {
    try {
      const response = await axiosWithAuth().post('/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllPricingRules: async () => {
    try {
      const response = await axiosWithAuth().get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserPricingRules: async () => {
    try {
      const response = await axiosWithAuth().get('/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPricingRuleById: async (id) => {
    try {
      const response = await axiosWithAuth().get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePricingRule: async (id, data) => {
    try {
      const response = await axiosWithAuth().put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePricingRule: async (id) => {
    try {
      const response = await axiosWithAuth().delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
