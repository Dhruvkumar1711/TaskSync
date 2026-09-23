import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

const AuthLayout = ({ children }) => (
  <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
    <div 
      aria-hidden="true" 
      className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 blur-3xl pointer-events-none" 
    />
    <div 
      aria-hidden="true" 
      className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-accent/25 via-secondary/20 to-primary/10 blur-3xl pointer-events-none" 
    />
    <div className="relative z-10 w-full flex items-center justify-center">
      {children}
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />

        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;