import { expenseAPI as api } from './api';

export const expenseService = {
    // Get health check
    getHealth: async () => {
        try {
            const response = await api.get('/expenses/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    },

    // Get dashboard summary
    getDashboardSummary: async (period = 'month') => {
        try {
            const now = new Date();
            const response = await api.get(`/dashboard?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            // Return empty data structure on error
            return {
                totalIncome: 0,
                totalExpense: 0,
                netAmount: 0,
                savingsRate: 0,
                expensesByCategory: [],
                incomeBySource: [],
                recentTransactions: [],
                monthlyTrends: []
            };
        }
    },

    // Get categories - Fixed to properly handle the response
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            const categories = response.data.data || response.data || [];

            // Ensure each category has the required fields
            return categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                type: cat.type, // Should be 'INCOME' or 'EXPENSE'
                icon: cat.icon || '📁',
                color: cat.color || '#6B7280',
                isSystem: cat.isSystem || false
            }));
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Return default categories if API fails
            return [
                // Default expense categories
                { id: 'default-1', name: 'Food & Dining', type: 'EXPENSE', icon: '🍔', color: '#F59E0B' },
                { id: 'default-2', name: 'Transportation', type: 'EXPENSE', icon: '🚗', color: '#3B82F6' },
                { id: 'default-3', name: 'Shopping', type: 'EXPENSE', icon: '🛍️', color: '#8B5CF6' },
                { id: 'default-4', name: 'Entertainment', type: 'EXPENSE', icon: '🎬', color: '#EC4899' },
                { id: 'default-5', name: 'Bills & Utilities', type: 'EXPENSE', icon: '💡', color: '#10B981' },
                { id: 'default-6', name: 'Healthcare', type: 'EXPENSE', icon: '🏥', color: '#EF4444' },
                { id: 'default-7', name: 'Other', type: 'EXPENSE', icon: '📌', color: '#6B7280' },

                // Default income categories
                { id: 'default-8', name: 'Salary', type: 'INCOME', icon: '💰', color: '#10B981' },
                { id: 'default-9', name: 'Freelance', type: 'INCOME', icon: '💻', color: '#3B82F6' },
                { id: 'default-10', name: 'Investment', type: 'INCOME', icon: '📈', color: '#F59E0B' },
                { id: 'default-11', name: 'Other Income', type: 'INCOME', icon: '💵', color: '#8B5CF6' }
            ];
        }
    },

    // Create new transaction - FIXED: Removed metadata field
    createTransaction: async (transactionData) => {
        try {
            // Only send the fields that backend expects
            const payload = {
                categoryId: parseInt(transactionData.categoryId),
                amount: parseFloat(transactionData.amount), // This will be in USD (already converted)
                type: transactionData.type.toUpperCase(), // Ensure uppercase
                description: transactionData.description,
                transactionDate: transactionData.transactionDate
            };

            const response = await api.post('/transactions', payload);
            return response.data.data;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },

    // Export transactions
    exportTransactions: async (period = 'month') => {
        try {
            const now = new Date();
            const response = await api.get(`/files/export?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting transactions:', error);
            throw error;
        }
    },

    // Import transactions from file with auto-categorization
    importTransactions: async (formData) => {
        try {
            const response = await api.post('/files/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Add timeout for large files
                timeout: 30000, // 30 seconds
            });

            // Return the response data which should contain import results
            return response.data;
        } catch (error) {
            console.error('Error importing transactions:', error);

            // Enhanced error handling
            if (error.response) {
                // Server responded with error
                throw new Error(error.response.data.message || 'Import failed. Please check your file format.');
            } else if (error.request) {
                // Request made but no response
                throw new Error('Upload failed. Please check your connection and try again.');
            } else {
                // Something else happened
                throw new Error('An unexpected error occurred during import.');
            }
        }
    },

    // Get recent transactions (if needed separately)
    getRecentTransactions: async (limit = 10) => {
        try {
            const response = await api.get(`/transactions?size=${limit}&sort=transactionDate,desc`);
            return response.data.data?.content || [];
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            return [];
        }
    },

    // Get category breakdown (if needed separately)
    getCategoryBreakdown: async (period = 'month') => {
        try {
            const dashboardData = await expenseService.getDashboardSummary(period);
            return dashboardData.expensesByCategory || [];
        } catch (error) {
            console.error('Error fetching category breakdown:', error);
            return [];
        }
    },

    // Get monthly trend (if needed separately)
    getMonthlyTrend: async (months = 6) => {
        try {
            const dashboardData = await expenseService.getDashboardSummary('year');
            return dashboardData.monthlyTrends || [];
        } catch (error) {
            console.error('Error fetching monthly trend:', error);
            return [];
        }
    },

    // Download import template
    downloadImportTemplate: async () => {
        try {
            const response = await api.get('/files/template', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expense-import-template.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error downloading template:', error);
            throw new Error('Failed to download template');
        }
    },
};