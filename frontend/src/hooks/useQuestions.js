import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useQuestions — Fetch exam questions.
 *
 * Routes used:
 *  GET    /api/questions/exam/:examId  → getQuestionsByExam (auth required)
 *  GET    /api/questions/:id           → getQuestionById    (auth required)
 *  POST   /api/questions               → createQuestion     (admin only)
 *  PUT    /api/questions/:id           → updateQuestion     (admin only)
 *  DELETE /api/questions/:id           → deleteQuestion     (admin only)
 */
const useQuestions = () => {
  const { request, loading, error } = useFetch();
  const [questions, setQuestions]   = useState([]);
  const [question, setQuestion]     = useState(null);

  // GET /api/questions/exam/:examId
  const getQuestionsByExam = useCallback(async (examId) => {
    const data = await request(`/questions/exam/${examId}`);
    setQuestions(data);
    return data;
  }, [request]);

  // GET /api/questions/:id
  const getQuestionById = useCallback(async (id) => {
    const data = await request(`/questions/${id}`);
    setQuestion(data);
    return data;
  }, [request]);

  // POST /api/questions  (admin only)
  const createQuestion = useCallback(async (questionData) => {
    const data = await request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
    setQuestions((prev) => [...prev, data]);
    return data;
  }, [request]);

  // PUT /api/questions/:id  (admin only)
  const updateQuestion = useCallback(async (id, questionData) => {
    const data = await request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
    setQuestions((prev) => prev.map((q) => (q.id === id ? data : q)));
    return data;
  }, [request]);

  // DELETE /api/questions/:id  (admin only)
  const deleteQuestion = useCallback(async (id) => {
    await request(`/questions/${id}`, { method: 'DELETE' });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, [request]);

  return {
    questions,
    question,
    loading,
    error,
    getQuestionsByExam,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};

export default useQuestions;
