import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  
  if (role !== 'ADMIN' && role !== 'admin') {
    return <Navigate to="/login" replace />; // Redirect non-admins
  }

  return <Outlet />;
};

export default AdminRoute;
