import api from './api';

export const examSecurityApi = {
  getAttemptSettings: async (attemptId) => {
    const response = await api.get(`/student/security/attempts/${attemptId}/settings`);
    return response.data.data;
  },

  recordEvent: async (attemptId, eventType, details) => {
    const response = await api.post(`/student/security/attempts/${attemptId}/events`, {
      eventType,
      details: typeof details === 'string' ? details.slice(0, 255) : details,
    });
    return response.data.data;
  },
};
