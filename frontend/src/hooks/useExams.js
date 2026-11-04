import { useState, useEffect, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useExams — Fetch and manage exams.
 *
 * Routes used:
 *  GET  /api/exams          → getAllExams   (public)
 *  GET  /api/exams/:id      → getExamById  (auth required)
 *  POST /api/exams          → createExam   (admin only)
 *  PUT  /api/exams/:id      → updateExam   (admin only)
 *  DELETE /api/exams/:id    → deleteExam   (admin only)
 */
const useExams = () => {
  const { request, loading, error } = useFetch();
  const [exams, setExams]           = useState([]);
  const [exam, setExam]             = useState(null);

  // GET /api/exams — fetch all exams (public)
  const getAllExams = useCallback(async () => {
    const data = await request('/exams');
    setExams(data);
    return data;
  }, [request]);

  // GET /api/exams/:id — fetch single exam by id (auth required)
  const getExamById = useCallback(async (id) => {
    const data = await request(`/exams/${id}`);
    setExam(data);
    return data;
  }, [request]);

  // POST /api/exams — create a new exam (admin only)
  const createExam = useCallback(async (examData) => {
    const data = await request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
    setExams((prev) => [...prev, data]);
    return data;
  }, [request]);

  // PUT /api/exams/:id — update an exam (admin only)
  const updateExam = useCallback(async (id, examData) => {
    const data = await request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
    setExams((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  }, [request]);

  // DELETE /api/exams/:id — delete an exam (admin only)
  const deleteExam = useCallback(async (id) => {
    await request(`/exams/${id}`, { method: 'DELETE' });
    setExams((prev) => prev.filter((e) => e.id !== id));
  }, [request]);

  // Auto-load all exams on mount
  useEffect(() => {
    getAllExams();
  }, [getAllExams]);

  return {
    exams,
    exam,
    loading,
    error,
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
  };
};

export default useExams;
