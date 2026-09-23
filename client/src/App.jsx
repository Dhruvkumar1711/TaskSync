import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
        <div 
          aria-hidden="true" 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 blur-3xl pointer-events-none" 
        />
        <div 
          aria-hidden="true" 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-accent/25 via-secondary/20 to-primary/10 blur-3xl pointer-events-none" 
        />
        
        {/* Main Content Area */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;