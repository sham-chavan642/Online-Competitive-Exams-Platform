import api from './api';

export const examApi = {
  getAvailableExams: async () => {
    const response = await api.get('/student/exams');
    return response.data;
  },
  getExamDetails: async (examId) => {
    const response = await api.get(`/student/exams/${examId}`);
    return response.data;
  },
  startExam: async (examId) => {
    const response = await api.post(`/student/exams/${examId}/start`);
    return response.data;
  }
};
