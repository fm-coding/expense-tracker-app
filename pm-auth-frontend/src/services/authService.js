import api from './api';

export const authService = {
    // Register new user
    register: async (userData) => {
        try {
            console.log('Registering user:', userData.email);
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Registration failed. Please try again.';
            throw new Error(errorMessage);
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            console.log('Logging in user:', credentials.email);
            const response = await api.post('/auth/login', credentials);
            const { accessToken, refreshToken, user } = response.data;

            // Store tokens and user info
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Login failed. Please check your credentials.';
            throw new Error(errorMessage);
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // Verify email
    verifyEmail: async (token) => {
        try {
            const response = await api.get(`/auth/verify-email/${token}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Email verification failed.';
            throw new Error(errorMessage);
        }
    },

    // Resend verification email
    resendVerification: async (email) => {
        try {
            const response = await api.post(`/auth/resend-verification/${email}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to resend verification email.';
            throw new Error(errorMessage);
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to send password reset email.';
            throw new Error(errorMessage);
        }
    },

    // Reset password
    resetPassword: async (token, passwordData) => {
        try {
            const response = await api.post(`/auth/reset-password/${token}`, passwordData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to reset password.';
            throw new Error(errorMessage);
        }
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};