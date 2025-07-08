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
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error('Auth validation failed:', error);
                        clearAuth();
                    }
                } else {
                    clearAuth();
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const clearAuth = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

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
        window.location.href = '/login';
    };

    // Add this new function to update user data
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser, // Add this to the context value
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};