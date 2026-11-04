import api from './api';

export const adminApi = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Topics
  getTopics: async () => {
    const response = await api.get('/topics');
    return response.data;
  },
  createTopic: async (data) => {
    const response = await api.post('/topics', data);
    return response.data;
  },
  updateTopic: async (id, data) => {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },
  deleteTopic: async (id) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  },

  // Exams
  getExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },
  createExam: async (data) => {
    const response = await api.post('/exams', data);
    return response.data;
  },
  updateExam: async (id, data) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },
  deleteExam: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
  generateQuestions: async (data) => {
    const response = await api.post('/admin/questions/generate', data, { timeout: 70000 });
    return response.data;
  },

  // Students
  getStudents: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/admin/students${query}`);
    return response.data;
  },
  getStudentById: async (id) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  // Attempts
  getAttempts: async () => {
    const response = await api.get('/admin/attempts');
    return response.data;
  },
  recoverAutoSubmittedAttempt: async (attemptId) => {
    const response = await api.post(`/admin/attempts/${attemptId}/recover`);
    return response.data;
  },
  getSecurityEvents: async () => {
    const response = await api.get('/admin/security/events');
    return response.data;
  },
  getSecuritySettings: async () => {
    const response = await api.get('/admin/security/settings');
    return response.data;
  },
  updateSecuritySettings: async (examId, data) => {
    const response = await api.put(`/admin/security/settings/${examId}`, data);
    return response.data;
  },

  // Results
  getResults: async () => {
    const response = await api.get('/admin/results');
    return response.data;
  },
};
