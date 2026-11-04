import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useRanking — Fetch leaderboard/ranking for a specific exam.
 *
 * Routes used:
 *  GET /api/ranking/exam/:examId  → getRankingByExam (auth required)
 */
const useRanking = () => {
  const { request, loading, error } = useFetch();
  const [rankings, setRankings]     = useState([]);

  // GET /api/ranking/exam/:examId
  const getRankingByExam = useCallback(async (examId) => {
    const data = await request(`/ranking/exam/${examId}`);
    setRankings(data);
    return data;
  }, [request]);

  return {
    rankings,
    loading,
    error,
    getRankingByExam,
  };
};

export default useRanking;
