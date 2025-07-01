import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = () => {
            try {
                const token = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } catch (e) {
                        console.error('Invalid user data in localStorage');
                        throw e;
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        verifyEmail: authService.verifyEmail,
        resendVerification: authService.resendVerification,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};