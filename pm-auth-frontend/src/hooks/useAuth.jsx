import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext();

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
                const currentUser = authService.getCurrentUser();
                const token = localStorage.getItem('accessToken');

                if (currentUser && token) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const register = async (userData) => {
        return authService.register(userData);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
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