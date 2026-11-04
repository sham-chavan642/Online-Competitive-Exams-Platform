import api from './api';

export const authApi = {
  loginStudent: async (credentials) => {
    const response = await api.post('/auth/student/login', credentials);
    return response.data;
  },
  registerStudent: async (userData) => {
    const response = await api.post('/auth/student/register', userData);
    return response.data;
  },
  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  }
};
