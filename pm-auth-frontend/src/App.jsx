import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import { Toaster } from '@/components/ui/toaster';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Auth Route Component
const AuthRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppContent() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
                path="/login"
                element={
                    <AuthRoute>
                        <LoginPage />
                    </AuthRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <AuthRoute>
                        <RegisterPage />
                    </AuthRoute>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <AuthRoute>
                        <ForgotPasswordPage />
                    </AuthRoute>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <AuthRoute>
                        <ResetPasswordPage />
                    </AuthRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
                <Toaster />
            </AuthProvider>
        </Router>
    );
}

export default App;