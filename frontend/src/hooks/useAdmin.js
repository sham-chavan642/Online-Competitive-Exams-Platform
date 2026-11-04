import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useAdmin — Admin dashboard and management operations.
 *
 * All routes require auth + admin role.
 *
 * Routes used:
 *  GET /api/admin/dashboard         → getDashboardStats
 *  GET /api/admin/students          → getStudents
 *  GET /api/admin/students/:id      → getStudentById
 *  GET /api/admin/attempts          → getAttempts
 *  GET /api/admin/results           → getResults
 */
const useAdmin = () => {
  const { request, loading, error }     = useFetch();
  const [dashboardStats, setDashboard]  = useState(null);
  const [students, setStudents]         = useState([]);
  const [student, setStudent]           = useState(null);
  const [attempts, setAttempts]         = useState([]);
  const [results, setResults]           = useState([]);

  // GET /api/admin/dashboard
  const getDashboardStats = useCallback(async () => {
    const data = await request('/admin/dashboard');
    setDashboard(data);
    return data;
  }, [request]);

  // GET /api/admin/students
  const getStudents = useCallback(async () => {
    const data = await request('/admin/students');
    setStudents(data);
    return data;
  }, [request]);

  // GET /api/admin/students/:id
  const getStudentById = useCallback(async (id) => {
    const data = await request(`/admin/students/${id}`);
    setStudent(data);
    return data;
  }, [request]);

  // GET /api/admin/attempts
  const getAttempts = useCallback(async () => {
    const data = await request('/admin/attempts');
    setAttempts(data);
    return data;
  }, [request]);

  // GET /api/admin/results
  const getAllResults = useCallback(async () => {
    const data = await request('/admin/results');
    setResults(data);
    return data;
  }, [request]);

  return {
    dashboardStats,
    students,
    student,
    attempts,
    results,
    loading,
    error,
    getDashboardStats,
    getStudents,
    getStudentById,
    getAttempts,
    getAllResults,
  };
};

export default useAdmin;
