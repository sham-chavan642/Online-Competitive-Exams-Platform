import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useExamAttempt — Handle live exam flow: answering questions & submitting.
 *
 * Routes used:
 *  POST /api/student/attempts/:attemptId/answer  → submitAnswer  (auth required)
 *  POST /api/student/attempts/:attemptId/submit  → submitExam    (auth required)
 */
const useExamAttempt = (attemptId) => {
  const { request, loading, error } = useFetch();
  const [answers, setAnswers]       = useState({});   // { questionId: selectedOptionId }
  const [submitted, setSubmitted]   = useState(false);
  const [result, setResult]         = useState(null);

  /**
   * Save a single answer for a question.
   * POST /api/student/attempts/:attemptId/answer
   * Body: { questionId, selectedOptionId }
   */
  const submitAnswer = useCallback(async (questionId, selectedOptionId) => {
    if (submitted) return;

    // Optimistic local update
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOptionId }));

    await request(`/student/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedOptionId }),
    });
  }, [request, attemptId, submitted]);

  /**
   * Finalise and submit the entire exam attempt.
   * POST /api/student/attempts/:attemptId/submit
   */
  const submitExam = useCallback(async () => {
    if (submitted) return;
    const data = await request(`/student/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
    setSubmitted(true);
    setResult(data);
    return data;
  }, [request, attemptId, submitted]);

  return {
    answers,
    submitted,
    result,
    loading,
    error,
    submitAnswer,
    submitExam,
  };
};

export default useExamAttempt;
