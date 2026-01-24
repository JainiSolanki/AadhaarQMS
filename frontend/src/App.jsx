import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import AdminLogin from './pages/auth/AdminLogin';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import BookAppointment from './pages/user/BookAppointment';
import MyAppointments from './pages/user/MyAppointments';
import AppointmentDetails from './pages/user/AppointmentDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllAppointments from './pages/admin/AllAppointments';
import QueueManagement from './pages/admin/QueueManagement';
import Analytics from './pages/admin/Analytics';

// Public Pages
import QueueStatus from './pages/QueueStatus';

import './styles/global.css';

// Protected Route Component for Users
const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, isUser } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

// Protected Route Component for Admins
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

// Redirect authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isUser } = useAuth();
  
  if (isAuthenticated()) {
    if (isAdmin()) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isUser()) {
      return <Navigate to="/user/dashboard" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/queue" element={<QueueStatus />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <UserLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <UserRegister />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin/login" 
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            
            {/* User Protected Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedUserRoute>
                  <UserDashboard />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/user/book"
              element={
                <ProtectedUserRoute>
                  <BookAppointment />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/user/appointments"
              element={
                <ProtectedUserRoute>
                  <MyAppointments />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/user/appointments/:id"
              element={
                <ProtectedUserRoute>
                  <AppointmentDetails />
                </ProtectedUserRoute>
              }
            />
            
            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedAdminRoute>
                  <AllAppointments />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/queue"
              element={
                <ProtectedAdminRoute>
                  <QueueManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedAdminRoute>
                  <Analytics />
                </ProtectedAdminRoute>
              }
            />
            
            {/* 404 Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;