import api from './api';

export const attemptApi = {
  saveAnswer: async (attemptId, questionId, optionId) => {
    const response = await api.post(`/student/attempts/${attemptId}/answer`, {
      question_id: questionId,
      option_id: optionId
    });
    return response.data;
  },
  submitAttempt: async (attemptId) => {
    const response = await api.post(`/student/attempts/${attemptId}/submit`);
    return response.data;
  }
};
