import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useStudent — Student-specific exam actions.
 *
 * Routes used:
 *  GET  /api/student/exams              → getAvailableExams (auth required)
 *  POST /api/student/exams/:examId/start → startExam        (auth required)
 */
const useStudent = () => {
  const { request, loading, error } = useFetch();
  const [availableExams, setAvailableExams] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);

  // GET /api/student/exams — list exams the student can take
  const getAvailableExams = useCallback(async () => {
    const response = await request('/student/exams');
    // The backend returns { success: true, data: [...] } for list endpoints.
    const data = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.exams)
          ? response.exams
          : [];
    setAvailableExams(data);
    return data;
  }, [request]);

  // POST /api/student/exams/:examId/start — begin an exam, returns attemptId
  const startExam = useCallback(async (examId, candidateDetails = {}) => {
    const data = await request(`/student/exams/${examId}/start`, {
      method: 'POST',
      body: JSON.stringify(candidateDetails),
    });
    setCurrentAttempt(data);
    return data; // { attemptId, examId, startedAt, ... }
  }, [request]);

  return {
    availableExams,
    currentAttempt,
    loading,
    error,
    getAvailableExams,
    startExam,
  };
};

export default useStudent;
