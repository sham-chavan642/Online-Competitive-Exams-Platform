import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useResults — Fetch exam results.
 *
 * Routes used:
 *  GET /api/results/my-results       → getMyResults      (auth — student's own results)
 *  GET /api/results/:id              → getResultById     (auth required)
 *  GET /api/results/exam/:examId     → getResultsByExam  (admin only)
 */
const useResults = () => {
  const { request, loading, error } = useFetch();
  const [myResults, setMyResults]   = useState([]);
  const [result, setResult]         = useState(null);
  const [examResults, setExamResults] = useState([]);

  // GET /api/results/my-results
  const getMyResults = useCallback(async () => {
    const response = await request('/results/my-results');
    // API list endpoints return { success: true, data: [...] }.
    // Normalize the envelope so consumers always receive an array.
    const data = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.results)
          ? response.results
          : [];
    setMyResults(data);
    return data;
  }, [request]);

  // GET /api/results/:id
  const getResultById = useCallback(async (id) => {
    const data = await request(`/results/${id}`);
    setResult(data);
    return data;
  }, [request]);

  // GET /api/results/exam/:examId  (admin only)
  const getResultsByExam = useCallback(async (examId) => {
    const response = await request(`/results/exam/${examId}`);
    const data = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.results)
          ? response.results
          : [];
    setExamResults(data);
    return data;
  }, [request]);

  return {
    myResults,
    result,
    examResults,
    loading,
    error,
    getMyResults,
    getResultById,
    getResultsByExam,
  };
};

export default useResults;
