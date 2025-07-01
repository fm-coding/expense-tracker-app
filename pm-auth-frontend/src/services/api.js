import axios from 'axios';

// Create separate instances for different services
const authAPI = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8084/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

const expenseAPI = axios.create({
    baseURL: import.meta.env.VITE_EXPENSE_API_URL || 'http://localhost:8083/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to both instances
const addAuthInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            console.log('Making request to:', config.url);
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            console.error('API Error:', error.response?.status, error.response?.data);
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        const response = await authAPI.post('/auth/refresh-token', {
                            refreshToken: refreshToken
                        });

                        const { accessToken } = response.data;
                        localStorage.setItem('accessToken', accessToken);

                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );
};

// Apply interceptors
addAuthInterceptor(authAPI);
addAuthInterceptor(expenseAPI);

// Default export for auth (backward compatibility)
export default authAPI;

// Named exports for specific services
export { authAPI, expenseAPI };