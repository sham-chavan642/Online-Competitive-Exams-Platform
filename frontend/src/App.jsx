import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import AdminLogin from './pages/auth/AdminLogin';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamDetails from './pages/student/ExamDetails';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';
import Results from './pages/student/Results';
import Ranking from './pages/student/Ranking';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTopics from './pages/admin/ManageTopics';
import ManageExams from './pages/admin/ManageExams';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageAttempts from './pages/admin/ManageAttempts';
import ManageResults from './pages/admin/ManageResults';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<AvailableExams />} />
              <Route path="/student/exams/:id" element={<ExamDetails />} />
              <Route path="/student/exam/:attemptId" element={<ExamPage />} />
              <Route path="/student/results" element={<Results />} />
              <Route path="/student/results/:id" element={<ResultPage />} />
              <Route path="/student/ranking/:examId" element={<Ranking />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/topics" element={<ManageTopics />} />
              <Route path="/admin/exams" element={<ManageExams />} />
              <Route path="/admin/questions" element={<ManageQuestions />} />
              <Route path="/admin/attempts" element={<ManageAttempts />} />
              <Route path="/admin/results" element={<ManageResults />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
