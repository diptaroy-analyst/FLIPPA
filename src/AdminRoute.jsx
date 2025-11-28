<<<<<<< HEAD
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    // Redirect to login page if not admin
    return <Navigate to="/login" replace />;
  }

  return children; // Render admin panel if user is an admin
};

=======
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    // Redirect to login page if not admin
    return <Navigate to="/login" replace />;
  }

  return children; // Render admin panel if user is an admin
};

>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
export default AdminRoute;