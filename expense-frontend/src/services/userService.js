import api from '@/services/api';

export const userService = {
    // Get current user profile
    getProfile: async () => {
        try {
            const response = await api.get('/api/users/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    // Update user profile (firstName, lastName)
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/users/profile', {
                firstName: profileData.firstName,
                lastName: profileData.lastName
            });
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    // Update password
    updatePassword: async (passwordData) => {
        try {
            const response = await api.put('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    },

    // Upload avatar
    uploadAvatar: async (file) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await api.post('/api/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    },

    // Delete avatar
    deleteAvatar: async () => {
        try {
            const response = await api.delete('/api/users/avatar');
            return response.data;
        } catch (error) {
            console.error('Error deleting avatar:', error);
            throw error;
        }
    },

    // Update user preferences (currency, theme, notifications, etc.)
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/api/users/preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    },

    // Get user preferences
    getPreferences: async () => {
        try {
            const response = await api.get('/api/users/preferences');
            return response.data;
        } catch (error) {
            console.error('Error fetching preferences:', error);
            throw error;
        }
    }
};