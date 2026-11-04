import api from './api';

export const resultApi = {
  getResults: async () => {
    const response = await api.get('/student/results');
    return response.data;
  },
  getResult: async (resultId) => {
    const response = await api.get(`/student/results/${resultId}`);
    return response.data;
  },
  getRanking: async (examId) => {
    const response = await api.get(`/ranking/exam/${examId}`);
    return response.data;
  }
};
