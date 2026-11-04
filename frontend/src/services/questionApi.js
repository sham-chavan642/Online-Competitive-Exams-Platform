import api from './api';

export const questionApi = {
  getExamQuestions: async (examId) => {
    const response = await api.get(`/questions/exam/${examId}`);
    return response.data;
  },
  createQuestion: async (examId, data) => {
    const payload = {
      ...data,
      exam_id: Number(examId),
    };
    const response = await api.post('/questions', payload);
    return response.data;
  },
  updateQuestion: async (examId, questionId, data) => {
    const response = await api.put(`/questions/${questionId}`, data);
    return response.data;
  },
  deleteQuestion: async (examId, questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
};
